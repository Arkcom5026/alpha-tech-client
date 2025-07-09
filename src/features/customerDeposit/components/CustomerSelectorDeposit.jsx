import React, { useEffect, useRef, useState } from 'react';
import InputMask from 'react-input-mask';
import useCustomerStore from '@/features/customer/store/customerStore';

/**
 * Component: CustomerSelectorDeposit
 * วัตถุประสงค์: จัดการการค้นหาและสร้างข้อมูลลูกค้าใหม่
 * โค้ดนี้ได้รับการแก้ไขให้การค้นหาจากชื่อทำงานได้อย่างถูกต้อง และปรับปรุงการจัดการ State ให้มีเสถียรภาพ
 * ฟังก์ชันการอัปเดตข้อมูลลูกค้าถูกตัดออกตามคำขอ
 */
const CustomerSelectorDeposit = () => {
  const phoneInputRef = useRef(null);
  const [searchMode, setSearchMode] = useState('phone');
  const [phone, setPhone] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [rawPhone, setRawPhone] = useState(''); // สำหรับเก็บเบอร์โทรเพื่อสร้างลูกค้าใหม่

  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', address: '', customerType: 'บุคคลทั่วไป' });
  // const [isModified, setIsModified] = useState(false); // ไม่จำเป็นต้องใช้แล้วเมื่อตัดฟังก์ชันอัปเดต

  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    customer, // customer ที่ถูกเลือกและอยู่ใน store
    searchCustomerByPhoneAction,
    searchCustomerByNameAction,
    createCustomerAction,
    // updateCustomerProfileAction, // ไม่จำเป็นต้องใช้แล้วเมื่อตัดฟังก์ชันอัปเดต
    setCustomer: setCustomerToStore,
  } = useCustomerStore();

  // Effect นี้จะทำงานเมื่อ customer ใน store เปลี่ยนแปลง
  useEffect(() => {
    if (customer) {
      // ถ้ามี customer ใน store, ให้อัปเดตข้อมูลในฟอร์ม
      setCustomerInfo({
        name: customer.name || '',
        email: customer.email || '',
        address: customer.address || '',
        customerType: customer.customerType || 'บุคคลทั่วไป',
      });
      setPhone(customer.phone || '');
      // setIsModified(false); // ไม่จำเป็นต้องใช้แล้ว
    } else {
      // ถ้าไม่มี (เช่น กดล้างข้อมูล), ให้รีเซ็ตฟอร์ม
      setCustomerInfo({ name: '', email: '', address: '', customerType: 'บุคคลทั่วไป' });
      setPhone('');
      setNameSearch('');
      setSearchResults([]);
    }
  }, [customer]);

  const handleSearch = async () => {
    setError('');
    setIsLoading(true);
    setSearchResults([]);

    try {
      if (searchMode === 'phone') {
        const cleanPhone = phone.replace(/-/g, '');
        if (!/^[0-9]{10}$/.test(cleanPhone)) {
          setError('กรุณากรอกเบอร์โทรให้ถูกต้อง (10 หลัก)');
          setIsLoading(false);
          return;
        }
        setRawPhone(cleanPhone);
        await searchCustomerByPhoneAction(cleanPhone);
      } else {
        if (!nameSearch.trim()) {
          setError('กรุณากรอกชื่อหรือนามสกุลเพื่อค้นหา');
          setIsLoading(false);
          return;
        }
        const results = await searchCustomerByNameAction(nameSearch);
        setSearchResults(results || []);
        if (!results || results.length === 0) {
          setError('ไม่พบลูกค้าด้วยชื่อนี้');
        }
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการค้นหา');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCustomer = (cust) => {
    setCustomerToStore(cust); // ตั้งค่า customer ที่เลือกใน store
    setSearchResults([]); // เคลียร์ผลการค้นหา
  };

  const handleSave = async () => {
    const payload = { ...customerInfo };
    // ตัด Logic การอัปเดตออกไป เหลือเพียงการสร้างลูกค้าใหม่
    // if (customer?.id) { // อัปเดตลูกค้าเดิม
    //   await updateCustomerProfileAction({ id: customer.id, ...payload });
    //   alert('อัปเดตข้อมูลลูกค้าสำเร็จ!');
    //   setIsModified(false);
    // } else { // สร้างลูกค้าใหม่
    const newCustomer = await createCustomerAction({ ...payload, phone: rawPhone });
    if (newCustomer) {
      setCustomerToStore(newCustomer); // ตั้งค่าลูกค้าใหม่ใน store
      alert('สร้างลูกค้าใหม่สำเร็จ!');
    }
    // }
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
    // setIsModified(true); // ไม่จำเป็นต้องใช้แล้ว
  };

  const handleModeChange = (mode) => {
    setSearchMode(mode);
    setPhone('');
    setNameSearch('');
    setError('');
    setSearchResults([]);
  };

  const handleClear = () => {
    // 1. ล้าง State ภายใน Component นี้ทั้งหมด เช่น ช่องค้นหา, ข้อความ error
    setPhone('');
    setNameSearch('');
    setRawPhone('');
    setSearchResults([]);
    setError('');
    // setIsModified(false); // ไม่จำเป็นต้องใช้แล้ว
    // 2. เรียกใช้ Action เพื่อล้าง State ใน Store กลาง
    setCustomerToStore(null); // Set customer to null to clear it from the store
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border w-full">
      <h2 className="text-2xl font-bold text-black mb-4">ข้อมูลลูกค้า</h2>
      <div className="flex items-center gap-6 py-2">
        <label className="p-2 text-black text-lg cursor-pointer">
          <input type="radio" name="searchMode" checked={searchMode === 'phone'} onChange={() => handleModeChange('phone')} className="mr-2" />
          ค้นหาจากเบอร์โทร
        </label>
        <label className="p-2 text-black text-lg cursor-pointer">
          <input type="radio" name="searchMode" checked={searchMode === 'name'} onChange={() => handleModeChange('name')} className="mr-2" />
          ค้นหาจากชื่อ
        </label>
      </div>
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-grow min-w-[250px]">
          {searchMode === 'phone' ? (
            <InputMask mask="099-999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}>
              {(inputProps) => <input {...inputProps} ref={phoneInputRef} type="tel" placeholder="เบอร์โทรลูกค้า (0xx-xxx-xxxx)" className="border rounded-md px-3 py-2 w-full text-black text-lg" />}
            </InputMask>
          ) : (
            <input type="text" placeholder="ค้นหาชื่อลูกค้าหรือนามสกุล" value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="border rounded-md px-3 py-2 w-full text-black text-lg" />
          )}
        </div>
        <button onClick={handleSearch} disabled={isLoading} className="px-6 py-2 bg-green-500 text-blue-900 font-semibold rounded-md hover:bg-green-600 disabled:opacity-50 text-lg flex-shrink-0">
          {isLoading ? 'กำลังค้นหา...' : 'ค้นหา'}
        </button>
        <button onClick={handleClear} className="px-6 py-2 bg-gray-300 text-black font-semibold rounded-md hover:bg-gray-400 text-lg flex-shrink-0">
          ล้างข้อมูล
        </button>
      </div>
      {error && <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded text-lg mt-4">⚠️ {error}</div>}
      
      {searchResults.length > 0 && (
        <div className="mt-4 border border-gray-300 rounded-lg p-3 text-black bg-gray-50">
          <p className="font-semibold mb-2">ผลการค้นหา:</p>
          <ul className="space-y-1">
            {searchResults.map((cust) => (
              <li key={cust.id} onClick={() => handleSelectCustomer(cust)} className="cursor-pointer hover:bg-blue-100 p-2 rounded-md">
                {cust.name} ({cust.phone})
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* แสดงฟอร์มสร้างลูกค้าใหม่เมื่อยังไม่มีลูกค้าถูกเลือก หรือเมื่อมีการค้นหาเบอร์โทรแล้วไม่พบ */}
      {(!customer || (customer && !customer.id)) && (
          <div className="mt-6 pt-4 border-t-2 border-dashed text-lg text-black bg-white space-y-4">
            <p className="text-xl font-bold text-gray-800">📋 <strong>สร้างลูกค้าใหม่ (เบอร์: {rawPhone || 'ยังไม่มี'})</strong></p>
            <input type="text" placeholder="ชื่อ" name="name" value={customerInfo.name} onChange={handleInfoChange} className="border px-3 py-2 rounded-md w-full text-black text-base" />
            <input type="email" placeholder="อีเมล (ถ้ามี)" name="email" value={customerInfo.email} onChange={handleInfoChange} className="border px-3 py-2 rounded-md w-full text-black text-base" />
            <textarea placeholder="ที่อยู่ (ถ้ามี)" name="address" value={customerInfo.address} onChange={handleInfoChange} className="border px-3 py-2 rounded-md w-full text-black text-base" rows="3" />
            <div className="pt-2 flex justify-end">
              <button onClick={handleSave} disabled={!rawPhone || !customerInfo.name} className={`px-6 py-2 text-white font-semibold rounded-lg text-lg transition-colors ${rawPhone && customerInfo.name ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                บันทึกลูกค้าใหม่
              </button>
            </div>
          </div>
      )}
      {/* แสดงรายละเอียดลูกค้าที่ถูกเลือก หากมี */}
      {customer && customer.id && (
        <div className="mt-6 pt-4 border-t-2 border-dashed text-lg text-black bg-white space-y-4">
          <p className="text-xl font-bold text-gray-800">📋 <strong>รายละเอียดลูกค้า</strong></p>
          <p><strong>ชื่อ:</strong> {customer.name}</p>
          <p><strong>เบอร์โทร:</strong> {customer.phone}</p>
          <p><strong>อีเมล:</strong> {customer.email || '-'}</p>
          <p><strong>ที่อยู่:</strong> {customer.address || '-'}</p>
          <p><strong>ประเภทลูกค้า:</strong> {customer.customerType || 'บุคคลทั่วไป'}</p>
        </div>
      )}
    </div>
  );
};

export default CustomerSelectorDeposit;
