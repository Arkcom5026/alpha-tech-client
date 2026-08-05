import React from 'react';
import { MapPin } from 'lucide-react';
import AddressForm from '@/features/address/components/AddressForm';

const CUSTOMER_TYPES = [
  { value: 'INDIVIDUAL', label: 'บุคคลทั่วไป' },
  { value: 'ORGANIZATION', label: 'นิติบุคคล' },
  { value: 'GOVERNMENT', label: 'หน่วยงาน' },
];

const fieldClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100';

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

  const isOrganization =
    editor.customerType === 'ORGANIZATION' || editor.customerType === 'GOVERNMENT';

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 md:p-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-700">ประเภทลูกค้า</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CUSTOMER_TYPES.map((type) => {
            const active = editor.customerType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => onPatch({ customerType: type.value })}
                className={`min-h-11 rounded-xl border px-3 text-sm font-semibold transition ${
                  active
                    ? 'border-emerald-300 bg-emerald-100 text-emerald-950'
                    : 'border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {isOrganization ? (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">ชื่อบริษัทหรือหน่วยงาน</label>
              <input
                type="text"
                value={editor.companyName}
                onChange={(event) => onPatch({ companyName: event.target.value })}
                placeholder="ชื่อบริษัทหรือหน่วยงาน"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">เลขประจำตัวผู้เสียภาษี</label>
              <input
                type="text"
                value={editor.taxId}
                onChange={(event) => onPatch({ taxId: event.target.value })}
                placeholder="เลขประจำตัวผู้เสียภาษี (ถ้ามี)"
                className={`${fieldClass} font-mono`}
              />
            </div>
          </>
        ) : null}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">ชื่อผู้ติดต่อ</label>
          <input
            type="text"
            id="customer-name-input"
            value={editor.name}
            onChange={(event) => onPatch({ name: event.target.value })}
            placeholder="ชื่อ-นามสกุล"
            className={fieldClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">เบอร์โทร</label>
          <input
            type="tel"
            inputMode="tel"
            value={editor.phone}
            onChange={(event) => onPatch({ phone: event.target.value })}
            placeholder="เบอร์โทรลูกค้า"
            className={`${fieldClass} font-mono`}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">อีเมล</label>
          <input
            type="email"
            value={editor.email}
            onChange={(event) => onPatch({ email: event.target.value })}
            placeholder="อีเมลสำหรับรับเอกสาร (ถ้ามี)"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
          <MapPin className="h-4 w-4 text-teal-700" />
          ที่อยู่สำหรับเอกสารและการจัดส่ง
        </div>
        <div className="address-form-density-compact overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
          <AddressForm
            value={addressValue}
            onChange={(next) =>
              onPatch({
                addressDetail: next?.address || '',
                provinceCode: next?.provinceCode || '',
                districtCode: next?.districtCode || '',
                subdistrictCode: next?.subdistrictCode || '',
                postalCode: next?.postalCode || next?.postcode || '',
              })
            }
            provinceFilter={provinceFilter}
            layout="subdistrict-with-postcode"
            required
          />
        </div>
      </div>

      {selectedCustomer?.customerAddress && !isModified ? (
        <div className="rounded-xl border border-teal-100 bg-teal-50 px-3 py-2 text-xs leading-5 text-teal-900">
          ที่อยู่เดิม: {selectedCustomer.customerAddress}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {selectedCustomer ? (
          <button
            type="button"
            onClick={onUpdate}
            disabled={!isModified}
            className="h-11 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            บันทึกการแก้ไข
          </button>
        ) : pendingCreate ? (
          <>
            <button
              type="button"
              onClick={onCancelCreate}
              className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={onCreate}
              className="h-11 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              เพิ่มลูกค้าใหม่
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SaleCustomerDetailsForm;
