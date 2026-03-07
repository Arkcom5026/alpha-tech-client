


// src/features/customerReceipt/pages/CreateCustomerReceiptPage.jsx

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useCustomerReceiptStore from '../store/customerReceiptStore';
import CustomerReceiptForm from '../components/CustomerReceiptForm';

const CreateCustomerReceiptPage = () => {
  const navigate = useNavigate();
  const submitting = useCustomerReceiptStore((state) => state.submitting);
  const error = useCustomerReceiptStore((state) => state.error);
  const successMessage = useCustomerReceiptStore((state) => state.successMessage);
  const selectedItem = useCustomerReceiptStore((state) => state.selectedItem);
  const createCustomerReceiptAction = useCustomerReceiptStore(
    (state) => state.createCustomerReceiptAction,
  );
  const clearCustomerReceiptMessagesAction = useCustomerReceiptStore(
    (state) => state.clearCustomerReceiptMessagesAction,
  );
  const clearSelectedCustomerReceiptAction = useCustomerReceiptStore(
    (state) => state.clearSelectedCustomerReceiptAction,
  );


  useEffect(() => {
    clearCustomerReceiptMessagesAction();
    clearSelectedCustomerReceiptAction();

    return () => {
      clearCustomerReceiptMessagesAction();
    };
  }, [clearCustomerReceiptMessagesAction, clearSelectedCustomerReceiptAction]);

  const handleSubmit = async (formData) => {
    const createdReceipt = await createCustomerReceiptAction(formData);

    if (createdReceipt?.id) {
      navigate(`/pos/finance/customer-receipts/${createdReceipt.id}`);
    }
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
            <span className="text-gray-700">สร้างใบรับเงิน</span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">สร้างใบรับเงินลูกหนี้</h1>
          <p className="text-sm text-gray-600">
            บันทึกรับเงินจากลูกค้า/หน่วยงานเพื่อใช้ตัดชำระกับบิลขายภายหลัง โดยทำงานภายใต้สาขาปัจจุบันจาก session ของผู้ใช้
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/pos/finance/customer-receipts"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            กลับไปรายการ
          </Link>
        </div>
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
          <CustomerReceiptForm submitting={submitting} onSubmit={handleSubmit} />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">แนวทางการใช้งาน</h2>
            <div className="mt-3 space-y-3 text-sm text-gray-600">
              <p>1. เลือกลูกค้า/หน่วยงานที่มาชำระเงิน</p>
              <p>2. ระบุยอดรับเงิน วิธีชำระ และข้อมูลอ้างอิงให้ครบถ้วน</p>
              <p>3. บันทึกใบรับเงินก่อน แล้วค่อยนำไปตัดชำระแต่ละบิลในขั้นตอนถัดไป</p>
              <p>4. ระบบจะอ้างอิงสาขาจาก session อัตโนมัติ ไม่ต้องกรอกสาขาเอง</p>
              <p>5. ระบบจะไม่กระทบ Payment core ของการขายปกติ</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">สถานะล่าสุด</h2>
            <div className="mt-3 text-sm text-gray-600">
              {selectedItem?.code ? (
                <div className="space-y-1">
                  <p>
                    สร้างล่าสุด: <span className="font-medium text-gray-900">{selectedItem.code}</span>
                  </p>
                  <p>สามารถเข้าไปดูรายละเอียดและตัดชำระบิลต่อได้ทันที</p>
                </div>
              ) : (
                <p>ยังไม่มีรายการที่เพิ่งสร้างใน session นี้</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerReceiptPage;








