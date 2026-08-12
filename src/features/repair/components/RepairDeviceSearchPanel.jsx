import React from 'react';
import IntakeSearchPanel from './IntakeSearchPanel';

const COPY = {
  customer: { eyebrow: 'Customer Search', title: 'ค้นหาลูกค้า' },
  asset: { eyebrow: 'Repair Asset Search', title: 'ค้นหาสิ่งที่รับซ่อม' },
  all: { eyebrow: 'Unified Intake Search', title: 'ค้นหาลูกค้าหรือสิ่งที่รับซ่อม' },
};

const RepairDeviceSearchPanel = ({ mode = 'all', ...props }) => {
  const copy = COPY[mode] || COPY.all;
  return <section>
    <div className="mb-2">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{copy.eyebrow}</p>
      <h2 className="mt-1 text-lg font-black text-slate-950">{copy.title}</h2>
    </div>
    <IntakeSearchPanel mode={mode} {...props} />
  </section>;
};

export default RepairDeviceSearchPanel;
