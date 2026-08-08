import React from 'react';
import RepairShellHeader from '../../../components/RepairShellHeader';
import RuntimeStatePanel from '../../../components/RuntimeStatePanel';
import QueueBoard from '../../../components/QueueBoard';

const RepairQueueWorkspace = ({
  query,
  onQueryChange,
  onRefresh,
  loading,
  error,
  jobs,
  lanes,
  onRetry,
  onOpenJob,
}) => (
  <div>
    <RepairShellHeader
      eyebrow="Repair Operations"
      title="คิวงานซ่อม"
      description="จัดงานแบบ operation lanes เพื่อให้เห็นงานรับเข้า งานกำลังซ่อม งานรออะไหล่ และงานพร้อมส่งมอบในหน้าจอเดียว"
    />

    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="ค้นหาเลขใบงาน ลูกค้า รุ่น อาการ Barcode, Serial หรือ IMEI"
          className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4"
        />

        <button
          type="button"
          onClick={onRefresh}
          className="min-h-12 rounded-xl bg-blue-700 px-6 font-black text-white"
        >
          รีเฟรชคิว
        </button>
      </div>
    </div>

    <RuntimeStatePanel
      loading={loading}
      error={error}
      empty={!loading && !error && !jobs.length}
      emptyText="ยังไม่มีงานซ่อมในระบบ"
      onRetry={onRetry}
    />

    {!loading && !error && jobs.length ? (
      <QueueBoard lanes={lanes} type="repair" onOpen={onOpenJob} />
    ) : null}
  </div>
);

export default RepairQueueWorkspace;
