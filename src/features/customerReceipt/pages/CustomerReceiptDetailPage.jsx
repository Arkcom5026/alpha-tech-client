


// src/features/customerReceipt/pages/CustomerReceiptDetailPage.jsx

import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import useCustomerReceiptStore from '../store/customerReceiptStore';
import CustomerReceiptDetailCard from '../components/CustomerReceiptDetailCard';
import CustomerReceiptAllocationTable from '../components/CustomerReceiptAllocationTable';
import CustomerReceiptCancelSection from '../components/CustomerReceiptCancelSection';

const CustomerReceiptDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedItem = useCustomerReceiptStore((state) => state.selectedItem);
  const detailLoading = useCustomerReceiptStore((state) => state.detailLoading);
  const submitting = useCustomerReceiptStore((state) => state.submitting);
  const error = useCustomerReceiptStore((state) => state.error);
  const successMessage = useCustomerReceiptStore((state) => state.successMessage);
  const getCustomerReceiptByIdAction = useCustomerReceiptStore(
    (state) => state.getCustomerReceiptByIdAction
  );
  const cancelCustomerReceiptAction = useCustomerReceiptStore(
    (state) => state.cancelCustomerReceiptAction
  );
  const clearCustomerReceiptMessagesAction = useCustomerReceiptStore(
    (state) => state.clearCustomerReceiptMessagesAction
  );
  const clearSelectedCustomerReceiptAction = useCustomerReceiptStore(
    (state) => state.clearSelectedCustomerReceiptAction
  );

  useEffect(() => {
    clearCustomerReceiptMessagesAction();

    if (id) {
      getCustomerReceiptByIdAction(Number(id)).catch(() => {});
    }

    return () => {
      clearCustomerReceiptMessagesAction();
      clearSelectedCustomerReceiptAction();
    };
  }, [
    id,
    getCustomerReceiptByIdAction,
    clearCustomerReceiptMessagesAction,
    clearSelectedCustomerReceiptAction,
  ]);

  const handleCancel = async ({ cancelReason }) => {
    if (!selectedItem?.id) return;

    await cancelCustomerReceiptAction({
      receiptId: selectedItem.id,
      cancelReason,
    });
  };

  const canAllocate =
    selectedItem?.status !== 'CANCELLED' && Number(selectedItem?.remainingAmount || 0) > 0;

  const allocatePath = selectedItem?.id
    ? `/pos/finance/customer-receipts/${selectedItem.id}/allocate`
    : '/pos/finance/customer-receipts';

  const renderBody = () => {
    if (detailLoading) {
      return (
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          <div className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white" />
        </div>
      );
    }

    if (!selectedItem) {
      return (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-base font-medium text-gray-900">ไม่พบข้อมูลใบรับเงิน</p>
          <p className="mt-1 text-sm text-gray-500">
            รายการนี้อาจไม่มีอยู่แล้ว หรือระบบยังไม่สามารถโหลดรายละเอียดได้ในขณะนี้
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
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <CustomerReceiptDetailCard item={selectedItem} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">ประวัติการตัดชำระ</h2>
                <p className="text-sm text-gray-500">
                  รายการบิลขายที่ถูกตัดจากใบรับเงินนี้ทั้งหมด
                </p>
              </div>
            </div>

            <CustomerReceiptAllocationTable allocations={selectedItem?.allocations || []} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">การดำเนินการ</h2>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                กลับหน้าก่อนหน้า
              </button>

              <Link
                to="/pos/finance/customer-receipts"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                กลับไปรายการทั้งหมด
              </Link>

              {canAllocate && (
                <Link
                  to={allocatePath}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  ไปหน้าตัดชำระ
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <CustomerReceiptCancelSection
              item={selectedItem}
              submitting={submitting}
              onSubmit={handleCancel}
            />
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
            <span className="text-gray-700">รายละเอียดใบรับเงิน</span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">
            {selectedItem?.code || 'รายละเอียดใบรับเงิน'}
          </h1>
          <p className="text-sm text-gray-600">
            ตรวจสอบข้อมูล receipt ประวัติการตัดชำระ และสถานะการใช้งานของใบรับเงินรายการนี้ภายใต้สาขาปัจจุบันจาก session
          </p>
        </div>

        {canAllocate && (
          <div className="flex flex-wrap gap-2">
            <Link
              to={allocatePath}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              ตัดชำระใบรับเงิน
            </Link>
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

export default CustomerReceiptDetailPage;




