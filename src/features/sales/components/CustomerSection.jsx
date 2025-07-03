import React, { useEffect, useRef, useState, useMemo } from 'react';
import InputMask from 'react-input-mask';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import useCustomerStore from '@/features/customer/store/customerStore';

const CustomerSection = ({ productSearchRef, clearTrigger, hideCustomerDetails }) => {
  const [phone, setPhone] = useState('');
  const [rawPhone, setRawPhone] = useState('');
  const [searchMode, setSearchMode] = useState('phone');
  const [nameSearch, setNameSearch] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState('บุคคลทั่วไป');
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [customerLoading, setCustomerLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingPhone, setPendingPhone] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [clearKey, setClearKey] = useState(Date.now());
  const [isClearing, setIsClearing] = useState(false);
  const [_shouldShowDetails, _setShouldShowDetails] = useState(false);
  const phoneInputRef = useRef(null);

  const setShouldShowDetails = (val) => {
    console.log('🛠️ setShouldShowDetails:', val);
    _setShouldShowDetails(val);
  };

  const {
    setCustomerDepositAmount,
    searchCustomerByPhoneAndDepositAction,
    searchCustomerByNameAndDepositAction,    
    setSelectedDeposit,
    clearCustomerAndDeposit,
  } = useCustomerDepositStore();

  const {
    updateCustomerProfileAction,
    createCustomerAction
  } = useCustomerStore();

  const { setCustomerIdAction } = useSalesStore();

  const shouldShowCustomerDetails = useMemo(() => {
    const result = Boolean(selectedCustomer?.id) && !isClearing && _shouldShowDetails;
    console.log('🧮 [COMPUTE] shouldShowCustomerDetails (no hide flag):', result);
    return result;
  }, [selectedCustomer, isClearing, _shouldShowDetails]);

  useEffect(() => {
    const timer = setTimeout(() => {
      phoneInputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (clearTrigger) {
      console.log('🧹 [CLEAR_TRIGGER] เริ่มล้างข้อมูลลูกค้า');
      setIsClearing(true);
      setClearKey(Date.now());
      setPhone('');
      setRawPhone('');
      setName('');
      setEmail('');
      setAddress('');
      setCompanyName('');
      setTaxId('');
      setCustomerType('บุคคลทั่วไป');
      setNameSearch('');
      setSearchResults([]);
      setSelectedCustomer(null);
      setCustomerDepositAmount(0);
      setSelectedDeposit(null);
      setIsModified(false);
      setFormError('');
      setPendingPhone(false);
      setCustomerIdAction(null);
      clearCustomerAndDeposit();
      setShouldShowDetails(false);
      const delay = setTimeout(() => {
        phoneInputRef.current?.focus();
        phoneInputRef.current?.select();
        console.log('🎯 [CLEAR_TRIGGER] Focus เบอร์โทรแล้ว');
        setIsClearing(false);
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [clearTrigger]);

  useEffect(() => {
    if (selectedCustomer && !isClearing) {
      console.log('📲 [SET_PHONE] กำหนดเบอร์:', selectedCustomer.phone);
      setPhone(selectedCustomer.phone);
      setName(selectedCustomer.name || '');
      setEmail(selectedCustomer.email || '');
    }
  }, [selectedCustomer, isClearing]);

  useEffect(() => {
    if (selectedCustomer && Object.keys(selectedCustomer).length > 0 && !isClearing) {
      console.log('👁️ [SET_DETAIL_TRUE] แสดงข้อมูลลูกค้า');
      setShouldShowDetails(true);
    }
  }, [selectedCustomer, isClearing]);

  useEffect(() => {
    console.log('🔍 [TRACE] selectedCustomer:', selectedCustomer);
    console.log('🔍 [TRACE] shouldShowCustomerDetails:', shouldShowCustomerDetails);
    console.log('🔍 [TRACE] shouldShowDetails (raw):', _shouldShowDetails);
    console.log('🔍 [TRACE] hideCustomerDetails (ignored):', hideCustomerDetails);
    console.log('🔍 [TRACE] isClearing:', isClearing);
    console.log('🔍 [TRACE] phone:', phone);
    console.log('🔍 [TRACE] name:', name);
    console.log('🔍 [TRACE] email:', email);
  }, [selectedCustomer, shouldShowCustomerDetails, _shouldShowDetails, hideCustomerDetails, isClearing, phone, name, email]);

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
        const found = await searchCustomerByPhoneAndDepositAction(cleanPhone);
        if (found) {
          setSelectedCustomer(found);
          setCustomerIdAction(found.id);
          setName(found.name || '');
          setEmail(found.email || '');
          setAddress(found.address || '');
          setCustomerType(found.customerType || 'บุคคลทั่วไป');
          setCompanyName(found.companyName || '');
          setTaxId(found.taxId || '');
          setIsModified(false);
          setIsClearing(false);
          setTimeout(() => {
            productSearchRef?.current?.focus();
          }, 100);
        }
        setSearchResults([]);
        setPendingPhone(true);
      } else {
        if (!nameSearch.trim()) {
          setFormError('กรุณากรอกชื่อหรือนามสกุล');
          return;
        }
        const result = await searchCustomerByNameAndDepositAction(nameSearch);
        if (result) {
          setSearchResults([result]);
        } else {
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error('ค้นหาลูกค้าไม่สำเร็จ:', error);
    } finally {
      setCustomerLoading(false);
    }
  };




    const handleSelectCustomer = (customer) => {
      setSelectedCustomer(customer);
      setCustomerIdAction(customer.id);
      setName(customer.name || '');
      setEmail(customer.email || '');
      setAddress(customer.address || '');
      setCustomerType(customer.customerType || 'บุคคลทั่วไป');
      setCompanyName(customer.companyName || '');
      setTaxId(customer.taxId || '');
      setPendingPhone(true);
      setSearchResults([]);
      setTimeout(() => {
        productSearchRef?.current?.focus();
      }, 100);
    };

    const handleUpdateCustomer = async () => {
      try {
        if (!selectedCustomer?.id) return;
        await updateCustomerProfileAction({
          id: selectedCustomer.id,
          name,
          email,
          address,
          customerType,
          companyName,
          taxId,
        });
        setIsModified(false);
      } catch (error) {
        console.error('อัปเดตข้อมูลไม่สำเร็จ:', error);
      }
    };

    const handleConfirmCreateCustomer = async () => {
      try {
        const newCustomer = await createCustomerAction({
          name,
          phone: rawPhone,
          email,
          address,
          customerType,
          companyName,
          taxId,
        });
        if (newCustomer?.id) {
          setSelectedCustomer(newCustomer);
          setCustomerIdAction(newCustomer.id);
        }
      } catch (error) {
        console.error('สร้างลูกค้าไม่สำเร็จ:', error);
      }
    };


    const handleCancelCreateCustomer = () => {
      setSelectedCustomer(null);
      setCustomerIdAction(null);
      setPhone('');
      setRawPhone('');
      setName('');
      setEmail('');
      setAddress('');
      setCompanyName('');
      setTaxId('');
      setCustomerType('บุคคลทั่วไป');
      setFormError('');
      setIsModified(false);
    };

    return (
      <div className="bg-white p-4 rounded-xl shadow min-w-[390px]">
        <h2 className="text-xl font-bold text-black">ข้อมูลลูกค้า</h2>
        <div className="flex gap-4 py-2">
          <label className="p-2 text-black text-sm">
            <input
              type="radio"
              name="searchMode"
              checked={searchMode === 'name'}
              onChange={() => setSearchMode('name')}
            />{' '}
            ค้นหาจากชื่อ
          </label>
          <label className="p-2 text-black text-sm">
            <input
              type="radio"
              name="searchMode"
              checked={searchMode === 'phone'}
              onChange={() => setSearchMode('phone')}
            />{' '}
            ค้นหาจากเบอร์โทร
          </label>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          {searchMode === 'phone' ? (
            <InputMask
              key={clearKey}
              mask="099-999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyCustomer()}
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
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyCustomer()}
              className="border rounded px-3 py-2 w-full text-black text-base"
            />
          )}
          <button
            onClick={handleVerifyCustomer}
            disabled={!phone && searchMode === 'phone'}
            className="w-full md:w-auto px-4 py-2 bg-green-500 text-blue-900 rounded hover:bg-green-700 disabled:opacity-50 text-lg"
          >
            {customerLoading ? 'ค้นหา...' : 'ค้นหา'}
          </button>
        </div>

        {formError && (
          <p className="text-red-500 text-sm mt-1">{formError}</p>
        )}

        {searchMode === 'name' && searchResults.length > 0 && (
          <div className="mt-4 border border-gray-300 rounded p-3 text-black">
            <p className="font-semibold mb-2">ผลการค้นหา:</p>
            <ul className="space-y-1">
              {searchResults.map((cust) => (
                <button
                  key={cust.id}
                  onClick={() => handleSelectCustomer(cust)}
                  className="block w-full text-left px-4 py-2 border-b"
                >
                  {cust.name} ({cust.phone})
                </button>
              ))}
            </ul>
          </div>
        )}



        {shouldShowCustomerDetails && (
          <div className="mt-2 text-lg text-black bg-white border rounded px-3 py-2 space-y-3">
            <p>📋 <strong>รายละเอียดลูกค้า</strong></p>

            {searchMode === 'phone' && !selectedCustomer?.id && pendingPhone && !selectedCustomer && (
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
                    value={companyName}
                    onChange={(e) => { setCompanyName(e.target.value); setIsModified(true); }}
                    className="border px-2 py-1 rounded col-span-2 text-black text-sm"
                  />
                  <input
                    type="text"
                    placeholder="เลขผู้เสียภาษี (ถ้ามี)"
                    value={taxId}
                    onChange={(e) => { setTaxId(e.target.value); setIsModified(true); }}
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
              {selectedCustomer ? (
                <button
                  onClick={handleUpdateCustomer}
                  disabled={!isModified}
                  className={`px-4 py-1 text-white rounded hover:bg-blue-700 text-lg ${isModified ? 'bg-blue-500' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  อัปเดตข้อมูล
                </button>
              ) : (
                searchMode === 'phone' && !selectedCustomer && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleConfirmCreateCustomer}
                      className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-lg"
                    >
                      บันทึก
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

  export default CustomerSection;
