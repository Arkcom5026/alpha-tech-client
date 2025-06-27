import React, { useEffect, useRef, useState } from 'react';
import InputMask from 'react-input-mask';
import useCustomerStore from '@/features/customer/store/customerStore';

const CustomerSection = () => {
  const phoneInputRef = useRef(null);
  const [phone, setPhone] = useState('');
  const [rawPhone, setRawPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState('บุคคลทั่วไป');
  const [customerLoading, setCustomerLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingPhone, setPendingPhone] = useState(true);
  const [isModified, setIsModified] = useState(false);

  const {
    customer,
    searchCustomerByPhoneAction,
    createCustomerAction,
    updateCustomerProfileAction,
  } = useCustomerStore();

  useEffect(() => {
    if (customer?.id) {
      setName(customer.name || '');
      setEmail(customer.email || '');
      setAddress(customer.address || '');
      setCustomerType(customer.customerType || 'บุคคลทั่วไป');
    }
  }, [customer]);

  const handleVerifyPhone = async () => {
    const cleanPhone = phone.replace(/-/g, '');
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      setFormError('กรุณากรอกเบอร์โทรให้ถูกต้อง');
      return;
    }
    setFormError('');
    try {
      setCustomerLoading(true);
      setRawPhone(cleanPhone);
      await searchCustomerByPhoneAction(cleanPhone);
      setPendingPhone(true);
    } catch (error) {
      console.error('ค้นหาลูกค้าไม่สำเร็จ:', error);
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleConfirmCreateCustomer = async () => {
    try {
      await createCustomerAction({
        name,
        phone: rawPhone,
        email,
        address,
        customerType,
      });
    } catch (error) {
      console.error('เพิ่มลูกค้าไม่สำเร็จ:', error);
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      await updateCustomerProfileAction({
        name,
        email,
        address,
        customerType,
      });
      setIsModified(false);
    } catch (error) {
      console.error('อัปเดตลูกค้าไม่สำเร็จ:', error);
    }
  };

  const handleCancelCreateCustomer = () => {
    setPendingPhone(false);
    setName('');
    setEmail('');
    setAddress('');
    setPhone('');
  };

  return (
    <div className="bg-blue-200 p-4 rounded-xl shadow space-y-4">
      {/* เบอร์โทร + ตรวจสอบลูกค้า */}
      <h2 className="text-lg font-semibold text-gray-700">ข้อมูลลูกค้า</h2>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
        <div className="w-full md:w-64">
          <InputMask mask="099-999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleVerifyPhone()}>
            {(inputProps) => (
              <input
                {...inputProps}
                ref={phoneInputRef}
                type="tel"
                placeholder="เบอร์โทรลูกค้า (0xx-xxx-xxxx)"
                className="border rounded px-3 py-2 w-full"
              />
            )}
          </InputMask>
        </div>

        <button
          onClick={handleVerifyPhone}
          disabled={customerLoading || !/^[0-9]{10}$/.test(phone.replace(/-/g, ''))}
          className="w-full md:w-auto px-4 py-2 bg-green-400 text-blue-900 rounded hover:bggreen-600 disabled:opacity-50"
        >
          {customerLoading ? 'กำลังตรวจสอบ...' : 'ยืนยันเบอร์ลูกค้า'}
        </button>
      </div>

      {formError && (
        <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded text-sm">⚠️ {formError}</div>
      )}

      <div className="mt-2 text-sm text-yellow-700 bg-blue-100 border border-blue-600 rounded px-3 py-2 space-y-3">
        <p>📋 <strong>รายละเอียดลูกค้า</strong></p>
        {customer?.id ? null : <p>เบอร์: <strong>{phone}</strong> ถูกต้องใช่ไหม?</p>}

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทลูกค้า:</label>
            <div className="flex gap-4 text-sm">
              <label>
                <input
                  type="radio"
                  name="customerType"
                  value="บุคคลทั่วไป"
                  className="mr-1"
                  checked={customerType === 'บุคคลทั่วไป'}
                  onChange={() => setCustomerType('บุคคลทั่วไป')}
                /> บุคคลทั่วไป
              </label>
              <label>
                <input
                  type="radio"
                  name="customerType"
                  value="นิติบุคคล"
                  className="mr-1"
                  checked={customerType === 'นิติบุคคล'}
                  onChange={() => setCustomerType('นิติบุคคล')}
                /> นิติบุคคล
              </label>
            </div>
          </div>
          {customerType === 'นิติบุคคล' && (
            <>
              <input
                type="text"
                placeholder="ชื่อบริษัท / หน่วยงาน"
                className="border px-2 py-1 rounded col-span-2"
              />
              <input
                type="text"
                placeholder="เลขผู้เสียภาษี (ถ้ามี)"
                className="border px-2 py-1 rounded col-span-2"
              />
            </>
          )}
          <input type="text" placeholder="ชื่อ" value={name} onChange={(e) => { setName(e.target.value); setIsModified(true); }} className="border px-2 py-1 rounded" />

          <input type="email" placeholder="อีเมล (ถ้ามี)" value={email} onChange={(e) => { setEmail(e.target.value); setIsModified(true); }} className="border px-2 py-1 rounded col-span-2" />
          {!email && (
            <p className="text-xs text-gray-500 italic col-span-2">
              * ลูกค้ารายนี้ยังไม่มีอีเมลในระบบ
            </p>
          )}
          <textarea placeholder="ที่อยู่ (ถ้ามี)" value={address} onChange={(e) => { setAddress(e.target.value); setIsModified(true); }} className="border px-2 py-1 rounded col-span-2" />
        </div>

        <div className="pt-2 flex gap-3">
          {customer?.id ? (
            <button
              onClick={handleUpdateCustomer}
              disabled={!isModified}
              className={`px-4 py-1 text-white rounded hover:bg-blue-700 ${isModified ? 'bg-blue-500' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              อัปเดตข้อมูล
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleConfirmCreateCustomer}
                className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                ➕ บันทึกลูกค้าใหม่
              </button>
              <button
                onClick={handleCancelCreateCustomer}
                className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                ยกเลิก
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSection;
