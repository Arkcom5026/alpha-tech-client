



// src/features/customerReceipt/pages/CustomerReceiptAllocatePage.jsx

import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import useCustomerReceiptStore from '../store/customerReceiptStore';
import CustomerReceiptDetailCard from '../components/CustomerReceiptDetailCard';
import CustomerReceiptAllocateForm from '../components/CustomerReceiptAllocateForm';

const CustomerReceiptAllocatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedItem = useCustomerReceiptStore((state) => state.selectedItem);
  const allocationCandidates = useCustomerReceiptStore((state) => state.allocationCandidates);
  const allocationCandidatesSummary = useCustomerReceiptStore(
    (state) => state.allocationCandidatesSummary
  );
  const detailLoading = useCustomerReceiptStore((state) => state.detailLoading);
  const candidatesLoading = useCustomerReceiptStore((state) => state.candidatesLoading);
  const submitting = useCustomerReceiptStore((state) => state.submitting);
  const error = useCustomerReceiptStore((state) => state.error);
  const successMessage = useCustomerReceiptStore((state) => state.successMessage);
  const getCustomerReceiptByIdAction = useCustomerReceiptStore(
    (state) => state.getCustomerReceiptByIdAction
  );
  const loadAllocationCandidateSalesAction = useCustomerReceiptStore(
    (state) => state.loadAllocationCandidateSalesAction
  );
  const allocateCustomerReceiptAction = useCustomerReceiptStore(
    (state) => state.allocateCustomerReceiptAction
  );
  const clearCustomerReceiptMessagesAction = useCustomerReceiptStore(
    (state) => state.clearCustomerReceiptMessagesAction
  );
  const clearSelectedCustomerReceiptAction = useCustomerReceiptStore(
    (state) => state.clearSelectedCustomerReceiptAction
  );
  const clearAllocationCandidatesAction = useCustomerReceiptStore(
    (state) => state.clearAllocationCandidatesAction
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
      navigate(`/pos/finance/customer-receipts/${result?.receipt?.id || receiptId}/print`);
    }

    return result;
  };

  const canAllocate =
    selectedItem?.status !== 'CANCELLED' && Number(selectedItem?.remainingAmount || 0) > 0;

  const renderBody = () => {
    if (detailLoading) {
      return (
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-white" />
        </div>
      );
    }

    if (!selectedItem) {
      return (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-base font-medium text-gray-900">ไม่พบข้อมูลใบรับเงิน</p>
          <p className="mt-1 text-sm text-gray-500">
            ระบบยังไม่สามารถโหลดข้อมูลใบรับเงินรายการนี้เพื่อทำ allocation ได้
          </p>
          <div className="mt-4">
            <Link
              to="/pos/finance/customer-receipts"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              กลับไปรายการ
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <CustomerReceiptDetailCard item={selectedItem} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">บิลขายที่พร้อมให้ตัดชำระ</h2>
                <p className="text-sm text-gray-500">
                  เลือกบิลที่ยังค้างชำระของลูกค้ารายนี้ แล้วกำหนดยอดที่จะตัดจากใบรับเงิน
                </p>
              </div>

              {allocationCandidatesSummary && (
                <div className="text-sm text-gray-500">
                  {allocationCandidatesSummary?.totalItems != null && (
                    <span>ทั้งหมด {allocationCandidatesSummary.totalItems} รายการ</span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4">
              <CustomerReceiptAllocateForm
                receipt={selectedItem}
                candidates={allocationCandidates}
                candidatesLoading={candidatesLoading}
                submitting={submitting}
                onSubmit={handleAllocate}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">คำแนะนำการตัดชำระ</h2>
            <div className="mt-3 space-y-3 text-sm text-gray-600">
              <p>1. ตรวจสอบยอดคงเหลือของใบรับเงินก่อนทุกครั้ง</p>
              <p>2. เลือกบิลที่ยังค้างชำระจริง และตัดทีละบิลอย่างระมัดระวัง</p>
              <p>3. ระบบจะไม่ให้ตัดเกินยอดคงเหลือของ receipt หรือยอดค้างของบิล</p>
              <p>4. ระบบจะโหลดบิลค้างชำระจากลูกค้าของ receipt นี้โดยอัตโนมัติภายใต้สาขาปัจจุบัน</p>
              <p>5. หากยกเลิกใบรับเงินภายหลัง ระบบจะ rollback allocation ของใบนี้ทั้งหมด</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">ทางลัด</h2>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                to={`/pos/finance/customer-receipts/${selectedItem.id}`}
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                กลับหน้ารายละเอียดใบรับเงิน
              </Link>

              <Link
                to="/pos/finance/customer-receipts"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                กลับไปรายการทั้งหมด
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/pos/finance/customer-receipts" className="transition hover:text-gray-700">
              รายการรับชำระลูกหนี้
            </Link>
            <span>/</span>
            <span className="text-gray-700">ตัดชำระใบรับเงิน</span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">
            {selectedItem?.code ? `ตัดชำระ ${selectedItem.code}` : 'ตัดชำระใบรับเงิน'}
          </h1>
          <p className="text-sm text-gray-600">
            นำยอดคงเหลือของใบรับเงินไปตัดชำระกับบิลขายที่ค้างชำระของลูกค้ารายเดียวกัน
          </p>
        </div>

        {!detailLoading && !canAllocate && selectedItem && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ใบรับเงินนี้ไม่สามารถตัดชำระเพิ่มได้แล้ว
          </div>
        )}
      </div>

      {!!error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!!successMessage && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {renderBody()}
    </div>
  );
};

export default CustomerReceiptAllocatePage;




