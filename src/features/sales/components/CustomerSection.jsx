// CustomerSection component
import React, { useEffect, useRef, useState, useMemo } from 'react';
import InputMask from 'react-input-mask';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import useCustomerStore from '@/features/customer/store/customerStore';

// ✨ รับ Prop onSaleModeSelect เพิ่มเข้ามา
const CustomerSection = ({ productSearchRef, clearTrigger, hideCustomerDetails, onSaleModeSelect }) => {
  const [phone, setPhone] = useState('');
  const [rawPhone, setRawPhone] = useState('');
  const [searchMode, setSearchMode] = useState('phone');
  const [nameSearch, setNameSearch] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  // ✨ เปลี่ยนการจัดการ customerType ให้ใช้ค่าที่ตรงกับ Prisma
  // เพิ่ม 'GOVERNMENT' เข้ามาในตัวเลือก
  const [customerType, setCustomerType] = useState('INDIVIDUAL'); // 'INDIVIDUAL' | 'ORGANIZATION' | 'GOVERNMENT'
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
    const result = (!isClearing && (_shouldShowDetails || pendingPhone));
    console.log('🧮 [COMPUTE] shouldShowCustomerDetails (no hide flag):', result);
    return result;
  }, [selectedCustomer, isClearing, _shouldShowDetails]);

  useEffect(() => {
    // กำหนด focus ไปที่ช่องเบอร์โทรศัพท์เมื่อ Component โหลดครั้งแรก
    const timer = setTimeout(() => {
      phoneInputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // เมื่อมีการทริกเกอร์การล้างข้อมูล
    if (clearTrigger) {

      setIsClearing(true);
      setClearKey(Date.now());
      setPhone('');
      setRawPhone('');
      setName('');
      setEmail('');
      setAddress('');
      setCompanyName('');
      setTaxId('');
      setCustomerType('INDIVIDUAL'); // ✨ รีเซ็ตเป็นค่าเริ่มต้น
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
  }, [clearTrigger, setCustomerIdAction, clearCustomerAndDeposit, setCustomerDepositAmount, setSelectedDeposit]);

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

  const processSelectedCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerIdAction(customer.id);
    setName(customer.name || '');
    setEmail(customer.email || '');
    setAddress(customer.address || '');
    setCustomerType(customer.type || 'INDIVIDUAL'); // ✨ ใช้ค่า type จาก DB โดยตรง
    setCompanyName(customer.companyName || ''); // ✨ ดึงข้อมูล companyName
    setTaxId(customer.taxId || '');
    setIsModified(false);
    setIsClearing(false);
    setSearchResults([]);
    setShouldShowDetails(true);

    // ✨ ปรับ logic ให้เรียก onSaleModeSelect('CASH') ทันที
    onSaleModeSelect('CASH');
    setTimeout(() => {
      productSearchRef?.current?.focus();
    }, 100);
  };

  const handleVerifyCustomer = async () => {
    setFormError('');
    try {
      setCustomerLoading(true);
      setSelectedCustomer(null);
      if (searchMode === 'phone') {
        const cleanPhone = phone.replace(/-/g, '');
        if (!/^[0-9]{10}$/.test(cleanPhone)) {
          setFormError('กรุณากรอกเบอร์โทรให้ถูกต้อง (10 หลัก)');
          setCustomerLoading(false);
          return;
        }
        setRawPhone(cleanPhone);
        const found = await searchCustomerByPhoneAndDepositAction(cleanPhone);
        if (found) {
          processSelectedCustomer(found);
        } else {
          setPendingPhone(true);
          setShouldShowDetails(true);
          setName('');
          setEmail('');
          setAddress('');
          setCompanyName('');
          setTaxId('');
          setCustomerType('INDIVIDUAL'); // ✨ รีเซ็ตเป็นค่าเริ่มต้น
          setTimeout(() => {
            const nameInput = document.getElementById('customer-name-input');
            if (nameInput) nameInput.focus();
          }, 100);
        }
        setSearchResults([]);
      } else {
        if (!nameSearch.trim()) {
          setFormError('กรุณากรอกชื่อหรือนามสกุลเพื่อค้นหา');
          setCustomerLoading(false);
          return;
        }
        const result = await searchCustomerByNameAndDepositAction(nameSearch);
        if (result) {
          setSearchResults([result]);
        } else {
          setSearchResults([]);
          setPendingPhone(true);
          setShouldShowDetails(true);
          setName('');
          setEmail('');
          setAddress('');
          setCompanyName('');
          setTaxId('');
          setCustomerType('INDIVIDUAL');
          setTimeout(() => {
            const nameInput = document.getElementById('customer-name-input');
            if (nameInput) nameInput.focus();
          }, 100);
        }
      }
    } catch (error) {
      console.error('ค้นหาลูกค้าไม่สำเร็จ:', error);
      setFormError('เกิดข้อผิดพลาดในการค้นหาลูกค้า');
    } finally {
      setCustomerLoading(false);
    }
  };


  const handleSelectCustomer = (customer) => {
    processSelectedCustomer(customer);
  };

  const handleUpdateCustomer = async () => {
    try {
      if (!selectedCustomer?.id) return;
      await updateCustomerProfileAction({
        id: selectedCustomer.id,
        name,
        email,
        address,
        type: customerType, // ✨ ส่งค่า type ที่ถูกต้อง
        companyName,
        taxId,
      });
      setIsModified(false);
      alert('อัปเดตข้อมูลลูกค้าสำเร็จ!');
    } catch (error) {
      console.error('อัปเดตข้อมูลไม่สำเร็จ:', error);
      alert('อัปเดตข้อมูลลูกค้าไม่สำเร็จ!');
    }
  };

  const handleConfirmCreateCustomer = async () => {
    setFormError('');
    if (!name.trim()) {
      setFormError('กรุณากรอกชื่อลูกค้า');
      return;
    }
    try {
      const newCustomer = await createCustomerAction({
        name,
        phone: rawPhone,
        email,
        address,
        type: customerType,
        companyName,
        taxId,
      });
      if (newCustomer?.id) {
        setSelectedCustomer(newCustomer);
        setCustomerIdAction(newCustomer.id);
        setCustomer(newCustomer); // ✅ เพิ่มบรรทัดนี้ เพื่อ set ค่า customer ใน store
        alert('สร้างลูกค้าใหม่สำเร็จ!');
        setShouldShowDetails(true);
        setTimeout(() => {
          productSearchRef?.current?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('สร้างลูกค้าไม่สำเร็จ:', error);
      setFormError('สร้างลูกค้าไม่สำเร็จ: ' + (error.message || 'เกิดข้อผิดพลาด'));
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
    setCustomerType('INDIVIDUAL'); // ✨ รีเซ็ตเป็นค่าเริ่มต้น
    setFormError('');
    setIsModified(false);
    setPendingPhone(false);
    setShouldShowDetails(false);
    phoneInputRef.current?.focus();
  };

  return (
    <div className="bg-white p-4  min-w-[390px] relative">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
  {(customerType === 'ORGANIZATION' || customerType === 'GOVERNMENT') && companyName
  
    ? 'หน่วยงาน'  
    : 'ข้อมูลลูกค้า'}
     {/* `หน่วยงาน : ${companyName}` */}

   
</h2>
      <div className="flex gap-4 mb-4">
        <label className="flex items-center space-x-2 text-gray-700">
          <input
            type="radio"
            name="searchMode"
            checked={searchMode === 'name'}
            onChange={() => setSearchMode('name')}
            className="form-radio text-blue-600"
          />
          <span>ค้นหาจากชื่อ</span>
        </label>
        <label className="flex items-center space-x-2 text-gray-700">
          <input
            type="radio"
            name="searchMode"
            checked={searchMode === 'phone'}
            onChange={() => setSearchMode('phone')}
            className="form-radio text-blue-600"
          />
          <span>ค้นหาจากเบอร์โทร</span>
        </label>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 mb-4">
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
                id="customer-phone-input"
                type="tel"
                placeholder="เบอร์โทรลูกค้า (0xx-xxx-xxxx)"
                className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-800 text-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
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
            className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-800 text-base focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        )}
        <button
          onClick={handleVerifyCustomer}
          disabled={
            (searchMode === 'phone' && !phone) ||
            (searchMode === 'name' && !nameSearch.trim()) ||
            customerLoading
          }
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-md flex items-center justify-center"
        >
          {customerLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 002 8z" clipRule="evenodd" />
              </svg>
              ค้นหา
            </>
          )}
        </button>
      </div>

      {formError && (
        <p className="text-red-600 text-sm mt-2 p-2 bg-red-100 rounded-md border border-red-200">{formError}</p>
      )}


     
      {searchMode === 'name' && searchResults.length > 0 && (
        <div className="mt-4 border border-gray-300 rounded-md p-3 bg-gray-50 shadow-sm">
          <p className="font-semibold mb-2 text-gray-800">ผลการค้นหา:</p>
          <ul className="space-y-1">
            {searchResults.map((cust) => (
              <button
                key={cust.id}
                onClick={() => handleSelectCustomer(cust)}
                className="block w-full text-left px-4 py-2 border-b border-gray-200 last:border-b-0 text-gray-700 hover:bg-blue-100 rounded-sm transition-colors duration-200"
              >
           
                {(cust.type === 'ORGANIZATION' || cust.type === 'GOVERNMENT') ? cust.companyName : cust.name} ({cust.phone})
              </button>
            ))}
          </ul>
        </div>
      )}


      {shouldShowCustomerDetails && !hideCustomerDetails && (
        <div className="mt-4 text-lg text-gray-800 bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 shadow-md">
        

          {searchMode === 'phone' && !selectedCustomer?.id && pendingPhone && (
            <p className="text-orange-700 bg-orange-100 p-2 rounded-md border border-orange-200">
              ไม่พบลูกค้าด้วยเบอร์: <strong>{phone}</strong> คุณต้องการสร้างลูกค้าใหม่หรือไม่?
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-base font-bold text-gray-700 mb-1">ประเภทลูกค้า:</label>
              <div className="flex gap-4 text-sm text-gray-800">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="customerType"
                    value="INDIVIDUAL"
                    className="form-radio text-blue-600"
                    checked={customerType === 'INDIVIDUAL'}
                    onChange={() => setCustomerType('INDIVIDUAL')}
                  />
                  <span>บุคคลทั่วไป</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="customerType"
                    value="ORGANIZATION"
                    className="form-radio text-blue-600"
                    checked={customerType === 'ORGANIZATION'}
                    onChange={() => setCustomerType('ORGANIZATION')}
                  />
                  <span>นิติบุคคล</span>
                </label>
                {/* ✨ เพิ่มตัวเลือก "หน่วยงาน" เข้ามา */}
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="customerType"
                    value="GOVERNMENT"
                    className="form-radio text-blue-600"
                    checked={customerType === 'GOVERNMENT'}
                    onChange={() => setCustomerType('GOVERNMENT')}
                  />
                  <span>หน่วยงาน</span>
                </label>
              </div>
            </div>

            {(customerType === 'ORGANIZATION' || customerType === 'GOVERNMENT') && (
              <>
                <input
                  type="text"
                  placeholder="ชื่อบริษัท / หน่วยงาน"
                  value={companyName}
                  onChange={(e) => { setCompanyName(e.target.value); setIsModified(true); }}
                  className="border border-gray-300 px-3 py-2 rounded-md col-span-2 text-gray-800 text-base focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
                <input
                  type="text"
                  placeholder="เลขผู้เสียภาษี (ถ้ามี)"
                  value={taxId}
                  onChange={(e) => { setTaxId(e.target.value); setIsModified(true); }}
                  className="border border-gray-300 px-3 py-2 rounded-md col-span-2 text-gray-800 text-base focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </>
            )}

            <input
              type="text"
              id="customer-name-input"
              placeholder="ชื่อลูกค้า / ผู้ติดต่อ"
              value={name}
              onChange={(e) => { setName(e.target.value); setIsModified(true); }}
              className="border border-gray-300 px-3 py-2 rounded-md col-span-2 text-gray-800 text-base focus:ring-2 focus:ring-blue-500 shadow-sm"
            />

            <input
              type="email"
              placeholder="อีเมล (ถ้ามี)"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setIsModified(true); }}
              className="border border-gray-300 px-3 py-2 rounded-md col-span-2 text-gray-800 text-base focus:ring-2 focus:ring-blue-500 shadow-sm"
            />

            <textarea
              placeholder="ที่อยู่ (ถ้ามี)"
              value={address}
              onChange={(e) => { setAddress(e.target.value); setIsModified(true); }}
              className="border border-gray-300 px-3 py-2 rounded-md col-span-2 text-gray-800 text-base focus:ring-2 focus:ring-blue-500 shadow-sm min-h-[80px]"
            />
          </div>

          <div className="pt-2 flex gap-3 justify-end">
            {selectedCustomer ? (
              <button
                onClick={handleUpdateCustomer}
                disabled={!isModified}
                className={`px-5 py-2 rounded-md text-white font-semibold transition-colors duration-200 shadow-md ${isModified ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                <span className="flex items-center">
                  อัปเดตข้อมูล
                </span>
              </button>
            ) : (
              !selectedCustomer && pendingPhone && (
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmCreateCustomer}
                    className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center"
                  >
                 
                    บันทึกลูกค้าใหม่
                  </button>
                  <button
                    onClick={handleCancelCreateCustomer}
                    className="px-5 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600  transition-colors duration-200 shadow-md flex items-center"
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





