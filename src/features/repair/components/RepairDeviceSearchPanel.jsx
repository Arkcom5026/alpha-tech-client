import React from 'react';
import IntakeSearchPanel from './IntakeSearchPanel';

const RepairDeviceSearchPanel = (props) => (
  <section>
    <div className="mb-2">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Unified Intake Search</p>
      <h2 className="mt-1 text-lg font-black text-slate-950">ค้นหาลูกค้าหรืออุปกรณ์</h2>
    </div>
    <IntakeSearchPanel {...props} />
  </section>
);

export default RepairDeviceSearchPanel;
