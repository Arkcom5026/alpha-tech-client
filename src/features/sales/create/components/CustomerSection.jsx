// src/features/sales/components/CustomerSection.jsx
// 🏛️ Premium Next-Gen POS Customer Console: (Extreme Grid Compact Edition - Pure All-Green Edition)

import React, { useEffect, useRef, useState, useMemo } from 'react';
import InputMask from 'react-input-mask';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import useCustomerStore from '@/features/customer/store/customerStore';
import { useAddressStore } from '@/features/address/store/addressStore';
import AddressForm from '@/features/address/components/AddressForm';
import { User, Search, Phone, RefreshCw, ShieldCheck, Mail, MapPin } from 'lucide-react';

const CustomerSection = ({ productSearchRef, clearTrigger, hideCustomerDetails, onSaleModeSelect }) => {
  // ---- อินพุตข้อมูลสมาชิกและรายละเอียดหลัก
  const [phone, setPhone] = useState('');
  const [rawPhone, setRawPhone] = useState('');
  const [searchMode, setSearchMode] = useState('phone');
  const [nameSearch, setNameSearch] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [customerType, setCustomerType] = useState('INDIVIDUAL');
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');

  const [customerLoading, setCustomerLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formInfo, setFormInfo] = useState('');
  const [pendingPhone, setPendingPhone] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchCustomerId, setSelectedSearchCustomerId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [clearKey, setClearKey] = useState(Date.now());
  const [isClearing, setIsClearing] = useState(false);
  const [_shouldShowDetails, _setShouldShowDetails] = useState(false);
  const phoneInputRef = useRef(null);

  // ---- Address States (ส่งให้ AddressForm ควบคุม)
  const [addressDetail, setAddressDetail] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [subdistrictCode, setSubdistrictCode] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // ---- Region Filter Module
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
    var nameText = '';
    if (p && p.nameTh) nameText = String(p.nameTh);
    else if (p && p.name_th) nameText = String(p.name_th);
    else if (p && p.name) nameText = String(p.name);
    nameText = nameText.trim();
    var setObj = REGION_NAME_SETS[region];
    if (!setObj) return true;
    return setObj.has(nameText);
  }

  const provinceFilterFn = useMemo(function () {
    if (!regionFilter) return undefined;
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

  // ---- คลังผูกข้อมูล Stores ด้วย Zustand Selector สากล
  const ensureProvincesAction = useAddressStore((state) => state.ensureProvincesAction);
  const resolveBySubdistrictCodeAction = useAddressStore((state) => state.resolveBySubdistrictCodeAction);

  const setCustomerDepositAmount = useCustomerDepositStore((state) => state.setCustomerDepositAmount);
  const searchCustomerByPhoneAndDepositAction = useCustomerDepositStore((state) => state.searchCustomerByPhoneAndDepositAction);
  const searchCustomerByNameAndDepositAction = useCustomerDepositStore((state) => state.searchCustomerByNameAndDepositAction);
  const searchCustomerByCustomerIdAndDepositAction = useCustomerDepositStore((state) => state.searchCustomerByCustomerIdAndDepositAction);
  const setSelectedDeposit = useCustomerDepositStore((state) => state.setSelectedDeposit);
  const clearCustomerAndDeposit = useCustomerDepositStore((state) => state.clearCustomerAndDeposit);

  const updateCustomerProfilePosAction = useCustomerStore((state) => state.updateCustomerProfilePosAction);
  const createCustomerAction = useCustomerStore((state) => state.createCustomerAction);
  const setCustomerIdAction = useSalesStore((state) => state.setCustomerIdAction);

  const shouldShowCustomerDetails = true;

  // โหลดรายชื่อจังหวัดเข้าสู่โครงสร้างฟอร์มย่อยล่วงหน้าอย่างปลอดภัย
  useEffect(() => {
    (async () => {
      if (ensureProvincesAction) {
        try { 
          await ensureProvincesAction(); 
        } catch (err) {
          // noop
        }
      }
    })();
  }, [ensureProvincesAction]);

  useEffect(() => {
    const t = setTimeout(() => { if (phoneInputRef.current) phoneInputRef.current.focus(); }, 300);
    return () => clearTimeout(t);
  }, []);

  // เคลียร์สถานะฟอร์มทั้งหมดเมื่อเริ่มตัดบิลใบใหม่
  useEffect(() => {
    if (!clearTrigger) return;
    setIsClearing(true);
    setClearKey(Date.now());
    setPhone(''); setRawPhone('');
    setName(''); setEmail('');
    setAddressDetail(''); setProvinceCode(''); setDistrictCode(''); setSubdistrictCode(''); setPostalCode('');
    setCompanyName(''); setTaxId(''); setCustomerType('INDIVIDUAL');
    setNameSearch(''); setSearchResults([]); setSelectedSearchCustomerId(null); setSelectedCustomer(null);
    setCustomerDepositAmount(0); setSelectedDeposit(null);
    setIsModified(false); setFormError(''); setFormInfo(''); _setShouldShowDetails(false);
    setCustomerIdAction(null); clearCustomerAndDeposit();
    const delay = setTimeout(() => {
      if (phoneInputRef.current) { phoneInputRef.current.focus(); phoneInputRef.current.select(); }
      setIsClearing(false);
    }, 300);
    return () => clearTimeout(delay);
  }, [clearTrigger, setCustomerIdAction, clearCustomerAndDeposit, setCustomerDepositAmount, setSelectedDeposit]);

  // Preload ข้อมูลที่อยู่ของสมาชิกเก่าเข้าแผงลอย
  useEffect(() => {
    if (!(selectedCustomer && !isClearing)) return;
    setPhone(selectedCustomer.phone || '');
    setName(selectedCustomer.name || '');
    setEmail(selectedCustomer.email || '');
    setAddressDetail(selectedCustomer.addressDetail || selectedCustomer.address || '');

    (async () => {
      const rawSubCode = selectedCustomer.subdistrictCode || '';
      const rawString = selectedCustomer.customerAddress || ''; 
      let subCode = '';
      
      const num = Number(rawSubCode);
      if (Number.isInteger(num) && num > 0) {
        subCode = String(num).trim();
      }

      if (resolveBySubdistrictCodeAction) {
        let info = null;
        try {
          // 🟢 HARDENING BLOCK: หากตรวจสอบพบว่าลูกค้าเก่ามีก้อน String ข้อความดิบอยู่แล้ว และรหัสตำบลสุ่มเสี่ยงพัง (เช่น เคส 600504)
          // ให้สั่งข้ามเลนไปใช้สิทธิ์ของกลไก Fallback ทันทีโดยแอบส่งรหัสปลอม '0' ไปแทน เพื่อบล็อกไม่ให้สัญญานระเบิดสีแดง 404 โผล่ขึ้นมาบนหน้า Console ครับ!
          const secureSubCode = (rawString && !selectedCustomer.provinceCode) ? '0' : subCode;
          info = await resolveBySubdistrictCodeAction(secureSubCode, rawString);
        } catch (err) {
          info = null;
        }
        
        if (info) {
          setProvinceCode(String(info.provinceCode || ''));
          setDistrictCode(String(info.districtCode || ''));
          setSubdistrictCode(String(info.subdistrictCode || subCode));
          setPostalCode(String(info.postalCode || info.postcode || ''));
        } else {
          setSubdistrictCode(subCode);
          if (selectedCustomer.postcode) setPostalCode(String(selectedCustomer.postcode));
        }
      } else {
        if (selectedCustomer.postcode) setPostalCode(String(selectedCustomer.postcode));
      }
    })();
  }, [selectedCustomer, isClearing, resolveBySubdistrictCodeAction]); 

  useEffect(() => {
    if (selectedCustomer && Object.keys(selectedCustomer).length > 0 && !isClearing) _setShouldShowDetails(true);
  }, [selectedCustomer, isClearing]);

  // จัดการรับค่าหลังจากคลิกเลือกรายชื่อสมาชิก
  const processSelectedCustomer = (payload) => {
    const customer = payload?.customer || payload;
    if (!(customer && customer.id)) return;

    let safeSubdistrictCode = '';
    if (customer?.subdistrictCode) {
      const num = Number(customer.subdistrictCode);
      if (Number.isInteger(num) && num > 0) {
        safeSubdistrictCode = String(num).trim();
      }
    }

    setSelectedCustomer({
      ...customer,
      subdistrictCode: safeSubdistrictCode,
      provinceCode: customer.provinceCode || '',
      districtCode: customer.districtCode || ''
    });

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
    _setShouldShowDetails(true);
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
          _setShouldShowDetails(true);
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
        setSelectedSearchCustomerId(null);
      } else {
        if (!nameSearch.trim()) {
          setFormError('กรุณากรอกชื่อหรือนามสกุลเพื่อค้นหา');
          setCustomerLoading(false);
          return;
        }
        const result = await searchCustomerByNameAndDepositAction(nameSearch);
        const resultList = Array.isArray(result?.results)
          ? result.results
          : Array.isArray(result)
            ? result
            : result
              ? [result]
              : [];

        if (resultList.length > 0) {
          setSearchResults(resultList);
          setSelectedSearchCustomerId(null);
          setPendingPhone(false);
          _setShouldShowDetails(false);
        } else {
          setSearchResults([]);
          setSelectedSearchCustomerId(null);
          setPendingPhone(true);
          _setShouldShowDetails(true);
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

  const handleSelectCustomer = async (customer) => {
    try {
      if (!(customer && customer.id)) return;
      setCustomerLoading(true);
      setSelectedSearchCustomerId(customer.id);

      let fullPayload = null;
      try {
        if (searchCustomerByCustomerIdAndDepositAction) {
          fullPayload = await searchCustomerByCustomerIdAndDepositAction(customer.id);
        }
      } catch (e) {
        fullPayload = null;
      }

      processSelectedCustomer(fullPayload || customer);
    } catch (err) {
      setFormError('ดึงข้อมูลลูกค้าไม่สำเร็จ');
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      if (!(selectedCustomer && selectedCustomer.id)) return;
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
        setPendingPhone(false);

        let hydratedCustomer = null;
        if (searchCustomerByPhoneAndDepositAction && /^[0-9]{10}$/.test(cleanPhone)) {
          try {
            hydratedCustomer = await searchCustomerByPhoneAndDepositAction(cleanPhone);
          } catch {
            // noop
          }
        }

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
    if (phoneInputRef.current) phoneInputRef.current.focus();
  };

  return (
    <div className="w-full p-2.5 font-semibold text-slate-700 text-xs select-none bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 mb-2">
        <div className="p-1 bg-slate-900/5 text-slate-800 rounded-md">
          <User className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-xs font-black text-slate-900">
          {customerType !== 'INDIVIDUAL' ? 'ข้อมูลคู่ค้าหน่วยงาน/นิติบุคคล' : 'ข้อมูลรายละเอียดผู้ซื้อ'}
        </h2>
      </div>

      <div className="flex gap-4 mb-2 text-[10px] font-black text-slate-400">
        <label className="flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors select-none">
          <input type="radio" name="searchMode" checked={searchMode === 'name'} onChange={() => setSearchMode('name')} className="accent-slate-900 h-3 w-3" />
          <span className={searchMode === 'name' ? "text-slate-900 font-black" : ""}>ค้นจากรายชื่อ</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors select-none">
          <input type="radio" name="searchMode" checked={searchMode === 'phone'} onChange={() => setSearchMode('phone')} className="accent-slate-900 h-3 w-3" />
          <span className={searchMode === 'phone' ? "text-slate-900 font-black" : ""}>ค้นจากเบอร์โทร</span>
        </label>
      </div>

      <div className="relative mb-2.5">
        {searchMode === 'phone' ? (
          <>
            <Phone className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
            <InputMask
              key={clearKey}
              mask="099-999-9999"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setRawPhone(e.target.value.replace(/-/g, ''));
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyCustomer()}
            >
              {(inputProps) => (
                <input
                  {...inputProps}
                  ref={phoneInputRef}
                  id="customer-phone-input"
                  type="tel"
                  placeholder="ป้อนเบอร์โทร 10 หลักแล้วกด Enter..."
                  className="h-7 w-full pl-7 pr-8 font-mono font-black text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-xs shadow-inner"
                />
              )}
            </InputMask>
          </>
        ) : (
          <>
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="พิมพ์ชื่อลูกค้าแล้วกด Enter..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyCustomer()}
              className="h-7 w-full pl-7 pr-8 font-bold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-xs shadow-inner"
            />
          </>
        )}
        
        <div className="absolute right-2 top-2 text-slate-400 pointer-events-none">
          {customerLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3 opacity-30" />}
        </div>
      </div>

      {formError && <div className="bg-rose-50 border border-rose-100 p-1.5 rounded-md text-[10px] font-black text-rose-600 mb-2 animate-slideUp">{formError}</div>}
      {formInfo && <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-md text-[10px] font-black text-emerald-700 mb-2 animate-slideUp">{formInfo}</div>}

      {searchMode === 'name' && searchResults.length > 0 && (
        <div className="mb-2 border border-slate-200 rounded-xl p-1.5 bg-slate-50 max-h-32 overflow-y-auto space-y-1 shadow-inner animate-fadeIn">
          {searchResults.map((cust) => {
            const displayLabel = (cust.type === 'ORGANIZATION' || cust.type === 'GOVERNMENT') ? (cust.companyName || cust.name || '-') : (cust.name || cust.companyName || '-');
            return (
              <button
                key={cust.id}
                type="button"
                onClick={() => handleSelectCustomer(cust)}
                disabled={customerLoading}
                className={`block w-full text-left px-4 py-2 border rounded-md transition-all text-[11px] font-bold ${selectedSearchCustomerId === cust.id ? 'border-slate-900 bg-slate-100 text-slate-900 font-black' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'}`}
              >
                <div className="truncate">{displayLabel}</div>
              </button>
            );
          })}
        </div>
      )}

      {shouldShowCustomerDetails && (
        <div className="text-xs font-bold text-slate-700 bg-slate-50/40 border border-slate-200 rounded-xl p-2 space-y-2 animate-fadeIn">
          
          <div className="flex gap-4 text-[10px] font-black text-slate-400 pb-1 border-b border-slate-100/80 mb-1">
            {['INDIVIDUAL', 'ORGANIZATION', 'GOVERNMENT'].map((type) => (
              <label key={type} className="flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors select-none">
                <input type="radio" name="customerType" value={type} className="accent-slate-900"
                  checked={customerType === type} onChange={() => { setCustomerType(type); setIsModified(true); }} />
                <span className={customerType === type ? "text-slate-900 font-black" : ""}>
                  {type === 'INDIVIDUAL' ? 'บุคคลทั่วไป' : type === 'ORGANIZATION' ? 'นิติบุคคล' : 'หน่วยงาน'}
                </span>
              </label>
            ))}
          </div>

          <div className="space-y-1.5">
            {(customerType === 'ORGANIZATION' || customerType === 'GOVERNMENT') && (
              <div className="space-y-1.5 animate-fadeIn">
                <input type="text" placeholder="🏢 ระบุชื่อบริษัท / หน่วยงานสังกัด..." value={companyName} onChange={(e) => { setCompanyName(e.target.value); setIsModified(true); }} className="h-7 border border-slate-200 px-2 rounded-lg w-full text-slate-900 font-black outline-none focus:border-slate-900 text-xs shadow-sm" />
                <input type="text" placeholder="🧾 เลขผู้เสียภาษี (ถ้ามี)..." value={taxId} onChange={(e) => { setTaxId(e.target.value); setIsModified(true); }} className="h-7 border border-slate-200 px-2 rounded-lg w-full text-slate-900 font-mono font-bold outline-none focus:border-slate-900 text-xs shadow-sm" />
              </div>
            )}

            <div className="relative">
              <input type="text" id="customer-name-input" placeholder="ชื่อ-นามสกุล ผู้ซื้อ..." value={name} onChange={(e) => { setName(e.target.value); setIsModified(true); }} className="h-7 border border-slate-200 pl-2 pr-7 rounded-lg w-full text-slate-900 font-black outline-none focus:border-slate-900 text-xs shadow-sm font-medium" />
              <User className="w-3.5 h-3.5 text-slate-300 absolute right-2.5 top-1.5" />
            </div>

            <div className="relative">
              <input type="email" placeholder="อีเมลติดต่อส่งบิลดิจิทัล (ถ้ามี)..." value={email} onChange={(e) => { setEmail(e.target.value); setIsModified(true); }} className="h-7 border border-slate-200 pl-2 pr-7 rounded-lg w-full text-slate-900 font-bold outline-none focus:border-slate-900 text-xs shadow-sm" />
              <Mail className="w-3.5 h-3.5 text-slate-300 absolute right-2.5 top-1.5" />
            </div>
            
            <div className="w-full pt-0.5 max-w-full overflow-hidden">
              <div className="text-[10px] text-slate-400 pl-0.5 mb-1 font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> ข้อมูลพิกัดส่งบิลเอกสาร:
              </div>
              <div className="address-form-density-compact">
                <AddressForm value={addressValue} onChange={handleAddressChange} provinceFilter={provinceFilterFn} layout="subdistrict-with-postcode" required />
              </div>
            </div>

            {selectedCustomer && selectedCustomer.customerAddress && !isModified && (
              <div className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 rounded-lg p-1.5 select-all leading-relaxed shadow-sm">
                📌 {selectedCustomer.customerAddress}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end select-none pt-0.5">
            {selectedCustomer ? (
              <button onClick={handleUpdateCustomer} disabled={!isModified} className={`h-6 px-3 text-white font-black text-[10px] rounded-md shadow-sm transition-all ${isModified ? 'bg-slate-900 hover:bg-slate-800 active:scale-95' : 'bg-slate-300 cursor-not-allowed shadow-none'}`}>
                อัปเดตข้อมูลลูกค้า
              </button>
            ) : (
              !selectedCustomer && pendingPhone && (
                <div className="flex gap-1.5">
                  <button onClick={handleConfirmCreateCustomer} className="h-6 px-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] rounded-md shadow-sm font-black active:scale-95 transition-all">
                    บันทึกลูกค้าใหม่
                  </button>
                  <button onClick={handleCancelCreateCustomer} className="h-6 px-3 bg-white border border-slate-200 text-slate-500 text-[10px] rounded-md shadow-sm font-bold hover:bg-slate-50 active:scale-95 transition-all">
                    ยกเลิก
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
      
      <div className="p-1 bg-slate-50/40 border-t border-slate-100 text-[9px] font-bold text-slate-400 flex items-center gap-1 mt-2">
        <ShieldCheck className="w-3 h-3 text-slate-400" />
        <span>Real-time POS Multi-Terminal Synchronized</span>
      </div>
    </div>
  );
};

export default CustomerSection;