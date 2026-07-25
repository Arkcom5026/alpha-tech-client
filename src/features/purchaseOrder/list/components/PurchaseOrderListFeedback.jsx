import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function PurchaseOrderListFeedback({ isLoading, error }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-orange-500/10 bg-orange-500/5 p-4 text-xs font-bold text-orange-600">
        <RefreshCw className="h-4 w-4 animate-spin" />
        กำลังโหลดข้อมูลใบสั่งซื้อ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-black text-rose-600">
        ⚠️ {error}
      </div>
    );
  }

  return null;
}
