

//  src/features/customerReceipt/pages/PrintCustomerReceiptPage.jsx

import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useCustomerReceiptStore from '../store/customerReceiptStore';
import CustomerReceiptPrintLayout from '../components/CustomerReceiptPrintLayout';

const PrintCustomerReceiptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printedRef = useRef(false);

  const selectedItem = useCustomerReceiptStore((state) => state.selectedItem);
  const detailLoading = useCustomerReceiptStore((state) => state.detailLoading);
  const printLoading = useCustomerReceiptStore((state) => state.printLoading);
  const error = useCustomerReceiptStore((state) => state.error);
  const loadCustomerReceiptForPrintAction = useCustomerReceiptStore(
    (state) => state.loadCustomerReceiptForPrintAction
  );
  const clearCustomerReceiptMessagesAction = useCustomerReceiptStore(
    (state) => state.clearCustomerReceiptMessagesAction
  );
  const clearSelectedCustomerReceiptAction = useCustomerReceiptStore(
    (state) => state.clearSelectedCustomerReceiptAction
  );

  useEffect(() => {
    printedRef.current = false;
    clearCustomerReceiptMessagesAction();

    if (!id) return undefined;

    loadCustomerReceiptForPrintAction(Number(id)).catch(() => null);

    return () => {
      clearCustomerReceiptMessagesAction();
      clearSelectedCustomerReceiptAction();
    };
  }, [
    id,
    loadCustomerReceiptForPrintAction,
    clearCustomerReceiptMessagesAction,
    clearSelectedCustomerReceiptAction,
  ]);

  useEffect(() => {
    if (detailLoading || printLoading) return;
    if (error) return;
    if (!selectedItem?.id) return;
    if (Number(selectedItem.id) !== Number(id)) return;
    if (printedRef.current) return;

    printedRef.current = true;
    const timer = window.setTimeout(() => {
      window.print();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [detailLoading, printLoading, error, id, selectedItem]);

  const handleBack = () => {
    if (selectedItem?.id) {
      navigate(`/pos/finance/customer-receipts/${selectedItem.id}`);
      return;
    }

    navigate('/pos/finance/customer-receipts');
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          <h1 className="text-xl font-semibold">ไม่พบเลขที่ใบรับเงิน</h1>
          <p className="mt-2 text-sm">กรุณาตรวจสอบเส้นทางเอกสารก่อนพิมพ์อีกครั้ง</p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            กลับไปหน้ารายการใบรับเงิน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">พิมพ์ใบเสร็จรับเงิน</h1>
          <p className="text-sm text-gray-500">ตรวจสอบรายละเอียดก่อนพิมพ์เอกสาร</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            กลับ
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={detailLoading || printLoading || !selectedItem?.id}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            พิมพ์ใบเสร็จ
          </button>
        </div>
      </div>

      {detailLoading || printLoading ? (
        <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm print:hidden">
          กำลังโหลดข้อมูลใบรับเงิน...
        </div>
      ) : error ? (
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm print:hidden">
          <h2 className="text-lg font-semibold">ไม่สามารถโหลดข้อมูลใบรับเงินได้</h2>
          <p className="mt-2 text-sm">{error}</p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            กลับไปหน้าก่อนหน้า
          </button>
        </div>
      ) : !selectedItem?.id ? (
        <div className="mx-auto max-w-5xl rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-800 shadow-sm print:hidden">
          <h2 className="text-lg font-semibold">ไม่พบข้อมูลใบรับเงิน</h2>
          <p className="mt-2 text-sm">เอกสารที่ต้องการพิมพ์อาจถูกลบ หรือเลขที่เอกสารไม่ถูกต้อง</p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-yellow-300 bg-white px-4 py-2 text-sm font-medium text-yellow-800 transition hover:bg-yellow-100"
          >
            กลับไปหน้ารายการใบรับเงิน
          </button>
        </div>
      ) : (
        <CustomerReceiptPrintLayout receipt={selectedItem} />
      )}
    </div>
  );
};

export default PrintCustomerReceiptPage;

