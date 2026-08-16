import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getSaleReturnEligibility,
  issueCreditNoteForSaleReturn,
} from '../api/saleReturnApi';
import {
  buildAvailableReturnItems,
  buildSelectedReturnItems,
  calculateSaleReturnAmounts,
  isFullRefundReturn,
  validateSaleReturnSubmission,
} from '../create/policies/saleReturnCreatePolicy';
import SaleReturnCreateWorkspace from '../create/workspace/SaleReturnCreateWorkspace';
import SaleReturnHelpDrawer from '../help/SaleReturnHelpDrawer';
import { runCompleteSaleReturn } from '../workflows/completeSaleReturnWorkflow';

const SUBMIT_LABEL = 'ยืนยันคืนสินค้าและคืนเงิน';

const CreateReturnPage = () => {
  const { saleId, shopSlug = 'advancetech' } = useParams();
  const navigate = useNavigate();
  const [eligibility, setEligibility] = useState(null);
  const [lines, setLines] = useState({});
  const [reason, setReason] = useState('');
  const [refunds, setRefunds] = useState([{ method: 'CASH', amount: 0, sourcePaymentItemId: '' }]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    getSaleReturnEligibility(saleId).then(setEligibility).catch((err) => setError(err.response?.data?.message || err.message));
  }, [saleId]);

  const available = useMemo(() => buildAvailableReturnItems(eligibility), [eligibility]);

  const selectedItems = useMemo(() => buildSelectedReturnItems({
    available,
    lines,
    reason,
  }), [available, lines, reason]);

  const {
    eligibleTotal,
    refundTotal,
    channelTotal,
    deduction,
  } = useMemo(() => calculateSaleReturnAmounts({
    available,
    selectedItems,
    refunds,
  }), [available, selectedItems, refunds]);

  const mutationBusy = submitting || submittingRef.current;

  const selectLine = (item, selected) => {
    if (mutationBusy) return;
    setLines((current) => ({
      ...current,
      [`${item.kind}:${item.id}`]: {
        selected,
        quantity: item.kind === 'SIMPLE' ? item.eligibleQuantity : 1,
        refundAmount: item.eligibleRefund,
        reason: '',
      },
    }));
  };

  const patchLine = (item, patch) => {
    if (mutationBusy) return;
    setLines((current) => ({
      ...current,
      [`${item.kind}:${item.id}`]: { ...current[`${item.kind}:${item.id}`], ...patch },
    }));
  };

  const submit = async () => {
    if (mutationBusy) return;

    const returnReason = reason;
    const returnItems = selectedItems.map((item) => ({ ...item }));
    const refundItems = refunds
      .filter((item) => Number(item.amount) > 0)
      .map((item) => ({
        ...item,
        amount: Number(item.amount),
        sourcePaymentItemId: item.sourcePaymentItemId ? Number(item.sourcePaymentItemId) : null,
      }));
    const targetSaleId = saleId;
    const returnEligibility = eligibility;
    const returnEligibleTotal = eligibleTotal;
    const returnRefundTotal = refundTotal;
    const returnChannelTotal = channelTotal;
    const returnDeduction = deduction;

    setError('');
    const validationError = validateSaleReturnSubmission({
      selectedItems: returnItems,
      refundTotal: returnRefundTotal,
      channelTotal: returnChannelTotal,
      deduction: returnDeduction,
      reason: returnReason,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const completedReturn = await runCompleteSaleReturn({
        saleId: targetSaleId,
        reason: returnReason,
        items: returnItems,
        refunds: refundItems,
      });

      const fullRefundReturn = isFullRefundReturn({
        eligibleTotal: returnEligibleTotal,
        refundTotal: returnRefundTotal,
        saleTotal: returnEligibility.sale.totalAmount,
        deduction: returnDeduction,
      });

      if (fullRefundReturn) {
        try {
          const creditNote = await issueCreditNoteForSaleReturn({
            branchId: completedReturn.branchId,
            saleReturnId: completedReturn.saleReturnId,
          });
          const taxDocumentId = creditNote?.document?.id;
          if (!taxDocumentId) throw new Error('Credit note issuance returned no document identity.');
          navigate(
            `/${shopSlug}/pos/sales/credit-note/print/${taxDocumentId}?branchId=${completedReturn.branchId}`,
            { replace: true },
          );
          return;
        } catch (creditNoteError) {
          const code = creditNoteError.response?.data?.code || creditNoteError.response?.data?.error;
          if (code === 'TAX_CREDIT_NOTE_ORIGINAL_DOCUMENT_NOT_FOUND') {
            navigate(`/${shopSlug}/pos/sales/sale-return`, { replace: true });
            return;
          }
          setError(
            `คืนสินค้าและคืนเงินสำเร็จแล้ว แต่ยังออกใบลดหนี้ไม่สำเร็จ: ${creditNoteError.response?.data?.message || creditNoteError.message}`,
          );
          return;
        }
      }

      navigate(`/${shopSlug}/pos/sales/sale-return`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (!eligibility) return <main className="p-6">{error || 'กำลังโหลดข้อมูล...'}</main>;

  return (
    <>
      <SaleReturnCreateWorkspace
        eligibility={eligibility}
        available={available}
        lines={lines}
        reason={reason}
        refunds={refunds}
        error={error}
        submitting={mutationBusy}
        eligibleTotal={eligibleTotal}
        refundTotal={refundTotal}
        deduction={deduction}
        helpLabel="คู่มือ"
        submitLabel={SUBMIT_LABEL}
        onSelectLine={selectLine}
        onPatchLine={patchLine}
        onReasonChange={(value) => {
          if (!mutationBusy) setReason(value);
        }}
        onRefundsChange={(value) => {
          if (!mutationBusy) setRefunds(value);
        }}
        onCancel={() => {
          if (!mutationBusy) navigate(-1);
        }}
        onSubmit={submit}
        onOpenHelp={() => setHelpOpen(true)}
      />
      <SaleReturnHelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};

export default CreateReturnPage;
