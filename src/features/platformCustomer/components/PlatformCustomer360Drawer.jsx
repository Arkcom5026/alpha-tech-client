import React from 'react';
import { Building2, Clock3, ShieldCheck, Store, UserRound, X } from 'lucide-react';

const customerTypeLabels = {
  INDIVIDUAL: 'บุคคลทั่วไป',
  COMPANY: 'นิติบุคคล',
  GOVERNMENT: 'หน่วยงานรัฐ',
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const Field = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
    <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 break-words text-sm font-bold text-slate-800">{value || '-'}</p>
  </div>
);

const PlatformCustomer360Drawer = ({ identity, onClose }) => {
  if (!identity) return null;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-slate-950/35" role="dialog" aria-modal="true" aria-label="Customer 360 Governance">
      <button className="absolute inset-0 cursor-default" aria-label="ปิดรายละเอียด" onClick={onClose} />
      <aside className="relative h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 p-5 backdrop-blur">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Customer 360° Governance</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">Platform Identity #{identity.userId}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Read-only relationship overview</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:border-orange-300 hover:text-orange-600">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <section className="rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><UserRound className="h-5 w-5" /></div>
              <div>
                <h3 className="font-black text-slate-900">Platform Identity</h3>
                <p className="text-xs font-semibold text-slate-400">Authority: User</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="User ID" value={`#${identity.userId}`} />
              <Field label="Login" value={identity.loginId} />
              <Field label="Email" value={identity.email} />
              <Field label="Account Status" value={identity.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} />
              <Field label="Registered" value={formatDateTime(identity.createdAt)} />
              <Field label="Last Login" value={formatDateTime(identity.lastLoginAt)} />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><Store className="h-5 w-5" /></div>
              <div>
                <h3 className="font-black text-slate-900">Store Customer Relationships</h3>
                <p className="text-xs font-semibold text-slate-400">{identity.storeRelationshipCount || 0} profiles</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {(identity.storeRelationships || []).map((profile) => (
                <article key={profile.customerProfileId} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-black text-slate-900">{profile.branchName || `Branch #${profile.branchId}`}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-600">{profile.displayName || '-'}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">CustomerProfile #{profile.customerProfileId}</span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Field label="Customer Type" value={customerTypeLabels[profile.customerType] || profile.customerType} />
                    <Field label="Store Area" value={[profile.subdistrictName, profile.districtName, profile.provinceName].filter(Boolean).join(' · ')} />
                    <Field label="Profile Created" value={formatDateTime(profile.profileCreatedAt)} />
                    <Field label="Profile Updated" value={formatDateTime(profile.profileUpdatedAt)} />
                  </div>
                </article>
              ))}
              {!identity.storeRelationships?.length && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">ยังไม่มี Store Customer Relationship</p>}
            </div>
          </section>

          <section className="rounded-3xl border border-amber-200 bg-amber-50/40 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-black text-amber-900">Legacy Unassigned Profiles</h3>
                <p className="text-xs font-semibold text-amber-700">ยังไม่ใช่ลูกค้าของแพลตฟอร์ม</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {(identity.unassignedRelationships || []).map((profile) => (
                <article key={profile.customerProfileId} className="rounded-2xl border border-amber-200 bg-white p-4">
                  <p className="font-black text-slate-900">CustomerProfile #{profile.customerProfileId}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{profile.displayName || '-'}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Field label="Customer Type" value={customerTypeLabels[profile.customerType] || profile.customerType} />
                    <Field label="Profile Created" value={formatDateTime(profile.profileCreatedAt)} />
                  </div>
                </article>
              ))}
              {!identity.unassignedRelationships?.length && <p className="text-sm font-bold text-amber-700">ไม่มี Legacy Unassigned Profile</p>}
            </div>
          </section>

          <section className="rounded-3xl border border-violet-200 bg-violet-50/40 p-5">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-violet-600" />
              <div>
                <h3 className="font-black text-violet-900">Platform Customer</h3>
                <p className="text-xs font-semibold text-violet-700">Explicit platform-commerce relationship</p>
              </div>
            </div>
            <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-slate-600">ยังไม่ถูกสร้างจากธุรกรรมสินค้า/บริการที่แพลตฟอร์มเป็นเจ้าของ</p>
          </section>

          <section className="rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-slate-500" /><h3 className="font-black text-slate-900">Governance Timeline</h3></div>
            <p className="mt-3 text-sm font-semibold text-slate-500">ยังไม่มี Audit Timeline เฉพาะ Customer Governance ใน Source ปัจจุบัน จึงไม่สร้างข้อมูลจำลอง</p>
          </section>
        </div>
      </aside>
    </div>
  );
};

export default PlatformCustomer360Drawer;
