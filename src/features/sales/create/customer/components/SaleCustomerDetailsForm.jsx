import React from 'react';
import { Mail, MapPin, User } from 'lucide-react';
import AddressForm from '@/features/address/components/AddressForm';

const SaleCustomerDetailsForm = ({
  editor,
  selectedCustomer,
  isModified,
  pendingCreate,
  provinceFilter,
  onPatch,
  onCreate,
  onUpdate,
  onCancelCreate,
}) => {
  const addressValue = {
    address: editor.addressDetail,
    provinceCode: editor.provinceCode,
    districtCode: editor.districtCode,
    subdistrictCode: editor.subdistrictCode,
    postalCode: editor.postalCode,
  };

  return (
    <div className="text-xs font-bold text-slate-700 bg-slate-50/40 border border-slate-200 rounded-xl p-2 space-y-2 animate-fadeIn">
      <div className="flex gap-4 text-[10px] font-black text-slate-400 pb-1 border-b border-slate-100/80 mb-1">
        {['INDIVIDUAL', 'ORGANIZATION', 'GOVERNMENT'].map((type) => (
          <label key={type} className="flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors select-none">
            <input
              type="radio"
              name="customerType"
              value={type}
              className="accent-slate-900"
              checked={editor.customerType === type}
              onChange={() => onPatch({ customerType: type })}
            />
            <span className={editor.customerType === type ? 'text-slate-900 font-black' : ''}>
              {type === 'INDIVIDUAL' ? 'บุคคลทั่วไป' : type === 'ORGANIZATION' ? 'นิติบุคคล' : 'หน่วยงาน'}
            </span>
          </label>
        ))}
      </div>

      <div className="space-y-1.5">
        {(editor.customerType === 'ORGANIZATION' || editor.customerType === 'GOVERNMENT') && (
          <div className="space-y-1.5 animate-fadeIn">
            <input
              type="text"
              placeholder="🏢 ระบุชื่อบริษัท / หน่วยงานสังกัด..."
              value={editor.companyName}
              onChange={(event) => onPatch({ companyName: event.target.value })}
              className="h-7 border border-slate-200 px-2 rounded-lg w-full text-slate-900 font-black outline-none focus:border-slate-900 text-xs shadow-sm"
            />
            <input
              type="text"
              placeholder="🧾 เลขผู้เสียภาษี (ถ้ามี)..."
              value={editor.taxId}
              onChange={(event) => onPatch({ taxId: event.target.value })}
              className="h-7 border border-slate-200 px-2 rounded-lg w-full text-slate-900 font-mono font-bold outline-none focus:border-slate-900 text-xs shadow-sm"
            />
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            id="customer-name-input"
            placeholder="ชื่อ-นามสกุล ผู้ซื้อ..."
            value={editor.name}
            onChange={(event) => onPatch({ name: event.target.value })}
            className="h-7 border border-slate-200 pl-2 pr-7 rounded-lg w-full text-slate-900 font-black outline-none focus:border-slate-900 text-xs shadow-sm font-medium"
          />
          <User className="w-3.5 h-3.5 text-slate-300 absolute right-2.5 top-1.5" />
        </div>

        <input
          type="tel"
          placeholder="เบอร์โทรลูกค้า..."
          value={editor.phone}
          onChange={(event) => onPatch({ phone: event.target.value })}
          className="h-7 border border-slate-200 px-2 rounded-lg w-full text-slate-900 font-mono font-black outline-none focus:border-slate-900 text-xs shadow-sm"
        />

        <div className="relative">
          <input
            type="email"
            placeholder="อีเมลติดต่อส่งบิลดิจิทัล (ถ้ามี)..."
            value={editor.email}
            onChange={(event) => onPatch({ email: event.target.value })}
            className="h-7 border border-slate-200 pl-2 pr-7 rounded-lg w-full text-slate-900 font-bold outline-none focus:border-slate-900 text-xs shadow-sm"
          />
          <Mail className="w-3.5 h-3.5 text-slate-300 absolute right-2.5 top-1.5" />
        </div>

        <div className="w-full pt-0.5 max-w-full overflow-hidden">
          <div className="text-[10px] text-slate-400 pl-0.5 mb-1 font-bold flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" /> ข้อมูลพิกัดส่งบิลเอกสาร:
          </div>
          <div className="address-form-density-compact">
            <AddressForm
              value={addressValue}
              onChange={(next) => onPatch({
                addressDetail: next?.address || '',
                provinceCode: next?.provinceCode || '',
                districtCode: next?.districtCode || '',
                subdistrictCode: next?.subdistrictCode || '',
                postalCode: next?.postalCode || next?.postcode || '',
              })}
              provinceFilter={provinceFilter}
              layout="subdistrict-with-postcode"
              required
            />
          </div>
        </div>

        {selectedCustomer?.customerAddress && !isModified && (
          <div className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 rounded-lg p-1.5 select-all leading-relaxed shadow-sm">
            📌 {selectedCustomer.customerAddress}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end select-none pt-0.5">
        {selectedCustomer ? (
          <button
            type="button"
            onClick={onUpdate}
            disabled={!isModified}
            className={`h-6 px-3 text-white font-black text-[10px] rounded-md shadow-sm transition-all ${isModified ? 'bg-slate-900 hover:bg-slate-800 active:scale-95' : 'bg-slate-300 cursor-not-allowed shadow-none'}`}
          >
            อัปเดตข้อมูลลูกค้า
          </button>
        ) : pendingCreate ? (
          <div className="flex gap-1.5">
            <button type="button" onClick={onCreate} className="h-6 px-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] rounded-md shadow-sm font-black active:scale-95 transition-all">
              บันทึกลูกค้าใหม่
            </button>
            <button type="button" onClick={onCancelCreate} className="h-6 px-3 bg-white border border-slate-200 text-slate-500 text-[10px] rounded-md shadow-sm font-bold hover:bg-slate-50 active:scale-95 transition-all">
              ยกเลิก
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SaleCustomerDetailsForm;
