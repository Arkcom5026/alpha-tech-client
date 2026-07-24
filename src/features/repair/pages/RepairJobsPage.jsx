import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRepairRuntimeStore from '../store/repairRuntimeStore';
import RepairShellHeader from '../components/RepairShellHeader';
import RuntimeStatePanel from '../components/RuntimeStatePanel';
import QueueBoard from '../components/QueueBoard';
import { REPAIR_LANES, groupByStatus } from '../utils/repairRuntime';

const RepairJobsPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const [query, setQuery] = useState('');

  const jobs = useRepairRuntimeStore((state) => state.jobs);
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
      [job.jobNo, job.deviceModel, job.reportedSymptoms, job.customerName]
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
        eyebrow="Repair Operations"
        title="คิวงานซ่อม"
        description="จัดงานแบบ operation lanes เพื่อให้เห็นงานรับเข้า งานกำลังซ่อม งานรออะไหล่ และงานพร้อมส่งมอบในหน้าจอเดียว"
      />

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาเลขใบงาน รุ่น อาการ หรือลูกค้า"
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
