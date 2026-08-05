import React from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';

export default function ReceiptWorkspaceHeader({ loading, shopSlug }) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-teal-700">ตรวจรับสินค้าจากใบสั่งซื้อ</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            รายการใบสั่งซื้อที่รอตรวจรับ
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ค้นหา ตรวจสอบ และเริ่มรับสินค้าเข้าคลังของร้าน {shopSlug || 'ปัจจุบัน'}
          </p>
        </div>

        <div
          role="status"
          aria-live="polite"
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 text-sm font-semibold text-teal-800"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
          {loading ? 'กำลังเชื่อมต่อข้อมูล' : 'เชื่อมต่อข้อมูลแล้ว'}
        </div>
      </div>
    </header>
  );
}
