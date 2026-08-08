import { useEffect, useMemo, useState } from 'react';
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

  const selectLine = (item, selected) => setLines((current) => ({
    ...current,
    [`${item.kind}:${item.id}`]: {
      selected,
      quantity: item.kind === 'SIMPLE' ? item.eligibleQuantity : 1,
      refundAmount: item.eligibleRefund,
      reason: '',
    },
  }));

  const patchLine = (item, patch) => setLines((current) => ({
    ...current,
    [`${item.kind}:${item.id}`]: { ...current[`${item.kind}:${item.id}`], ...patch },
  }));

  const submit = async () => {
    setError('');
    const validationError = validateSaleReturnSubmission({
      selectedItems,
      refundTotal,
      channelTotal,
      deduction,
      reason,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const completedReturn = await runCompleteSaleReturn({
        saleId,
        reason,
        items: selectedItems,
        refunds: refunds.filter((item) => Number(item.amount) > 0).map((item) => ({
          ...item,
          amount: Number(item.amount),
          sourcePaymentItemId: item.sourcePaymentItemId ? Number(item.sourcePaymentItemId) : null,
        })),
      });

      const fullRefundReturn = isFullRefundReturn({
        eligibleTotal,
        refundTotal,
        saleTotal: eligibility.sale.totalAmount,
        deduction,
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
        submitting={submitting}
        eligibleTotal={eligibleTotal}
        refundTotal={refundTotal}
        deduction={deduction}
        onSelectLine={selectLine}
        onPatchLine={patchLine}
        onReasonChange={setReason}
        onRefundsChange={setRefunds}
        onCancel={() => navigate(-1)}
        onSubmit={submit}
        onOpenHelp={() => setHelpOpen(true)}
      />
      <SaleReturnHelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};

export default CreateReturnPage;
