import { HelpCircle, Search } from 'lucide-react';
import { STOCK_ITEM_WORKING_GROUP } from '../policies/stockItemScanWorkflowPolicy';

const resolveGroupLabel = (workingGroup) => {
  if (workingGroup === STOCK_ITEM_WORKING_GROUP.SINGLE_PRODUCT) return 'กลุ่มสินค้าชนิดเดียว';
  if (workingGroup === STOCK_ITEM_WORKING_GROUP.MIXED_PRODUCT) return 'หลายกลุ่มสินค้า';
  return 'ไม่มีรายการในกลุ่ม';
};

const StockItemWorkingGroupResults = ({
  workingGroup,
  filterInputRef,
  textFilter,
  setTextFilter,
  rows = [],
  resolveProductName,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="รายการค้างรับ">
    <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <HelpCircle className="text-amber-500" size={20} />
        <div>
          <h2 className="font-semibold text-slate-900">รายการค้างรับ</h2>
          <p className="text-xs text-slate-500">{resolveGroupLabel(workingGroup)}</p>
        </div>
      </div>

      <div className="relative w-full md:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          ref={filterInputRef}
          type="search"
          value={textFilter}
          onChange={(event) => setTextFilter(event.target.value)}
          placeholder="ค้นหาสินค้า / SKU / Barcode"
          className="min-h-11 w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
      </div>
    </div>

    <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          ไม่มีรายการค้างรับในกลุ่มนี้
        </p>
      ) : rows.map((row, index) => (
        <article key={row.id ?? `${row.barcode}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">{resolveProductName(row)}</p>
              <p className="mt-1 font-mono text-sm text-teal-700">{row.barcode || '-'}</p>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              ค้างรับ
            </span>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default StockItemWorkingGroupResults;
