import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';
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
  const saleContextRef = useRef({ saleId, shopSlug });
  const eligibilityRequestRef = useRef(0);

  useEffect(() => {
    saleContextRef.current = { saleId, shopSlug };
    const requestId = eligibilityRequestRef.current + 1;
    eligibilityRequestRef.current = requestId;
    setEligibility(null);
    setLines({});
    setReason('');
    setRefunds([{ method: 'CASH', amount: 0, sourcePaymentItemId: '' }]);
    setError('');

    getSaleReturnEligibility(saleId)
      .then((result) => {
        if (eligibilityRequestRef.current !== requestId) return;
        if (String(saleContextRef.current.saleId) !== String(saleId)) return;
        setEligibility(result);
      })
      .catch((requestError) => {
        if (eligibilityRequestRef.current !== requestId) return;
        if (String(saleContextRef.current.saleId) !== String(saleId)) return;
        setError(requestError.response?.data?.message || requestError.message);
      });
  }, [saleId, shopSlug]);

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
    const targetShopSlug = shopSlug;
    const returnEligibility = eligibility;
    const returnEligibleTotal = eligibleTotal;
    const returnRefundTotal = refundTotal;
    const returnChannelTotal = channelTotal;
    const returnDeduction = deduction;
    const eventKey = `sale-return:${targetSaleId}`;

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

      feedback.actionSuccess('คืนสินค้าและคืนเงินเรียบร้อยแล้ว', `${eventKey}:complete:success`);

      const contextStillOwned =
        String(saleContextRef.current.saleId) === String(targetSaleId) &&
        String(saleContextRef.current.shopSlug) === String(targetShopSlug);
      if (!contextStillOwned) {
        feedback.actionError(
          new Error('Sale return completed after route context changed.'),
          'คืนสินค้าและคืนเงินสำเร็จแล้ว แต่หน้าจอเปลี่ยนไปยังรายการขายอื่นก่อนดำเนินการขั้นถัดไป',
          `${eventKey}:context-changed-after-complete:error`,
        );
        return;
      }

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

          const creditNoteContextStillOwned =
            String(saleContextRef.current.saleId) === String(targetSaleId) &&
            String(saleContextRef.current.shopSlug) === String(targetShopSlug);
          if (!creditNoteContextStillOwned) {
            feedback.actionError(
              new Error('Credit note issued after route context changed.'),
              'คืนสินค้าและออกใบลดหนี้สำเร็จแล้ว แต่หน้าจอเปลี่ยนไปยังรายการขายอื่นก่อนเปิดเอกสาร',
              `${eventKey}:credit-note:context-changed:error`,
            );
            return;
          }

          navigate(
            `/${targetShopSlug}/pos/sales/credit-note/print/${taxDocumentId}?branchId=${completedReturn.branchId}`,
            { replace: true },
          );
          return;
        } catch (creditNoteError) {
          const code = creditNoteError.response?.data?.code || creditNoteError.response?.data?.error;
          if (code === 'TAX_CREDIT_NOTE_ORIGINAL_DOCUMENT_NOT_FOUND') {
            navigate(`/${targetShopSlug}/pos/sales/sale-return`, { replace: true });
            return;
          }
          const partialMessage = `คืนสินค้าและคืนเงินสำเร็จแล้ว แต่ยังออกใบลดหนี้ไม่สำเร็จ: ${creditNoteError.response?.data?.message || creditNoteError.message}`;
          setError(partialMessage);
          feedback.actionError(
            creditNoteError,
            partialMessage,
            `${eventKey}:credit-note:error`,
          );
          return;
        }
      }

      navigate(`/${targetShopSlug}/pos/sales/sale-return`, { replace: true });
    } catch (requestError) {
      const message = requestError.response?.data?.message || requestError.message;
      setError(message);
      feedback.actionError(requestError, message || 'คืนสินค้าและคืนเงินไม่สำเร็จ', `${eventKey}:complete:error`);
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
