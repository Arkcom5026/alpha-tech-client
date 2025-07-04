// CustomerSection component
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
      console.log('🧹 [CLEAR_TRIGGER] เริ่มล้างข้อมูลลูกค้า');
      setIsClearing(true); // ตั้งค่าสถานะกำลังล้างข้อมูล
      setClearKey(Date.now()); // เปลี่ยน key เพื่อบังคับ InputMask ให้ rerender
      // ล้างค่า State ทั้งหมดที่เกี่ยวข้องกับลูกค้า
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
      setShouldShowDetails(false); // ซ่อนรายละเอียดลูกค้า
      const delay = setTimeout(() => {
        phoneInputRef.current?.focus(); // กำหนด focus กลับไปที่ช่องเบอร์โทรศัพท์
        phoneInputRef.current?.select(); // เลือกข้อความในช่อง
        console.log('🎯 [CLEAR_TRIGGER] Focus เบอร์โทรแล้ว');
        setIsClearing(false); // สิ้นสุดสถานะกำลังล้างข้อมูล
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [clearTrigger]);

  useEffect(() => {
    // เมื่อมีลูกค้าถูกเลือกและไม่ได้อยู่ในสถานะกำลังล้างข้อมูล ให้อัปเดตข้อมูลในฟอร์ม
    if (selectedCustomer && !isClearing) {
      console.log('📲 [SET_PHONE] กำหนดเบอร์:', selectedCustomer.phone);
      setPhone(selectedCustomer.phone);
      setName(selectedCustomer.name || '');
      setEmail(selectedCustomer.email || '');
    }
  }, [selectedCustomer, isClearing]);

  useEffect(() => {
    // เมื่อมีลูกค้าถูกเลือกและไม่ได้อยู่ในสถานะกำลังล้างข้อมูล ให้แสดงรายละเอียดลูกค้า
    if (selectedCustomer && Object.keys(selectedCustomer).length > 0 && !isClearing) {
      console.log('👁️ [SET_DETAIL_TRUE] แสดงข้อมูลลูกค้า');
      setShouldShowDetails(true);
    }
  }, [selectedCustomer, isClearing]);

  useEffect(() => {
    // Debugging logs สำหรับติดตามสถานะลูกค้า
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
    // ตรวจสอบและค้นหาข้อมูลลูกค้า
    setFormError(''); // ล้างข้อความ Error ก่อน
    try {
      setCustomerLoading(true); // ตั้งค่าสถานะกำลังโหลด
      setSelectedCustomer(null); // ล้างลูกค้าที่เลือกไว้ก่อนหน้า
      if (searchMode === 'phone') {
        const cleanPhone = phone.replace(/-/g, ''); // ลบขีดออกจากเบอร์โทร
        if (!/^[0-9]{10}$/.test(cleanPhone)) {
          setFormError('กรุณากรอกเบอร์โทรให้ถูกต้อง (10 หลัก)'); // แสดง Error ถ้าเบอร์โทรไม่ถูกต้อง
          return;
        }
        setRawPhone(cleanPhone); // เก็บเบอร์โทรแบบไม่มีขีด
        const found = await searchCustomerByPhoneAndDepositAction(cleanPhone); // ค้นหาลูกค้าด้วยเบอร์โทร
        if (found) {
          setSelectedCustomer(found); // ตั้งค่าลูกค้าที่พบ
          setCustomerIdAction(found.id); // ตั้งค่า ID ลูกค้าใน Sales Store
          // อัปเดตข้อมูลในฟอร์มด้วยข้อมูลลูกค้าที่พบ
          setName(found.name || '');
          setEmail(found.email || '');
          setAddress(found.address || '');
          setCustomerType(found.customerType || 'บุคคลทั่วไป');
          setCompanyName(found.companyName || '');
          setTaxId(found.taxId || '');
          setIsModified(false); // ตั้งค่าเป็นไม่ถูกแก้ไข
          setIsClearing(false); // ไม่ได้อยู่ในสถานะกำลังล้างข้อมูล
          setTimeout(() => {
            productSearchRef?.current?.focus(); // กำหนด focus ไปที่ช่องค้นหาสินค้า
          }, 100);
        } else {
          // ถ้าไม่พบลูกค้าด้วยเบอร์โทร
          setPendingPhone(true); // ตั้งค่าสถานะรอการสร้างลูกค้าใหม่
          setShouldShowDetails(true); // แสดงรายละเอียดเพื่อให้กรอกข้อมูลลูกค้าใหม่
          setName(''); // ล้างชื่อ
          setEmail(''); // ล้างอีเมล
          setAddress(''); // ล้างที่อยู่
          setCompanyName('');
          setTaxId('');
          setCustomerType('บุคคลทั่วไป');
          setTimeout(() => {
            // กำหนด focus ไปที่ช่องชื่อเมื่อไม่พบลูกค้า
            const nameInput = document.getElementById('customer-name-input');
            if (nameInput) nameInput.focus();
          }, 100);
        }
        setSearchResults([]); // ล้างผลการค้นหาชื่อ
      } else {
        // ค้นหาด้วยชื่อ
        if (!nameSearch.trim()) {
          setFormError('กรุณากรอกชื่อหรือนามสกุลเพื่อค้นหา'); // แสดง Error ถ้าชื่อว่างเปล่า
          return;
        }
        const result = await searchCustomerByNameAndDepositAction(nameSearch); // ค้นหาลูกค้าด้วยชื่อ
        if (result) {
          setSearchResults([result]); // แสดงผลการค้นหา
        } else {
          setSearchResults([]); // ไม่มีผลการค้นหา
          setFormError('ไม่พบลูกค้าด้วยชื่อนี้'); // แสดง Error ถ้าไม่พบ
        }
      }
    } catch (error) {
      console.error('ค้นหาลูกค้าไม่สำเร็จ:', error);
      setFormError('เกิดข้อผิดพลาดในการค้นหาลูกค้า'); // แสดง Error ทั่วไป
    } finally {
      setCustomerLoading(false); // สิ้นสุดสถานะกำลังโหลด
    }
  };


  const handleSelectCustomer = (customer) => {
    // เมื่อเลือกจากผลการค้นหาชื่อ
    setSelectedCustomer(customer);
    setCustomerIdAction(customer.id);
    setName(customer.name || '');
    setEmail(customer.email || '');
    setAddress(customer.address || '');
    setCustomerType(customer.customerType || 'บุคคลทั่วไป');
    setCompanyName(customer.companyName || '');
    setTaxId(customer.taxId || '');
    setPendingPhone(true); // ตั้งค่าสถานะว่ามีลูกค้าแล้ว
    setSearchResults([]); // ล้างผลการค้นหา
    setShouldShowDetails(true); // แสดงรายละเอียดลูกค้า
    setTimeout(() => {
      productSearchRef?.current?.focus(); // กำหนด focus ไปที่ช่องค้นหาสินค้า
    }, 100);
  };

  const handleUpdateCustomer = async () => {
    // อัปเดตข้อมูลลูกค้า
    try {
      if (!selectedCustomer?.id) return; // ไม่ทำอะไรถ้าไม่มีลูกค้าถูกเลือก
      await updateCustomerProfileAction({
        id: selectedCustomer.id,
        name,
        email,
        address,
        customerType,
        companyName,
        taxId,
      });
      setIsModified(false); // ตั้งค่าเป็นไม่ถูกแก้ไข
      alert('อัปเดตข้อมูลลูกค้าสำเร็จ!'); // แสดงข้อความแจ้งเตือน
    } catch (error) {
      console.error('อัปเดตข้อมูลไม่สำเร็จ:', error);
      alert('อัปเดตข้อมูลลูกค้าไม่สำเร็จ!'); // แสดงข้อความแจ้งเตือน
    }
  };

  const handleConfirmCreateCustomer = async () => {
    // ยืนยันการสร้างลูกค้าใหม่
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
        customerType,
        companyName,
        taxId,
      });
      if (newCustomer?.id) {
        setSelectedCustomer(newCustomer);
        setCustomerIdAction(newCustomer.id);
        alert('สร้างลูกค้าใหม่สำเร็จ!'); // แสดงข้อความแจ้งเตือน
        setShouldShowDetails(true); // แสดงรายละเอียดลูกค้า
        setTimeout(() => {
          productSearchRef?.current?.focus(); // กำหนด focus ไปที่ช่องค้นหาสินค้า
        }, 100);
      }
    } catch (error) {
      console.error('สร้างลูกค้าไม่สำเร็จ:', error);
      setFormError('สร้างลูกค้าไม่สำเร็จ: ' + (error.message || 'เกิดข้อผิดพลาด'));
    }
  };


  const handleCancelCreateCustomer = () => {
    // ยกเลิกการสร้างลูกค้าใหม่
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
    setPendingPhone(false);
    setShouldShowDetails(false); // ซ่อนรายละเอียดลูกค้า
    phoneInputRef.current?.focus(); // กำหนด focus กลับไปที่ช่องเบอร์โทรศัพท์
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow min-w-[390px]">
      <h2 className="text-xl font-bold text-gray-800 mb-4">ข้อมูลลูกค้า</h2>
      <div className="flex gap-4 py-2 mb-4">
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
                id="customer-phone-input" // เพิ่ม ID สำหรับการ Focus
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
                {cust.name} ({cust.phone})
              </button>
            ))}
          </ul>
        </div>
      )}

      {/* แสดงรายละเอียดลูกค้าหรือแบบฟอร์มสร้างลูกค้าใหม่ */}
      {shouldShowCustomerDetails && !hideCustomerDetails && (
        <div className="mt-4 text-lg text-gray-800 bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 shadow-md">
          <p className="font-bold text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2V8m-2 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v3m-2 0h7m-5 0h5M6 12h9M6 16h9" />
            </svg>
            รายละเอียดลูกค้า
          </p>

          {searchMode === 'phone' && !selectedCustomer?.id && pendingPhone && (
            <p className="text-orange-700 bg-orange-100 p-2 rounded-md border border-orange-200">
              ไม่พบลูกค้าด้วยเบอร์: <strong>{phone}</strong> คุณต้องการสร้างลูกค้าใหม่หรือไม่?
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทลูกค้า:</label>
              <div className="flex gap-4 text-sm text-gray-800">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="customerType"
                    value="บุคคลทั่วไป"
                    className="form-radio text-blue-600"
                    checked={customerType === 'บุคคลทั่วไป'}
                    onChange={() => setCustomerType('บุคคลทั่วไป')}
                  />
                  <span>บุคคลทั่วไป</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="customerType"
                    value="นิติบุคคล"
                    className="form-radio text-blue-600"
                    checked={customerType === 'นิติบุคคล'}
                    onChange={() => setCustomerType('นิติบุคคล')}
                  />
                  <span>นิติบุคคล</span>
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
              id="customer-name-input" // เพิ่ม ID สำหรับการ Focus
              placeholder="ชื่อลูกค้า"
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

            {!email && (
              <p className="text-sm text-gray-500 italic col-span-2">
                * ลูกค้ารายนี้ยังไม่มีอีเมลในระบบ
              </p>
            )}

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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.827-2.828z" />
                  </svg>
                  อัปเดตข้อมูล
                </span>
              </button>
            ) : (
              searchMode === 'phone' && pendingPhone && (
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmCreateCustomer}
                    className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold transition-colors duration-200 shadow-md flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    บันทึกลูกค้าใหม่
                  </button>
                  <button
                    onClick={handleCancelCreateCustomer}
                    className="px-5 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-semibold transition-colors duration-200 shadow-md flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 10l-4.146 4.146a1 1 0 001.414 1.414L11.414 11l4.146 4.146a1 1 0 001.414-1.414L12.828 10l4.146-4.146a1 1 0 00-1.414-1.414L11.414 9l-4.146-4.146a1 1 0 00-1.414 1.414L9.707 10z" clipRule="evenodd" />
                    </svg>
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