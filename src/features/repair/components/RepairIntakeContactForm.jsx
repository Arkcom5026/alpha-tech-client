import React from 'react';

const RepairIntakeContactForm = ({ value, customer, onChange }) => {
  const update = (field, nextValue) => onChange({ ...value, [field]: nextValue });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Intake Contact Snapshot</p>
        <h2 className="mt-1 text-lg font-black text-slate-950">ผู้ส่งอุปกรณ์ในครั้งนี้</h2>
        <p className="mt-1 text-xs text-slate-500">
          ลูกค้าเป็นเจ้าของบัญชี แต่ผู้ที่นำอุปกรณ์มาส่งอาจเป็นบุคคลอื่น จึงเก็บข้อมูล Snapshot แยกจาก Customer
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          value={value.contactName}
          onChange={(event) => update('contactName', event.target.value)}
          placeholder="ชื่อผู้ส่งอุปกรณ์ *"
          className="min-h-11 rounded-xl border border-slate-300 px-3"
        />
        <input
          value={value.contactPhone}
          onChange={(event) => update('contactPhone', event.target.value)}
          placeholder="เบอร์โทรผู้ส่ง"
          inputMode="tel"
          className="min-h-11 rounded-xl border border-slate-300 px-3"
        />
        <input
          value={value.contactEmail}
          onChange={(event) => update('contactEmail', event.target.value)}
          placeholder="อีเมลผู้ส่ง"
          type="email"
          className="min-h-11 rounded-xl border border-slate-300 px-3"
        />
        <input
          value={value.contactOrganization}
          onChange={(event) => update('contactOrganization', event.target.value)}
          placeholder="บริษัท/หน่วยงาน"
          className="min-h-11 rounded-xl border border-slate-300 px-3"
        />
        <input
          value={value.contactRelationship}
          onChange={(event) => update('contactRelationship', event.target.value)}
          placeholder="ความสัมพันธ์กับเจ้าของ เช่น ผู้ใช้เครื่อง/พนักงาน"
          className="min-h-11 rounded-xl border border-slate-300 px-3 md:col-span-2"
        />
        <button
          type="button"
          onClick={() =>
            onChange({
              contactName: customer?.name || customer?.companyName || '',
              contactPhone: customer?.phone || customer?.user?.phone || '',
              contactEmail: customer?.email || '',
              contactOrganization: customer?.companyName || '',
              contactRelationship: 'เจ้าของอุปกรณ์',
            })
          }
          className="min-h-11 rounded-xl border border-violet-300 bg-violet-50 px-4 text-sm font-black text-violet-800 md:col-span-2"
        >
          ใช้ข้อมูลเดียวกับลูกค้า
        </button>
      </div>
    </section>
  );
};

export default RepairIntakeContactForm;
