import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useCustomerReceiptStore from '../store/customerReceiptStore';
import CustomerReceiptAllocationHeader from '../allocation/workspace/components/CustomerReceiptAllocationHeader';
import CustomerReceiptAllocationMessages from '../allocation/workspace/components/CustomerReceiptAllocationMessages';
import CustomerReceiptAllocationBody from '../allocation/workspace/components/CustomerReceiptAllocationBody';
import CustomerReceiptAllocationAside from '../allocation/workspace/components/CustomerReceiptAllocationAside';

const CustomerReceiptAllocatePage = () => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();

  const receiptListPath = shopSlug
    ? `/${shopSlug}/pos/finance/customer-receipts`
    : '/pos/finance/customer-receipts';

  const buildReceiptPath = (segment = '') => `${receiptListPath}${segment}`;

  const selectedItem = useCustomerReceiptStore((state) => state.selectedItem);
  const allocationCandidates = useCustomerReceiptStore((state) => state.allocationCandidates);
  const allocationCandidatesSummary = useCustomerReceiptStore(
    (state) => state.allocationCandidatesSummary,
  );
  const detailLoading = useCustomerReceiptStore((state) => state.detailLoading);
  const candidatesLoading = useCustomerReceiptStore((state) => state.candidatesLoading);
  const submitting = useCustomerReceiptStore((state) => state.submitting);
  const error = useCustomerReceiptStore((state) => state.error);
  const successMessage = useCustomerReceiptStore((state) => state.successMessage);
  const getCustomerReceiptByIdAction = useCustomerReceiptStore(
    (state) => state.getCustomerReceiptByIdAction,
  );
  const loadAllocationCandidateSalesAction = useCustomerReceiptStore(
    (state) => state.loadAllocationCandidateSalesAction,
  );
  const allocateCustomerReceiptAction = useCustomerReceiptStore(
    (state) => state.allocateCustomerReceiptAction,
  );
  const clearCustomerReceiptMessagesAction = useCustomerReceiptStore(
    (state) => state.clearCustomerReceiptMessagesAction,
  );
  const clearSelectedCustomerReceiptAction = useCustomerReceiptStore(
    (state) => state.clearSelectedCustomerReceiptAction,
  );
  const clearAllocationCandidatesAction = useCustomerReceiptStore(
    (state) => state.clearAllocationCandidatesAction,
  );

  useEffect(() => {
    clearCustomerReceiptMessagesAction();

    const run = async () => {
      if (!id) return;

      const receipt = await getCustomerReceiptByIdAction(Number(id)).catch(() => null);
      if (!receipt) return;

      if (receipt?.customerId) {
        await loadAllocationCandidateSalesAction(receipt.id, {
          page: 1,
          limit: 50,
        }).catch(() => {});
      }
    };

    run();

    return () => {
      clearCustomerReceiptMessagesAction();
      clearSelectedCustomerReceiptAction();
      clearAllocationCandidatesAction();
    };
  }, [
    id,
    getCustomerReceiptByIdAction,
    loadAllocationCandidateSalesAction,
    clearCustomerReceiptMessagesAction,
    clearSelectedCustomerReceiptAction,
    clearAllocationCandidatesAction,
  ]);

  const handleAllocate = async ({ saleId, amount, note, allocations = [] }) => {
    if (!selectedItem?.id) return;

    const receiptId = Number(selectedItem.id);
    let result = null;

    if (Array.isArray(allocations) && allocations.length > 0) {
      for (const allocation of allocations) {
        const nextSaleId = Number(allocation?.saleId);
        const nextAmount = Number(allocation?.amount || 0);
        if (!nextSaleId || nextAmount <= 0) continue;

        result = await allocateCustomerReceiptAction({
          receiptId,
          saleId: nextSaleId,
          amount: nextAmount,
          note: allocation?.note ?? note ?? null,
        });
      }
    } else {
      result = await allocateCustomerReceiptAction({
        receiptId,
        saleId,
        amount,
        note,
      });
    }

    await getCustomerReceiptByIdAction(receiptId).catch(() => null);

    if (selectedItem?.customerId) {
      await loadAllocationCandidateSalesAction(receiptId, {
        page: 1,
        limit: 50,
      }).catch(() => {});
    }

    if (result?.receipt?.id || receiptId) {
      navigate(buildReceiptPath(`/${result?.receipt?.id || receiptId}/print`));
    }

    return result;
  };

  const canAllocate =
    selectedItem?.status !== 'CANCELLED' && Number(selectedItem?.remainingAmount || 0) > 0;

  const allocationBody = (
    <CustomerReceiptAllocationBody
      detailLoading={detailLoading}
      receipt={selectedItem}
      receiptListPath={receiptListPath}
      candidates={allocationCandidates}
      candidatesSummary={allocationCandidatesSummary}
      candidatesLoading={candidatesLoading}
      submitting={submitting}
      onSubmit={handleAllocate}
    />
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <CustomerReceiptAllocationHeader
        receiptListPath={receiptListPath}
        receiptCode={selectedItem?.code}
        detailLoading={detailLoading}
        canAllocate={canAllocate}
        hasReceipt={!!selectedItem}
      />

      <CustomerReceiptAllocationMessages
        error={error}
        successMessage={successMessage}
      />

      {selectedItem && !detailLoading ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          {allocationBody}
          <CustomerReceiptAllocationAside
            receiptListPath={receiptListPath}
            receiptDetailPath={buildReceiptPath(`/${selectedItem.id}`)}
          />
        </div>
      ) : allocationBody}
    </div>
  );
};

export default CustomerReceiptAllocatePage;
