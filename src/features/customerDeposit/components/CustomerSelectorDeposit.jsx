// CustomerSelectorDeposit.jsx

import React, { useEffect, useRef, useState } from 'react';
import InputMask from 'react-input-mask';
import useCustomerStore from '@/features/customer/store/customerStore';

const CustomerSelectorDeposit = () => {
  const phoneInputRef = useRef(null);
  const [phone, setPhone] = useState('');
  const [rawPhone, setRawPhone] = useState('');
  const [searchMode, setSearchMode] = useState('phone');
  const [nameSearch, setNameSearch] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState('บุคคลทั่วไป');
  const [customerLoading, setCustomerLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingPhone, setPendingPhone] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const {
    customer,
    searchCustomerByPhoneAction,
    searchCustomerByNameAction,
    createCustomerAction,
    updateCustomerProfileAction,
    setCustomer: setCustomerToStore,
  } = useCustomerStore();

  useEffect(() => {
    if (customer?.id) {
      setName(customer.name || '');
      setEmail(customer.email || '');
      setAddress(customer.address || '');
      setCustomerType(customer.customerType || 'บุคคลทั่วไป');
      setCustomerToStore(customer);
    }
  }, [customer]);

  const handleVerifyCustomer = async () => {
    setFormError('');
    try {
      setCustomerLoading(true);
      setSelectedCustomer(null);
      if (searchMode === 'phone') {
        const cleanPhone = phone.replace(/-/g, '');
        if (!/^[0-9]{10}$/.test(cleanPhone)) {
          setFormError('กรุณากรอกเบอร์โทรให้ถูกต้อง');
          return;
        }
        setRawPhone(cleanPhone);
        await searchCustomerByPhoneAction(cleanPhone);
        setSearchResults([]);
        setPendingPhone(true);
      } else {
        if (!nameSearch.trim()) {
          setFormError('กรุณากรอกชื่อหรือนามสกุล');
          return;
        }
        const results = await searchCustomerByNameAction(nameSearch);
        setSearchResults(results || []);
      }
    } catch (error) {
      console.error('ค้นหาลูกค้าไม่สำเร็จ:', error);
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setCustomerToStore(cust);
    setSearchResults([]);
    setName(cust.name || '');
    setEmail(cust.email || '');
    setAddress(cust.address || '');
    setCustomerType(cust.customerType || 'บุคคลทั่วไป');
    setPhone(cust.phone || '');
    setRawPhone(cust.phone || '');
  };

  const handleConfirmCreateCustomer = async () => {
    try {
      const newCustomer = await createCustomerAction({
        name,
        phone: rawPhone,
        email,
        address,
        customerType,
      });
      setCustomerToStore(newCustomer);
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
    setNameSearch('');
    setSearchResults([]);
    setSelectedCustomer(null);
  };

  const isSearchDisabled =
    customerLoading ||
    (searchMode === 'phone'
      ? phone.replace(/-/g, '').length !== 10
      : nameSearch.trim().length === 0);

  const shouldShowCustomerDetails =
    (searchMode === 'phone' && !searchResults.length) || selectedCustomer;

  return (
    <div className="bg-white p-4 rounded-xl shadow  min-w-[1080px] ">
      <h2 className="text-xl font-bold text-black">ข้อมูลลูกค้า</h2>
      <div className="flex gap-4 py-2">
        <label className="p-2 text-black text-sm">
          <input
            type="radio"
            name="searchMode"
            checked={searchMode === 'name'}
            onChange={() => setSearchMode('name')}
          />{' '}ค้นหาจากชื่อ
        </label>
        <label className="p-2 text-black text-sm">
          <input
            type="radio"
            name="searchMode"
            checked={searchMode === 'phone'}
            onChange={() => setSearchMode('phone')}
          />{' '}ค้นหาจากเบอร์โทร
        </label>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
        {searchMode === 'phone' ? (
          <InputMask
            mask="099-999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isSearchDisabled && handleVerifyCustomer()}
          >
            {(inputProps) => (
              <input
                {...inputProps}
                ref={phoneInputRef}
                type="tel"
                placeholder="เบอร์โทรลูกค้า (0xx-xxx-xxxx)"
                className="border rounded px-3 py-2 w-full text-black text-lg"
              />
            )}
          </InputMask>
        ) : (
          <input
            type="text"
            placeholder="ค้นหาชื่อลูกค้าหรือนามสกุล"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isSearchDisabled && handleVerifyCustomer()}
            className="border rounded px-3 py-2 w-full text-black text-base"
          />
        )}

        <button
          onClick={handleVerifyCustomer}
          disabled={isSearchDisabled}
          className="w-full md:w-auto px-4 py-2 bg-green-500 text-blue-900 rounded hover:bg-green-700 disabled:opacity-50 text-lg"
        >
          {customerLoading ? 'กำลังค้นหา...' : 'ค้นหา'}
        </button>
      </div>

      {formError && (
        <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded text-lg mt-2">
          ⚠️ {formError}
        </div>
      )}

      {searchMode === 'name' && searchResults.length > 0 && (
        <div className="mt-4 border border-gray-300 rounded p-3 text-black">
          <p className="font-semibold mb-2">ผลการค้นหา:</p>
          <ul className="space-y-1">
            {searchResults.map((cust) => (
              <li
                key={cust.id}
                onClick={() => handleSelectCustomer(cust)}
                className="cursor-pointer hover:bg-blue-100 px-3 py-1 rounded"
              >
                {cust.name} ({cust.phone})
              </li>
            ))}
          </ul>
        </div>
      )}



      {shouldShowCustomerDetails && (
        <div className="mt-2 text-lg text-black bg-white border rounded px-3 py-2 space-y-3">
          <p>📋 <strong>รายละเอียดลูกค้า</strong></p>

          {searchMode === 'phone' && !customer?.id && pendingPhone && !selectedCustomer && (
            <p>เบอร์: <strong>{phone}</strong> ถูกต้องใช่ไหม?</p>
          )}

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-base font-medium text-black mb-1">ประเภทลูกค้า:</label>
              <div className="flex gap-4 text-sm text-black">
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
                  className="border px-2 py-1 rounded col-span-2 text-black text-sm"
                />
                <input
                  type="text"
                  placeholder="เลขผู้เสียภาษี (ถ้ามี)"
                  className="border px-2 py-1 rounded col-span-2 text-black text-sm"
                />
              </>
            )}

            <input
              type="text"
              placeholder="ชื่อ"
              value={name}
              onChange={(e) => { setName(e.target.value); setIsModified(true); }}
              className="border px-2 py-1 rounded col-span-2 text-black text-base"
            />

            <input
              type="email"
              placeholder="อีเมล (ถ้ามี)"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setIsModified(true); }}
              className="border px-2 py-1 rounded col-span-2 text-black text-base"
            />

            {!email && (
              <p className="text-base text-gray-500 italic col-span-2">
                * ลูกค้ารายนี้ยังไม่มีอีเมลในระบบ
              </p>
            )}

            <textarea
              placeholder="ที่อยู่ (ถ้ามี)"
              value={address}
              onChange={(e) => { setAddress(e.target.value); setIsModified(true); }}
              className="border px-2 py-1 rounded col-span-2 text-black text-base"
            />
          </div>

          <div className="pt-2 flex gap-3 justify-end">
            {customer?.id || selectedCustomer ? (
              <button
                onClick={handleUpdateCustomer}
                disabled={!isModified}
                className={`px-4 py-1 text-white rounded hover:bg-blue-700 text-lg ${isModified ? 'bg-blue-500' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                อัปเดตข้อมูล
              </button>
            ) : (
              searchMode === 'phone' && !customer?.id && !selectedCustomer && (
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmCreateCustomer}
                    className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-lg"
                  >
                    ➕ บันทึกลูกค้าใหม่
                  </button>
                  <button
                    onClick={handleCancelCreateCustomer}
                    className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-lg"
                  >
                    ยกเลิก
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelectorDeposit;

