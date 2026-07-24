import React from 'react';

const RepairStatePanel = ({ loading, error, searched = true, onRetry }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm font-bold text-blue-700">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <p className="font-black text-rose-800">ไม่สามารถดำเนินการได้</p>
        <p className="mt-1 text-sm text-rose-700">{error}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-xl bg-rose-700 px-4 py-2 text-sm font-bold text-white"
          >
            ลองใหม่
          </button>
        ) : null}
      </div>
    );
  }

  if (!searched) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center text-sm text-slate-500">
        สแกนบาร์โค้ดหรือกรอกหมายเลขซีเรียลเพื่อเริ่มรับเรื่อง
      </div>
    );
  }

  return null;
};

export default RepairStatePanel;
