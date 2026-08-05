import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function PurchaseOrderListFeedback({ isLoading, error }) {
  if (isLoading) {
    return (
      <div className="flex min-h-20 items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-4 text-sm font-semibold text-teal-900" role="status">
        <RefreshCw className="h-5 w-5 shrink-0 animate-spin" />
        <span>กำลังโหลดข้อมูลใบสั่งซื้อ...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-20 items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900" role="alert">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">ไม่สามารถโหลดข้อมูลใบสั่งซื้อได้</p>
          <p className="mt-1 text-rose-700">{error}</p>
        </div>
      </div>
    );
  }

  return null;
}
