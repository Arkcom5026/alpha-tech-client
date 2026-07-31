import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRepairRuntimeStore from '../store/repairRuntimeStore';
import RepairShellHeader from '../components/RepairShellHeader';
import RuntimeStatePanel from '../components/RuntimeStatePanel';
import QueueBoard from '../components/QueueBoard';
import { REPAIR_LANES, groupByStatus } from '../utils/repairRuntime';

const summaryCards = [
  ['active', 'งานที่กำลังเปิด'],
  ['overdue', 'เกิน SLA'],
  ['unassigned', 'ยังไม่มอบหมายช่าง'],
  ['intakeIncomplete', 'หลักฐานรับเครื่องไม่ครบ'],
  ['waitingParts', 'รออะไหล่'],
  ['waitingCustomerApproval', 'รอลูกค้าอนุมัติ'],
  ['waitingCustomerPickup', 'รอลูกค้ารับเครื่อง'],
];

const RepairJobsPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const [query, setQuery] = useState('');

  const jobs = useRepairRuntimeStore((state) => state.jobs);
  const repairSummary = useRepairRuntimeStore((state) => state.repairSummary);
  const loading = useRepairRuntimeStore((state) => state.loading);
  const error = useRepairRuntimeStore((state) => state.error);
  const loadJobs = useRepairRuntimeStore((state) => state.loadJobs);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return jobs;

    return jobs.filter((job) =>
      [
        job.jobNo,
        job.deviceModel,
        job.reportedSymptoms,
        job.customerName,
        job.stockItem?.barcode,
        job.stockItem?.serialNumber,
        job.device?.barcode,
        job.device?.serialNumber,
        job.device?.imei,
        ...(job.operational?.exceptions || []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [jobs, query]);

  const lanes = useMemo(
    () => groupByStatus(filtered, REPAIR_LANES),
    [filtered]
  );

  return (
    <div>
      <RepairShellHeader
        eyebrow="Repair Control Center"
        title="คิวงานซ่อมและ SLA"
        description="เห็นงานค้าง งานผิดปกติ งานเกิน SLA และงานที่ต้องติดตามจากข้อมูลที่ Server รับรอง"
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(([key, label]) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{repairSummary?.[key] || 0}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาเลขใบงาน รุ่น อาการ ลูกค้า หรือ exception"
            className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4"
          />

          <button
            type="button"
            onClick={() => loadJobs()}
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
        onRetry={() => loadJobs()}
      />

      {!loading && !error && jobs.length ? (
        <QueueBoard
          lanes={lanes}
          type="repair"
          onOpen={(job) =>
            navigate(`/${shopSlug}/pos/services/repairs/${job.id}`)
          }
        />
      ) : null}
    </div>
  );
};

export default RepairJobsPage;
