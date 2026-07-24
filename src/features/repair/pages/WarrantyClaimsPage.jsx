import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRepairRuntimeStore from '../store/repairRuntimeStore';
import RepairShellHeader from '../components/RepairShellHeader';
import RuntimeStatePanel from '../components/RuntimeStatePanel';
import QueueBoard from '../components/QueueBoard';
import { CLAIM_LANES, groupByStatus } from '../utils/repairRuntime';

const WarrantyClaimsPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const [query, setQuery] = useState('');

  const claims = useRepairRuntimeStore((state) => state.claims);
  const loading = useRepairRuntimeStore((state) => state.loading);
  const error = useRepairRuntimeStore((state) => state.error);
  const loadClaims = useRepairRuntimeStore((state) => state.loadClaims);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return claims;

    return claims.filter((claim) =>
      [
        claim.claimNo,
        claim.reason,
        claim.externalClaimRef,
        claim.trackingNumber,
        claim.supplier?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [claims, query]);

  const lanes = useMemo(
    () => groupByStatus(filtered, CLAIM_LANES),
    [filtered]
  );

  return (
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
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาเลขเคลม เหตุผล Supplier Tracking หรือเลขอ้างอิง"
            className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4"
          />

          <button
            type="button"
            onClick={() => loadClaims()}
            className="min-h-12 rounded-xl bg-indigo-700 px-6 font-black text-white"
          >
            รีเฟรชคิว
          </button>
        </div>
      </div>

      <RuntimeStatePanel
        loading={loading}
        error={error}
        empty={!loading && !error && !claims.length}
        emptyText="ยังไม่มีงานเคลมในระบบ"
        onRetry={() => loadClaims()}
      />

      {!loading && !error && claims.length ? (
        <QueueBoard
          lanes={lanes}
          type="claim"
          onOpen={(claim) =>
            navigate(`/${shopSlug}/pos/services/warranty-claims/${claim.id}`)
          }
        />
      ) : null}
    </div>
  );
};

export default WarrantyClaimsPage;
