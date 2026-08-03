import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitPartnerStoreApplication } from '../api/partnerStoreApplicationApi';

const initialForm = {
  businessName: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  password: '',
  confirmPassword: '',
  businessAddress: '',
  requestedStorefrontSlug: '',
  note: '',
};

const messageFrom = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  'ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่อีกครั้ง';

export default function PartnerStoreApplicationPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('ยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitPartnerStoreApplication({
        businessName: form.businessName.trim(),
        contactName: form.contactName.trim(),
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim().toLowerCase(),
        password: form.password,
        businessAddress: form.businessAddress.trim(),
        requestedStorefrontSlug: form.requestedStorefrontSlug.trim() || undefined,
        note: form.note.trim() || undefined,
      });
      setSubmitted(response.data?.data || null);
      setForm(initialForm);
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#FDFBF9] px-4 py-12 text-slate-800">
        <section className="mx-auto max-w-xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Application received</p>
          <h1 className="mt-3 text-3xl font-black">ส่งใบสมัครร้านพาร์ตเนอร์แล้ว</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            เลขอ้างอิง <strong>{submitted.applicationCode}</strong><br />
            บัญชีเจ้าของร้านถูกสำรองไว้แล้ว แต่ยังเข้าสู่ระบบไม่ได้จนกว่าใบสมัครจะได้รับอนุมัติ
          </p>
          <Link to="/partner-portal" className="mt-7 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">
            กลับหน้าพาร์ตเนอร์
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF9] px-4 py-8 text-slate-800 md:py-12">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-9">
        <Link to="/partner-portal" className="text-sm font-bold text-orange-600">← กลับหน้าพาร์ตเนอร์</Link>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-orange-500">Partner application</p>
        <h1 className="mt-2 text-3xl font-black">สมัครเป็นร้านพาร์ตเนอร์</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          กรอกข้อมูลร้านและกำหนดบัญชีเจ้าของร้าน ระบบจะสำรองบัญชีไว้แบบยังไม่เปิดใช้งานจนกว่าเจ้าหน้าที่จะอนุมัติ
        </p>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}

        <form className="mt-7 space-y-5" onSubmit={submit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold">ชื่อร้าน
              <input required value={form.businessName} onChange={update('businessName')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-medium" />
            </label>
            <label className="text-sm font-bold">ชื่อผู้ติดต่อ / เจ้าของร้าน
              <input required value={form.contactName} onChange={update('contactName')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-medium" />
            </label>
            <label className="text-sm font-bold">เบอร์โทรศัพท์
              <input required value={form.contactPhone} onChange={update('contactPhone')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-medium" />
            </label>
            <label className="text-sm font-bold">อีเมลสำหรับเข้าสู่ระบบ
              <input required type="email" autoComplete="email" value={form.contactEmail} onChange={update('contactEmail')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-medium" />
            </label>
            <label className="text-sm font-bold">รหัสผ่าน
              <input required minLength="8" type="password" autoComplete="new-password" value={form.password} onChange={update('password')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-medium" />
            </label>
            <label className="text-sm font-bold">ยืนยันรหัสผ่าน
              <input required minLength="8" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={update('confirmPassword')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-medium" />
            </label>
          </div>
          <p className="rounded-xl bg-amber-50 p-3 text-xs font-medium leading-5 text-amber-800">
            ใช้อีเมลและรหัสผ่านชุดนี้เข้าสู่ Merchant Center หลังจากใบสมัครได้รับอนุมัติแล้ว
          </p>
          <label className="block text-sm font-bold">ที่อยู่สถานประกอบการ
            <textarea required rows="3" value={form.businessAddress} onChange={update('businessAddress')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-medium" />
          </label>
          <label className="block text-sm font-bold">ชื่อย่อหน้าร้าน (ไม่บังคับ)
            <input value={form.requestedStorefrontSlug} onChange={update('requestedStorefrontSlug')} placeholder="my-shop" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-mono font-medium" />
          </label>
          <label className="block text-sm font-bold">หมายเหตุ (ไม่บังคับ)
            <textarea rows="2" value={form.note} onChange={update('note')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-medium" />
          </label>
          <button disabled={submitting} className="w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white disabled:opacity-60">
            {submitting ? 'กำลังส่งใบสมัคร…' : 'ส่งใบสมัคร'}
          </button>
        </form>
      </section>
    </main>
  );
}
