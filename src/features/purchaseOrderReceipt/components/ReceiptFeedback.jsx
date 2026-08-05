import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ReceiptFeedback({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">ไม่สามารถโหลดข้อมูลตรวจรับสินค้าได้</p>
        <p className="mt-1 break-words text-sm text-rose-700">{error?.message || String(error)}</p>
      </div>
      {typeof onDismiss === 'function' && (
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-rose-700 transition hover:bg-rose-100"
          aria-label="ปิดข้อความแจ้งเตือน"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
