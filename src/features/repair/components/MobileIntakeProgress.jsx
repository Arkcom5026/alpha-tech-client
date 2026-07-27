import React from 'react';

const MobileIntakeProgress = ({ hasCustomer, hasDevice, enteringDetails }) => {
  const current = enteringDetails || hasDevice ? 3 : hasCustomer ? 2 : 1;
  const steps = [
    ['ค้นหา', 'ลูกค้าหรืออุปกรณ์'],
    ['ลูกค้า', 'ยืนยันเจ้าของ'],
    ['รับเครื่อง', 'อาการและหลักฐาน'],
  ];

  return (
    <section className="mb-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm xl:hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Mobile Intake</p>
          <h2 className="mt-1 font-black text-slate-950">รับเครื่องด้วยโทรศัพท์</h2>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          ขั้นที่ {current}/3
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {steps.map(([title, detail], index) => {
          const step = index + 1;
          const active = current >= step;
          return (
            <div key={title} className={`rounded-xl px-2 py-3 text-center ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              <p className="text-xs font-black">{title}</p>
              <p className={`mt-1 text-[9px] ${active ? 'text-blue-100' : 'text-slate-400'}`}>{detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MobileIntakeProgress;
