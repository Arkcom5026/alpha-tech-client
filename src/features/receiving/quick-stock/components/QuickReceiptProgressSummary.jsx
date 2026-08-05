import React from 'react';
import { CheckCircle2, PackageSearch, ScanLine, Truck } from 'lucide-react';

const steps = [
  { key: 'header', label: 'ข้อมูลใบส่งของ', icon: Truck },
  { key: 'product', label: 'เลือกสินค้า', icon: PackageSearch },
  { key: 'intake', label: 'สแกนและกำหนดราคา', icon: ScanLine },
  { key: 'review', label: 'ตรวจทานและยืนยัน', icon: CheckCircle2 },
];

const QuickReceiptProgressSummary = ({ headerReady = false, productReady = false, queueReady = false, hasLines = false }) => {
  const readiness = { header: headerReady, product: productReady, intake: queueReady, review: hasLines };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="ความคืบหน้าการรับสินค้าด่วน">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {steps.map(({ key, label, icon: Icon }, index) => {
          const ready = readiness[key];
          return (
            <div key={key} className={`rounded-xl border p-3 ${ready ? 'border-teal-200 bg-teal-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${ready ? 'bg-teal-600 text-white' : 'bg-white text-slate-500'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500">ขั้นตอน {index + 1}</p>
                  <p className="truncate text-sm font-semibold text-slate-800">{label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default QuickReceiptProgressSummary;
