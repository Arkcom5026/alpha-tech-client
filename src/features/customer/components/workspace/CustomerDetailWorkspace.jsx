import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw, Save, UserRound } from 'lucide-react';
import { toast } from 'react-toastify';
import AddressForm from '@/features/address/components/AddressForm';
import {
  getManagedCustomerDetail,
  updateCustomerProfilePos,
} from '@/features/customer/api/customerApi';

const CUSTOMER_TYPES = [
  { value: 'INDIVIDUAL', label: 'บุคคลทั่วไป' },
  { value: 'ORGANIZATION', label: 'นิติบุคคล' },
  { value: 'GOVERNMENT', label: 'หน่วยงานรัฐ' },
];

const fieldClass = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100';
const emptyEditor = {
  name: '', phone: '', email: '', type: 'INDIVIDUAL', companyName: '', taxId: '',
  addressDetail: '', provinceCode: '', districtCode: '', subdistrictCode: '', postcode: '',
};

const toEditor = (customer) => ({
  name: customer?.name || '',
  phone: customer?.phone || '',
  email: customer?.email || '',
  type: customer?.type || 'INDIVIDUAL',
  companyName: customer?.companyName || '',
  taxId: customer?.taxId || '',
  addressDetail: customer?.addressDetail || '',
  provinceCode: customer?.provinceCode || '',
  districtCode: customer?.districtCode || '',
  subdistrictCode: customer?.subdistrictCode || '',
  postcode: customer?.postcode || '',
});

const CustomerDetailWorkspace = ({ customerId, onBack }) => {
  const [customer, setCustomer] = useState(null);
  const [editor, setEditor] = useState(emptyEditor);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getManagedCustomerDetail(customerId);
      setCustomer(data);
      setEditor(toEditor(data));
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'โหลดรายละเอียดลูกค้าไม่สำเร็จ';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => { load(); }, [load]);

  const patch = (next) => setEditor((current) => ({ ...current, ...next }));
  const isOrganization = ['ORGANIZATION', 'GOVERNMENT'].includes(editor.type);
  const taxIdDigits = String(editor.taxId || '').replace(/\D/g, '');
  const taxIdentityReady = !isOrganization || taxIdDigits.length === 13;
  const dirty = useMemo(() => customer && JSON.stringify(editor) !== JSON.stringify(toEditor(customer)), [customer, editor]);

  const save = async () => {
    if (!customerId || saving) return;
    if (isOrganization && editor.taxId && !taxIdentityReady) {
      toast.error('เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await updateCustomerProfilePos(customerId, {
        name: editor.name,
        phone: editor.phone,
        type: editor.type,
        companyName: editor.companyName,
        taxId: taxIdDigits || '',
        addressDetail: editor.addressDetail,
        subdistrictCode: editor.subdistrictCode || '',
        postcode: editor.postcode || '',
      });
      setCustomer(updated);
      setEditor(toEditor(updated));
      toast.success('บันทึกข้อมูลลูกค้าเรียบร้อยแล้ว');
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'บันทึกข้อมูลลูกค้าไม่สำเร็จ';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const addressValue = {
    address: editor.addressDetail,
    provinceCode: editor.provinceCode,
    districtCode: editor.districtCode,
    subdistrictCode: editor.subdistrictCode,
    postalCode: editor.postcode,
  };

  return (
    <div className="min-h-full bg-slate-50 p-3 md:p-5">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-2xl border border-teal-100 bg-teal-50 p-4 md:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-teal-200 bg-white p-2.5 text-teal-700"><UserRound className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-semibold text-teal-700">ข้อมูลลูกค้า</p>
                <h1 className="mt-1 text-xl font-semibold text-slate-900 md:text-2xl">รายละเอียดและแก้ไขข้อมูลลูกค้า</h1>
                <p className="mt-1 text-sm text-slate-600">รหัสลูกค้า {customerId || '-'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={load} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-teal-200 bg-white px-4 text-sm font-semibold text-teal-800 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />โหลดใหม่</button>
              <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-teal-200 bg-white px-4 text-sm font-semibold text-teal-800"><ArrowLeft className="h-4 w-4" />กลับรายการลูกค้า</button>
            </div>
          </div>
        </header>

        {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</div> : null}

        {loading ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">กำลังโหลดข้อมูลลูกค้า...</section>
        ) : customer ? (
          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-slate-900">ข้อมูลหลักของลูกค้า</h2>
              <p className="mt-1 text-sm text-slate-500">ข้อมูลส่วนนี้เป็นแหล่งข้อมูลต้นทางสำหรับงานขาย เอกสาร และข้อมูลผู้รับในงานภาษี</p>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-slate-700">ประเภทลูกค้า</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {CUSTOMER_TYPES.map((item) => (
                  <button key={item.value} type="button" onClick={() => patch({ type: item.value })} className={`min-h-11 rounded-xl border px-3 text-sm font-bold ${editor.type === item.value ? 'border-teal-400 bg-teal-100 text-teal-950' : 'border-slate-200 bg-white text-slate-700'}`}>{item.label}</button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {isOrganization ? <>
                <label className="text-sm font-semibold text-slate-700">ชื่อบริษัทหรือหน่วยงาน<input className={`${fieldClass} mt-1.5`} value={editor.companyName} onChange={(e) => patch({ companyName: e.target.value })} /></label>
                <label className="text-sm font-semibold text-slate-700">เลขประจำตัวผู้เสียภาษี<input inputMode="numeric" className={`${fieldClass} mt-1.5 font-mono`} value={editor.taxId} onChange={(e) => patch({ taxId: e.target.value.replace(/\D/g, '').slice(0, 13) })} placeholder="13 หลัก" />{editor.taxId && !taxIdentityReady ? <span className="mt-1 block text-xs font-semibold text-amber-700">ต้องมี 13 หลักจึงพร้อมสำหรับใบกำกับภาษีเต็มรูป</span> : null}</label>
              </> : null}
              <label className="text-sm font-semibold text-slate-700">ชื่อผู้ติดต่อ<input className={`${fieldClass} mt-1.5`} value={editor.name} onChange={(e) => patch({ name: e.target.value })} /></label>
              <label className="text-sm font-semibold text-slate-700">เบอร์โทร<input className={`${fieldClass} mt-1.5 font-mono`} value={editor.phone} onChange={(e) => patch({ phone: e.target.value })} /></label>
              <label className="text-sm font-semibold text-slate-700 md:col-span-2">อีเมล<input className={`${fieldClass} mt-1.5 bg-slate-50`} value={editor.email} readOnly /><span className="mt-1 block text-xs font-normal text-slate-400">อีเมลยังเป็นข้อมูลจากบัญชีผู้ใช้ จึงแสดงแบบอ่านอย่างเดียวในหน้านี้</span></label>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-black text-slate-800">ที่อยู่สำหรับเอกสารและภาษี</h3>
              <div className="address-form-density-compact rounded-xl border border-slate-200 bg-slate-50 p-3">
                <AddressForm value={addressValue} onChange={(next) => patch({ addressDetail: next?.address || '', provinceCode: next?.provinceCode || '', districtCode: next?.districtCode || '', subdistrictCode: next?.subdistrictCode || '', postcode: next?.postalCode || next?.postcode || '' })} layout="subdistrict-with-postcode" required />
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">{dirty ? 'มีข้อมูลที่ยังไม่ได้บันทึก' : 'ข้อมูลล่าสุดถูกบันทึกแล้ว'}</div>
              <button type="button" onClick={save} disabled={!dirty || saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"><Save className="h-4 w-4" />{saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default CustomerDetailWorkspace;
