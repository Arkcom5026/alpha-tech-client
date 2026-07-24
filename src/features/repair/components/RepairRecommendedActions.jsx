import React from 'react';

const actionLabel = {
  OPEN_ACTIVE_REPAIR: 'เปิดใบงานซ่อมเดิม',
  OPEN_ACTIVE_CLAIM: 'เปิดรายการเคลมเดิม',
  CREATE_REPAIR_JOB: 'เปิดใบรับซ่อมใหม่',
  ASSESS_WARRANTY_CLAIM: 'ประเมินสิทธิ์ส่งเคลม',
};

const RepairRecommendedActions = ({ context, onCreate, onNavigate }) => {
  const actions = context?.recommendedActions || [];
  if (!actions.length) return null;

  const execute = (action) => {
    if (action.type === 'CREATE_REPAIR_JOB') return onCreate();
    if (action.type === 'OPEN_ACTIVE_REPAIR') {
      return onNavigate(`/advancetech/pos/service/repairs/${action.referenceId}`);
    }
    if (action.type === 'OPEN_ACTIVE_CLAIM') {
      return onNavigate(`/advancetech/pos/service/warranty-claims/${action.referenceId}`);
    }
    return onCreate();
  };

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <h2 className="text-lg font-black text-blue-950">ระบบแนะนำขั้นตอนถัดไป</h2>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {actions.map((action) => (
          <button
            key={`${action.type}-${action.referenceId || 'new'}`}
            type="button"
            onClick={() => execute(action)}
            className="rounded-xl border border-blue-200 bg-white p-4 text-left shadow-sm hover:border-blue-500"
          >
            <p className="font-black text-blue-900">{actionLabel[action.type] || action.type}</p>
            <p className="mt-1 text-sm text-slate-600">{action.reason}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default RepairRecommendedActions;
