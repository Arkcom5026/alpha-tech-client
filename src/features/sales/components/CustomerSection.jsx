// src/features/sales/components/CustomerSection.jsx
// 🏛️ Premium Next-Gen POS Customer Console: (Extreme Grid Compact Edition)

import React, { useEffect, useRef, useState, useMemo } from 'react';
import InputMask from 'react-input-mask';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import useCustomerStore from '@/features/customer/store/customerStore';
import { useAddressStore } from '@/features/address/store/addressStore';
import AddressForm from '@/features/address/components/AddressForm';
import { User, Search, Phone, RefreshCw, CheckCircle2, ShieldCheck, Mail, MapPin } from 'lucide-react';

const CustomerSection = ({ productSearchRef, clearTrigger, hideCustomerDetails, onSaleModeSelect }) => {
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

  // ---- Address States
  const [addressDetail, setAddressDetail] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [subdistrictCode, setSubdistrictCode] = useState('');
  const [postalCode, setPostalCode] = useState('');

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

  const { ensureProvincesAction, resolveBySubdistrictCodeAction } = useAddressStore();
  const {
    setCustomerDepositAmount,
    searchCustomerByPhoneAndDepositAction,
    searchCustomerByNameAndDepositAction,
    searchCustomerByCustomerIdAndDepositAction,
    setSelectedDeposit,
    clearCustomerAndDeposit,
  } = useCustomerDepositStore();
  const { updateCustomerProfilePosAction, createCustomerAction } = useCustomerStore();
  const { setCustomerIdAction } = useSalesStore();

  const shouldShowCustomerDetails = true;

  useEffect(() => {
    (async () => {
      if (ensureProvincesAction) {
        try { await ensureProvincesAction(); } catch { /* noop */ }
      }
    })();
  }, [ensureProvincesAction]);

  useEffect(() => {
    const t = setTimeout(() => { if (phoneInputRef.current) phoneInputRef.current.focus(); }, 300);
    return () => clearTimeout(t);
  }, []);

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
    setIsModified(false); setFormError(''); setFormInfo(''); setPendingPhone(false);
    setCustomerIdAction(null); clearCustomerAndDeposit(); _setShouldShowDetails(false);
    const delay = setTimeout(() => {
      if (phoneInputRef.current) { phoneInputRef.current.focus(); phoneInputRef.current.select(); }
      setIsClearing(false);
    }, 300);
    return () => clearTimeout(delay);
  }, [clearTrigger, setCustomerIdAction, clearCustomerAndDeposit, setCustomerDepositAmount, setSelectedDeposit]);

  useEffect(() => {
    if (!(selectedCustomer && !isClearing)) return;
    setPhone(selectedCustomer.phone);
    setName(selectedCustomer.name || '');
    setEmail(selectedCustomer.email || '');
    setAddressDetail(selectedCustomer.addressDetail || selectedCustomer.address || '');

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

  const processSelectedCustomer = (payload) => {
    const customer = payload?.customer || payload;
    if (!(customer && customer.id)) return;

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
      const fullPayload = searchCustomerByCustomerIdAndDepositAction
        ? await searchCustomerByCustomerIdAndDepositAction(customer.id)
        : null;
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
          } catch { /* noop */ }
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
    /* 🟢 [GRID REFACTOR]: บีบอัดระยะเว้นว่าง (Padding) ของคอนโซลซ้ายให้ฟิตและลีนสายตาที่สุด */
    <div className="w-full p-2.5 font-semibold text-slate-700 text-xs select-none">
      <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 mb-2">
        <div className="p-1 bg-slate-900/5 text-slate-800 rounded-md">
          <User className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-xs font-black text-slate-900">
          {customerType !== 'INDIVIDUAL' ? 'ข้อมูลคู่ค้าหน่วยงาน/นิติบุคคล' : 'ข้อมูลรายละเอียดผู้ซื้อ'}
        </h2>
      </div>

      <div className="flex gap-4 mb-2 text-[10px] font-black text-slate-400">
        <label className="flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors">
          <input type="radio" name="searchMode" checked={searchMode === 'name'} onChange={() => setSearchMode('name')} className="accent-slate-900 h-3 w-3" />
          <span className={searchMode === 'name' ? "text-slate-900" : ""}>ค้นจากรายชื่อ</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors">
          <input type="radio" name="searchMode" checked={searchMode === 'phone'} onChange={() => setSearchMode('phone')} className="accent-slate-900 h-3 w-3" />
          <span className={searchMode === 'phone' ? "text-slate-900" : ""}>ค้นจากเบอร์โทร</span>
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
                  className="h-7 w-full pl-7 pr-8 font-mono font-black text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-xs"
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
              className="h-7 w-full pl-7 pr-8 font-bold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-xs"
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
                className={`block w-full text-left px-2 py-1 border rounded-md transition-all text-[11px] font-bold ${selectedSearchCustomerId === cust.id ? 'border-slate-900 bg-slate-100 text-slate-900 font-black' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'}`}
              >
                <div className="truncate">{displayLabel}</div>
              </button>
            );
          })}
        </div>
      )}

      {shouldShowCustomerDetails && (
        /* 🟢 [UI MINIMALISM]: เปลี่ยนสัดส่วนความห่างของฟิลด์ภายในแผงสรุปให้อยู่ในระบบหนาแน่นสูง (High-Density) */
        <div className="text-xs font-bold text-slate-700 bg-slate-50/40 border border-slate-200 rounded-xl p-2 space-y-2">
          
          <div className="flex gap-4 text-[10px] font-black text-slate-400 pb-1 border-b border-slate-100/80 mb-1">
            {['INDIVIDUAL', 'ORGANIZATION', 'GOVERNMENT'].map((type) => (
              <label key={type} className="flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors">
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
                <input type="text" placeholder="🧾 เลขผู้เสียภาษี (ถ้ามี)..." value={taxId} onChange={(e) => { setTaxId(e.target.value); setIsModified(true); }} className="h-7 border border-slate-200 px-2 rounded-lg w-full text-slate-900 font-mono font-bold outline-none focus:border-slate-900 text-xs" />
              </div>
            )}

            <div className="relative">
              <input type="text" id="customer-name-input" placeholder="ชื่อ-นามสกุล ผู้ซื้อ..." value={name} onChange={(e) => { setName(e.target.value); setIsModified(true); }} className="h-7 border border-slate-200 pl-2 pr-7 rounded-lg w-full text-slate-900 font-black outline-none focus:border-slate-900 text-xs shadow-sm" />
              <User className="w-3.5 h-3.5 text-slate-300 absolute right-2.5 top-1.5" />
            </div>

            <div className="relative">
              <input type="email" placeholder="อีเมลติดต่อส่งบิลดิจิทัล (ถ้ามี)..." value={email} onChange={(e) => { setEmail(e.target.value); setIsModified(true); }} className="h-7 border border-slate-200 pl-2 pr-7 rounded-lg w-full text-slate-900 font-bold outline-none focus:border-slate-900 text-xs shadow-sm" />
              <Mail className="w-3.5 h-3.5 text-slate-300 absolute right-2.5 top-1.5" />
            </div>
            
            {/* 🟢 [ADDRESS FIXED GRID]: ปลดล็อก Layout ดั้งเดิมของ AddressForm ให้หดกระชับตัวเข้าเลน ไม่กว้างทะลักกรอบ */}
            <div className="w-full pt-0.5 max-w-full overflow-hidden">
              <div className="text-[10px] text-slate-400 pl-0.5 mb-1 font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> ข้อมูลพิกัดส่งบิลเอกสาร:
              </div>
              <div className="address-form-density-compact">
                <AddressForm value={addressValue} onChange={handleAddressChange} layout="subdistrict-with-postcode" required />
              </div>
            </div>

            {/* 🟢 [CLEAN HIDE]: บล็อกข้อมูลดิบระบบปัจจุบันจะแสดงเฉพาะในจังหวะสร้าง/แก้ไขที่มีข้อมูลขัดแย้งเท่านั้น เพื่อกันสายตาพนักงานหลุดโฟกัส */}
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