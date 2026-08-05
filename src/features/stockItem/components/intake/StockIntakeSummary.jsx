import React from 'react';
import { Boxes, ScanLine, Layers3 } from 'lucide-react';

const cards = [
  { key: 'receipts', label: 'ใบรับทั้งหมด', icon: Boxes, tone: 'border-slate-200 bg-white text-slate-900' },
  { key: 'sn', label: 'SN ค้างยิง', icon: ScanLine, tone: 'border-blue-200 bg-blue-50 text-blue-800' },
  { key: 'lot', label: 'LOT ค้างเปิด', icon: Layers3, tone: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
];

export default function StockIntakeSummary({ receiptCount = 0, pendingSN = 0, pendingLOT = 0 }) {
  const values = { receipts: receiptCount, sn: pendingSN, lot: pendingLOT };

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="สรุปคิวรับสินค้าเข้าสู่สต๊อก">
      {cards.map(({ key, label, icon: Icon, tone }) => (
        <div key={key} className={`rounded-2xl border p-4 shadow-sm ${tone}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold opacity-70">{label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{values[key]}</p>
            </div>
            <Icon className="h-6 w-6 opacity-70" />
          </div>
        </div>
      ))}
    </section>
  );
}
