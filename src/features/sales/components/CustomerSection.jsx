

// CustomerSection component (aligned with BranchForm address handling)
import React, { useEffect, useRef, useState, useMemo } from 'react';
import InputMask from 'react-input-mask';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import useCustomerStore from '@/features/customer/store/customerStore';
import { useAddressStore } from '@/features/address/store/addressStore';
import AddressForm from '@/features/address/components/AddressForm';

// ✅ ทำให้เหมือน BranchForm:
// - ใช้ AddressForm (จังหวัด→อำเภอ→ตำบล + postcode auto)
// - FE เก็บเฉพาะ subdistrictCode + addressDetail
// - ไม่ใช้ REGION_MAP / REGION_OPTIONS / REGION_NAME_SETS
// - ไม่เรียก API ตรงในคอมโพเนนต์

const CustomerSection = ({ productSearchRef, clearTrigger, hideCustomerDetails, onSaleModeSelect }) => {
  // ---- ธรรมดา
  const [phone, setPhone] = useState('');
  const [rawPhone, setRawPhone] = useState('');
  const [searchMode, setSearchMode] = useState('phone');
  const [nameSearch, setNameSearch] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [customerType, setCustomerType] = useState('INDIVIDUAL'); // 'INDIVIDUAL' | 'ORGANIZATION' | 'GOVERNMENT'
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');

  const [customerLoading, setCustomerLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formInfo, setFormInfo] = useState('');
  const [pendingPhone, setPendingPhone] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [clearKey, setClearKey] = useState(Date.now());
  const [isClearing, setIsClearing] = useState(false);
  const [_shouldShowDetails, _setShouldShowDetails] = useState(false);
  const phoneInputRef = useRef(null);

  // ---- Address (ให้ AddressForm ควบคุม)
  const [addressDetail, setAddressDetail] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [subdistrictCode, setSubdistrictCode] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // ---- Region filter (UI only; not saved)
  const [regionFilter, setRegionFilter] = useState('');
  const REGION_OPTIONS = [
    { value: '', label: 'ทุกภาค' },
    { value: 'NORTH', label: 'ภาคเหนือ' },
    { value: 'NORTHEAST', label: 'ภาคอีสาน' },
    { value: 'CENTRAL', label: 'ภาคกลาง' },
    { value: 'EAST', label: 'ภาคตะวันออก' },
    { value: 'WEST', label: 'ภาคตะวันตก' },
    { value: 'SOUTH', label: 'ภาคใต้' },
  ];
  const REGION_NAME_SETS = {
    NORTH: new Set(['เชียงใหม่','เชียงราย','แม่ฮ่องสอน','ลำพูน','ลำปาง','แพร่','น่าน','พะเยา','อุตรดิตถ์','ตาก','นครสวรรค์','อุทัยธานี','กำแพงเพชร','สุโขทัย','พิษณุโลก','พิจิตร','เพชรบูรณ์']),
    NORTHEAST: new Set(['เลย','หนองบัวลำภู','อุดรธานี','หนองคาย','บึงกาฬ','สกลนคร','นครพนม','มุกดาหาร','ขอนแก่น','กาฬสินธุ์','มหาสารคาม','ร้อยเอ็ด','ชัยภูมิ','ยโสธร','อำนาจเจริญ','ศรีสะเกษ','อุบลราชธานี','สุรินทร์','บุรีรัมย์','นครราชสีมา']),
    CENTRAL: new Set(['กรุงเทพมหานคร','นนทบุรี','ปทุมธานี','สมุทรปราการ','พระนครศรีอยุธยา','อ่างทอง','ลพบุรี','สิงห์บุรี','ชัยนาท','สระบุรี','นครนายก','สุพรรณบุรี','นครปฐม','สมุทรสาคร','สมุทรสงคราม']),
    EAST: new Set(['ฉะเชิงเทรา','ชลบุรี','ระยอง','จันทบุรี','ตราด','ปราจีนบุรี','สระแก้ว']),
    WEST: new Set(['กาญจนบุรี','ราชบุรี','เพชรบุรี','ประจวบคีรีขันธ์']),
    SOUTH: new Set(['ชุมพร','สุราษฎร์ธานี','นครศรีธรรมราช','กระบี่','พังงา','ภูเก็ต','ระนอง','ตรัง','พัทลุง','สงขลา','สตูล','ปัตตานี','ยะลา','นราธิวาส']),
  };
  function provinceBelongsToRegion(p, region) {
    if (!region) return true;
    if (!p) return false;
    var name = '';
    if (p && p.nameTh) name = String(p.nameTh);
    else if (p && p.name_th) name = String(p.name_th);
    else if (p && p.name) name = String(p.name);
    name = name.trim();
    var setObj = REGION_NAME_SETS[region];
    if (!setObj) return true;
    return setObj.has(name);
  }
  const provinceFilterFn = useMemo(function () {
    if (!regionFilter) return undefined; // no filter
    return function(p){ return provinceBelongsToRegion(p, regionFilter); };
  }, [regionFilter]);

  const addressValue = useMemo(
    () => ({
      address: addressDetail,
      provinceCode: provinceCode || '',
      districtCode: districtCode || '',
      subdistrictCode: subdistrictCode || '',
      postalCode: postalCode || '',
    }),
    [addressDetail, provinceCode, districtCode, subdistrictCode, postalCode]
  );

  const handleAddressChange = (next) => {
    setAddressDetail(next && next.address ? String(next.address) : '');
    setProvinceCode(next && next.provinceCode ? String(next.provinceCode) : '');
    setDistrictCode(next && next.districtCode ? String(next.districtCode) : '');
    setSubdistrictCode(next && next.subdistrictCode ? String(next.subdistrictCode) : '');
    setPostalCode(next && (next.postalCode || next.postcode) ? String(next.postalCode || next.postcode) : '');
    setIsModified(true);
  };

  // ---- Stores
  const { ensureProvincesAction, resolveBySubdistrictCodeAction } = useAddressStore();
  const {
    setCustomerDepositAmount,
    searchCustomerByPhoneAndDepositAction,
    searchCustomerByNameAndDepositAction,
    setSelectedDeposit,
    clearCustomerAndDeposit,
  } = useCustomerDepositStore();
  const { updateCustomerProfilePosAction, createCustomerAction } = useCustomerStore();
  const { setCustomerIdAction } = useSalesStore();

  const setShouldShowDetails = (v) => _setShouldShowDetails(v);
  const shouldShowCustomerDetails = useMemo(
    () => !isClearing && (_shouldShowDetails || pendingPhone),
    [isClearing, _shouldShowDetails, pendingPhone]
  );

  // ให้ AddressForm มีจังหวัดพร้อมใช้
  useEffect(() => {
    (async () => {
      if (ensureProvincesAction) {
        try { await ensureProvincesAction(); } catch { /* noop */ }
      }
    })();
  }, [ensureProvincesAction]);

  // focus เบอร์โทร
  useEffect(() => {
    const t = setTimeout(() => { if (phoneInputRef.current) phoneInputRef.current.focus(); }, 300);
    return () => clearTimeout(t);
  }, []);

  // clear form
  useEffect(() => {
    if (!clearTrigger) return;
    setIsClearing(true);
    setClearKey(Date.now());
    setPhone(''); setRawPhone('');
    setName(''); setEmail('');
    setAddressDetail(''); setProvinceCode(''); setDistrictCode(''); setSubdistrictCode(''); setPostalCode('');
    setCompanyName(''); setTaxId(''); setCustomerType('INDIVIDUAL');
    setNameSearch(''); setSearchResults([]); setSelectedCustomer(null);
    setCustomerDepositAmount(0); setSelectedDeposit(null);
    setIsModified(false); setFormError(''); setFormInfo(''); setPendingPhone(false);
    setCustomerIdAction(null); clearCustomerAndDeposit(); setShouldShowDetails(false);
    const delay = setTimeout(() => {
      if (phoneInputRef.current) { phoneInputRef.current.focus(); phoneInputRef.current.select(); }
      setIsClearing(false);
    }, 300);
    return () => clearTimeout(delay);
  }, [clearTrigger, setCustomerIdAction, clearCustomerAndDeposit, setCustomerDepositAmount, setSelectedDeposit]);

  // preload จาก selectedCustomer (ด้วย subdistrictCode → resolve province/district/postal)
  useEffect(() => {
    if (!(selectedCustomer && !isClearing)) return;
    setPhone(selectedCustomer.phone);
    setName(selectedCustomer.name || '');
    setEmail(selectedCustomer.email || '');
    setAddressDetail(selectedCustomer.addressDetail || selectedCustomer.address || '');

    // ใช้ subdistrictCode เป็น source of truth; postcode เป็น fallback เท่านั้น
    (async () => {
      const subCode = selectedCustomer.subdistrictCode || '';
      if (subCode) {
        let info = null;
        if (resolveBySubdistrictCodeAction) { try { info = await resolveBySubdistrictCodeAction(subCode); } catch { /* noop */ } }
        if (info) {
          setProvinceCode(info.provinceCode || '');
          setDistrictCode(info.districtCode || '');
          setSubdistrictCode(info.subdistrictCode || subCode);
          setPostalCode(String(info.postalCode || info.postcode || ''));
        } else {
          // ถ้า resolve ไม่ได้ ให้คง subdistrictCode และใช้ postcode จาก BE เป็นทางเลือก
          setSubdistrictCode(subCode);
          if (selectedCustomer.postcode) setPostalCode(String(selectedCustomer.postcode));
        }
      } else {
        // ไม่มี subdistrictCode → ใช้ postcode จาก BE เพื่อช่วยกรอกเท่านั้น
        if (selectedCustomer.postcode) setPostalCode(String(selectedCustomer.postcode));
      }
    })();
  }, [selectedCustomer, isClearing, resolveBySubdistrictCodeAction]);

  useEffect(() => {
    if (selectedCustomer && Object.keys(selectedCustomer).length > 0 && !isClearing) setShouldShowDetails(true);
  }, [selectedCustomer, isClearing]);

  // เลือก/ค้นหาลูกค้า
  const processSelectedCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerIdAction(customer.id);
    setName(customer.name || '');
    setEmail(customer.email || '');
    setAddressDetail(customer.addressDetail || customer.address || '');
    setCustomerType(customer.type || 'INDIVIDUAL');
    setCompanyName(customer.companyName || '');
    setTaxId(customer.taxId || '');
    setIsModified(false);
    setIsClearing(false);
    setSearchResults([]);
    setShouldShowDetails(true);
    if (onSaleModeSelect) onSaleModeSelect('CASH');
    setTimeout(() => {
      if (productSearchRef && productSearchRef.current) productSearchRef.current.focus();
    }, 100);
  };

  const handleVerifyCustomer = async () => {
    setFormError('');
    setFormInfo('');
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
          setName(''); setEmail('');
          setAddressDetail(''); setProvinceCode(''); setDistrictCode(''); setSubdistrictCode(''); setPostalCode('');
          setCompanyName(''); setTaxId('');
          setCustomerType('INDIVIDUAL');
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
          setName(''); setEmail('');
          setAddressDetail(''); setProvinceCode(''); setDistrictCode(''); setSubdistrictCode(''); setPostalCode('');
          setCompanyName(''); setTaxId('');
          setCustomerType('INDIVIDUAL');
          setTimeout(() => {
            const nameInput = document.getElementById('customer-name-input');
            if (nameInput) nameInput.focus();
          }, 100);
        }
      }
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleSelectCustomer = (customer) => processSelectedCustomer(customer);

  const handleUpdateCustomer = async () => {
    try {
      if (!(selectedCustomer && selectedCustomer.id)) return;
      // ⬇️ Scoped fix: ส่ง id เป็นพารามิเตอร์ตัวแรก ตามสัญญา (id, data)
      await updateCustomerProfilePosAction(
        selectedCustomer.id,
        {
          name,
          email,
          subdistrictCode: subdistrictCode || null,
          postcode: postalCode || undefined,
          addressDetail,
          type: customerType,
          companyName,
          taxId,
        }
      );
      setIsModified(false);
      setFormError('');
      setFormInfo('อัปเดตข้อมูลลูกค้าสำเร็จ');
    } catch (err) {
      setFormInfo('');
      setFormError('อัปเดตข้อมูลลูกค้าไม่สำเร็จ');
    }
  };

  const handleConfirmCreateCustomer = async () => {
    setFormError('');
    setFormInfo('');
    if (!name.trim()) {
      setFormError('กรุณากรอกชื่อลูกค้า');
      return;
    }

    // ✅ ใช้เบอร์ที่เป็นตัวเลขล้วนเป็นหลัก (rawPhone มาจาก handleVerifyCustomer)
    const cleanPhone = (rawPhone || phone || '').replace(/-/g, '');

    try {
      const newCustomer = await createCustomerAction({
        name,
        phone: cleanPhone,
        email,
        subdistrictCode: subdistrictCode || null,
        postcode: postalCode || undefined,
        addressDetail,
        type: customerType,
        companyName,
        taxId,
      });

      if (newCustomer && newCustomer.id) {
        // ✅ สำคัญ: หลังสร้างลูกค้า ต้องทำให้ customerDepositStore เห็นลูกค้าทันที
        // เพื่อให้ PaymentSection ผ่านเงื่อนไข hasValidCustomerId โดยไม่ต้องกดค้นหาอีกรอบ
        setPendingPhone(false);

        let hydratedCustomer = null;
        if (searchCustomerByPhoneAndDepositAction && /^[0-9]{10}$/.test(cleanPhone)) {
          try {
            hydratedCustomer = await searchCustomerByPhoneAndDepositAction(cleanPhone);
          } catch {
            // noop: ถ้า hydrate ไม่ได้ ให้ fallback ใช้ newCustomer
          }
        }

        // ✅ เดิน flow เดิมให้ครบ (setCustomerId + focus + show details + reset flags)
        processSelectedCustomer(hydratedCustomer || newCustomer);
      }
    } catch (err) {
      setFormInfo('');
      setFormError('สร้างลูกค้าไม่สำเร็จ: ' + (((err && err.message) || '') || 'เกิดข้อผิดพลาด'));
    }
  };

  const handleCancelCreateCustomer = () => {
    setSelectedCustomer(null);
    setCustomerIdAction(null);
    setPhone(''); setRawPhone('');
    setName(''); setEmail('');
    setAddressDetail(''); setProvinceCode(''); setDistrictCode(''); setSubdistrictCode(''); setPostalCode('');
    setCompanyName(''); setTaxId('');
    setCustomerType('INDIVIDUAL');
    setFormError('');
    setIsModified(false);
    setPendingPhone(false);
    setShouldShowDetails(false);
    if (phoneInputRef.current) phoneInputRef.current.focus();
  };

  return (
    <div className="bg-white p-4  min-w-[390px] relative">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {(customerType === 'ORGANIZATION' || customerType === 'GOVERNMENT') && companyName ? 'หน่วยงาน' : 'ข้อมูลลูกค้า'}
      </h2>

      {/* ค้นหา */}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center space-x-2 text-gray-700">
          <input type="radio" name="searchMode" checked={searchMode === 'name'} onChange={() => setSearchMode('name')} className="form-radio text-blue-600" />
          <span>ค้นหาจากชื่อ</span>
        </label>
        <label className="flex items-center space-x-2 text-gray-700">
          <input type="radio" name="searchMode" checked={searchMode === 'phone'} onChange={() => setSearchMode('phone')} className="form-radio text-blue-600" />
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
          disabled={(searchMode === 'phone' && !phone) || (searchMode === 'name' && !nameSearch.trim()) || customerLoading}
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

      {formInfo && (
        <p className="text-green-700 text-sm mt-2 p-2 bg-green-100 rounded-md border border-green-200">{formInfo}</p>
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
          {searchMode === 'phone' && !(selectedCustomer && selectedCustomer.id) && pendingPhone && (
            <p className="text-orange-700 bg-orange-100 p-2 rounded-md border border-orange-200 text-sm">
              ไม่พบลูกค้าด้วยเบอร์: <strong>{phone}</strong> คุณต้องการสร้างลูกค้าใหม่หรือไม่?
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="col-span-2">
              <div className="flex gap-4 text-sm text-gray-800">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="customerType" value="INDIVIDUAL" className="form-radio text-blue-600"
                    checked={customerType === 'INDIVIDUAL'} onChange={() => { setCustomerType('INDIVIDUAL'); setIsModified(true); }} />
                  <span>บุคคลทั่วไป</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="customerType" value="ORGANIZATION" className="form-radio text-blue-600"
                    checked={customerType === 'ORGANIZATION'} onChange={() => { setCustomerType('ORGANIZATION'); setIsModified(true); }} />
                  <span>นิติบุคคล</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="customerType" value="GOVERNMENT" className="form-radio text-blue-600"
                    checked={customerType === 'GOVERNMENT'} onChange={() => { setCustomerType('GOVERNMENT'); setIsModified(true); }} />
                  <span>หน่วยงาน</span>
                </label>
              </div>
            </div>

            {(customerType === 'ORGANIZATION' || customerType === 'GOVERNMENT') && (
              <>
                <input type="text" placeholder="ชื่อบริษัท / หน่วยงาน" value={companyName}
                  onChange={(e) => { setCompanyName(e.target.value); setIsModified(true); }}
                  className="border border-gray-300 px-3 py-1 rounded-md col-span-2 text-gray-800 text-base focus:ring-2 focus:ring-blue-500 shadow-sm" />
                <input type="text" placeholder="เลขผู้เสียภาษี (ถ้ามี)" value={taxId}
                  onChange={(e) => { setTaxId(e.target.value); setIsModified(true); }}
                  className="border border-gray-300 px-3 py-1 rounded-md col-span-2 text-gray-800 text-base focus:ring-2 focus:ring-blue-500 shadow-sm" />
              </>
            )}

            <input type="text" id="customer-name-input" placeholder="ชื่อลูกค้า / ผู้ติดต่อ" value={name}
              onChange={(e) => { setName(e.target.value); setIsModified(true); }}
              className="border border-gray-300 px-3 py-1 rounded-md col-span-2 text-gray-800 text-base focus:ring-2 focus:ring-blue-500 shadow-sm" />

            <input type="email" placeholder="อีเมล (ถ้ามี)" value={email}
              onChange={(e) => { setEmail(e.target.value); setIsModified(true); }}
              className="border border-gray-300 px-3 py-1 rounded-md col-span-2 text-gray-800 text-base focus:ring-2 focus:ring-blue-500 shadow-sm" />

            {/* รายละเอียดหน้าบ้าน */} 
            {/* Address Cascader แบบเดียวกับ BranchForm */}
            <div className="col-span-2 flex gap-3 items-center">              
              <select
                value={regionFilter}
                onChange={(e) => { setRegionFilter(e.target.value); }}
                className="border border-gray-300 px-3 py-2 rounded-md text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                {REGION_OPTIONS.map(function (r) { return (<option key={r.value} value={r.value}>{r.label}</option>); })}
              </select>
              
            </div>
            {/* Address Cascader แบบเดียวกับ BranchForm */} 
            <div className="col-span-2">
              <AddressForm value={addressValue} onChange={handleAddressChange} provinceFilter={provinceFilterFn} layout="subdistrict-with-postcode" required />
            </div>

            {/* แสดงที่อยู่รวมจาก backend ถ้ามี */} 
            {(selectedCustomer && selectedCustomer.customerAddress) && (
              <div className="col-span-2 text-sm text-gray-600 bg-white border rounded-md p-2">
                <span className="font-semibold">ที่อยู่ระบบ: </span>
                {selectedCustomer.customerAddress}
              </div>
            )}
          </div>

          <div className=" flex gap-3 justify-end">
            {selectedCustomer ? (
              <button onClick={handleUpdateCustomer} disabled={!isModified}
                className={`px-4 py-1 rounded-md text-white font-semibold transition-colors duration-200 shadow-md ${isModified ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                <span className="flex items-center">อัปเดตข้อมูล</span>
              </button>
            ) : (
              !selectedCustomer && pendingPhone && (
                <div className="flex gap-3">
                  <button onClick={handleConfirmCreateCustomer}
                    className="px-5 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center">
                    บันทึกลูกค้าใหม่
                  </button>
                  <button onClick={handleCancelCreateCustomer}
                    className="px-5 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors duration-200 shadow-md flex items-center">
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




