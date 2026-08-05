import React from 'react';

const buttonBase = 'inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

const StockAuditActionBar = ({
  sessionId,
  sessionClosed,
  isStarting,
  isConfirming,
  isCancelling,
  onStart,
  onCancel,
  onMarkLost,
  onMarkPending,
}) => {
  const roundLocked = isConfirming || isCancelling || !sessionId || sessionClosed;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">จัดการรอบตรวจนับ</h2>
          <p className="mt-1 text-xs text-slate-500">
            เริ่มรอบก่อนสแกน และเลือกวิธีปิดรอบตามผลตรวจจริง
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end">
          {!sessionId ? (
            <button
              type="button"
              className={`${buttonBase} bg-teal-700 text-white hover:bg-teal-800 sm:col-span-2 xl:col-span-1`}
              onClick={onStart}
              disabled={isStarting}
            >
              {isStarting ? 'กำลังเริ่มรอบ...' : 'เริ่มรอบตรวจนับ'}
            </button>
          ) : (
            <button
              type="button"
              className={`${buttonBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
              onClick={onCancel}
              disabled={isCancelling || isConfirming}
            >
              {isCancelling ? 'กำลังยกเลิก...' : 'ยกเลิกรอบ'}
            </button>
          )}

          <button
            type="button"
            className={`${buttonBase} border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100`}
            onClick={onMarkLost}
            disabled={roundLocked}
          >
            บันทึกสินค้าสูญหาย
          </button>

          <button
            type="button"
            className={`${buttonBase} border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100`}
            onClick={onMarkPending}
            disabled={roundLocked}
          >
            ปิดรอบแบบค้างตรวจ
          </button>
        </div>
      </div>
    </section>
  );
};

export default StockAuditActionBar;
