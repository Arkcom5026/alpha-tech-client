import React from 'react';
import RepairShellHeader from '../../../components/RepairShellHeader';
import RuntimeStatePanel from '../../../components/RuntimeStatePanel';
import ClaimQueueBoard from './ClaimQueueBoard';

const WarrantyClaimQueueWorkspace = ({
  query,
  onQueryChange,
  onRefresh,
  loading,
  error,
  filteredClaims,
  activeLanes,
  onRetry,
  onOpenClaim,
}) => (
  <div>
    <RepairShellHeader
      eyebrow="Warranty Operations"
      title="คิวงานเคลม"
      description="ติดตามงานเคลมตั้งแต่ร่างรายการ การขนส่ง การตรวจสอบ การซ่อม ไปจนถึงผลการเคลม"
    />

    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="ค้นหาเลขเคลม เหตุผล Supplier Tracking หรือเลขอ้างอิง"
          className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4"
        />

        <button
          type="button"
          onClick={onRefresh}
          className="min-h-12 rounded-xl bg-indigo-700 px-6 font-black text-white"
        >
          รีเฟรชคิว
        </button>
      </div>
    </div>

    <RuntimeStatePanel
      loading={loading}
      error={error}
      empty={!loading && !error && !filteredClaims.length}
      emptyText={query.trim() ? 'ไม่พบงานเคลมที่ตรงกับคำค้นหา' : 'ยังไม่มีงานเคลมในระบบ'}
      onRetry={onRetry}
    />

    {!loading && !error && activeLanes.length ? (
      <ClaimQueueBoard lanes={activeLanes} onOpen={onOpenClaim} />
    ) : null}
  </div>
);

export default WarrantyClaimQueueWorkspace;
