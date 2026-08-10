// src/features/customerReceipt/list/CustomerReceiptListWorkspace.jsx

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileCheck,
  FileText,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';

const formatMoney = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })
  : '-';

const SortIndicator = ({ active, direction }) => {
  if (!active) return null;
  return direction === 'asc'
    ? <ChevronUp className="w-3 h-3 inline pl-0.5" />
    : <ChevronDown className="w-3 h-3 inline pl-0.5" />;
};

const CustomerReceiptListWorkspace = ({
  keywordInput,
  onKeywordInputChange,
  onSearch,
  onReset,
  loading,
  error,
  successMessage,
  summary,
  sortedItems,
  sortKey,
  sortDir,
  onToggleSort,
  onOpenDetail,
  onOpenReprint,
}) => (
  <div className="w-full h-full p-2 md:p-3 space-y-3 max-w-[1600px] mx-auto text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn text-xs md:text-sm antialiased font-sans font-semibold">
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3.5 pb-2.5 border-b border-slate-100 select-none">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 bg-slate-900/5 text-slate-800 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wide">ประวัติใบรับชำระลูกหนี้ระบบเดิม</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">สำหรับตรวจสอบรายละเอียดและพิมพ์ย้อนหลังเท่านั้น การรับเงินและตัดยอดใหม่ให้ใช้ Customer Money</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto xl:justify-end">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={keywordInput}
              onChange={(event) => onKeywordInputChange(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && onSearch()}
              placeholder="พิมพ์ค้นรหัสใบรับเงิน / ลูกค้าหน่วยงาน..."
              className="h-8 w-56 pl-8 pr-3 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all shadow-inner"
            />
          </div>

          <button onClick={onSearch} disabled={loading} className="h-8 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-lg active:scale-95 transition-all shadow-sm flex items-center gap-1">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> ดึงข้อมูล
          </button>
          <button onClick={onReset} className="h-8 px-2.5 bg-slate-50 border border-slate-200 text-slate-500 font-bold text-xs rounded-lg hover:bg-slate-100 transition-all active:scale-95">
            ล้างตัวกรอง
          </button>
        </div>
      </div>

      {error && <div className="mx-3 my-2 bg-rose-50 border border-rose-100 p-2 rounded-lg text-[11px] font-black text-rose-600 animate-slideUp">⚠️ {error}</div>}
      {successMessage && <div className="mx-3 my-2 bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-[11px] font-black text-emerald-700 animate-slideUp">✓ {successMessage}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 bg-slate-50/50 border-b border-slate-100 select-none">
        <div className="border border-slate-150 rounded-xl p-2 bg-white shadow-inner">
          <div className="text-[10px] text-slate-400 font-black uppercase">ยอดทำใบรับเงินทั้งหมด</div>
          <div className="text-sm font-black text-slate-900 font-mono">{summary.totalReceipts} ใบเสร็จ <span className="text-[10px] text-slate-400 font-bold">(Active {summary.activeCount})</span></div>
        </div>
        <div className="border border-slate-150 rounded-xl p-2 bg-white shadow-inner">
          <div className="text-[10px] text-slate-400 font-black uppercase">มูลค่ารวมรับชำระสะสม</div>
          <div className="text-sm font-black text-slate-800 font-mono">{formatMoney(summary.totalAmount)} ฿</div>
        </div>
        <div className="border border-slate-150 rounded-xl p-2 bg-white shadow-inner">
          <div className="text-[10px] text-slate-400 font-black uppercase">ตัดจ่ายชำระบิลแล้ว</div>
          <div className="text-sm font-black text-emerald-700 font-mono">{formatMoney(summary.totalAllocated)} ฿</div>
        </div>
        <div className="border border-slate-150 rounded-xl p-2 bg-white shadow-inner">
          <div className="text-[10px] text-slate-400 font-black uppercase">วงเงินคงเหลือทำ Allocation</div>
          <div className="text-sm font-black text-orange-600 font-mono">{formatMoney(summary.totalRemaining)} ฿</div>
        </div>
      </div>

      <div className="p-2 px-3">
        <div className="overflow-x-auto rounded-xl border border-slate-100 overflow-y-auto max-h-[500px]">
          <table className="w-full text-left border-collapse border-slate-200 text-xs">
            <thead className="bg-slate-50 text-[10px] md:text-[11px] text-slate-400 font-black uppercase tracking-wider sticky top-0 z-10 border-b border-slate-100 select-none">
              <tr>
                <th className="p-2 px-2.5 cursor-pointer hover:bg-slate-100" onClick={() => onToggleSort('code')}>เลขที่ใบรับเงิน <SortIndicator active={sortKey === 'code'} direction={sortDir} /></th>
                <th className="p-2 px-2 cursor-pointer hover:bg-slate-100" onClick={() => onToggleSort('customerName')}>ลูกค้า/หน่วยงาน <SortIndicator active={sortKey === 'customerName'} direction={sortDir} /></th>
                <th className="p-2 px-2">ช่องทางชำระ</th>
                <th className="p-2 px-2 text-right cursor-pointer hover:bg-slate-100" onClick={() => onToggleSort('totalAmount')}>ยอดรับเงินรวม <SortIndicator active={sortKey === 'totalAmount'} direction={sortDir} /></th>
                <th className="p-2 px-2 text-right cursor-pointer hover:bg-slate-100" onClick={() => onToggleSort('allocatedAmount')}>ตัดยอดแล้ว <SortIndicator active={sortKey === 'allocatedAmount'} direction={sortDir} /></th>
                <th className="p-2 px-2 text-right cursor-pointer hover:bg-slate-100" onClick={() => onToggleSort('remainingAmount')}>คงเหลือตัดบิล <SortIndicator active={sortKey === 'remainingAmount'} direction={sortDir} /></th>
                <th className="p-2 px-2 cursor-pointer hover:bg-slate-100" onClick={() => onToggleSort('createdAt')}>วันที่ลงบันทึก <SortIndicator active={sortKey === 'createdAt'} direction={sortDir} /></th>
                <th className="p-2 px-2 text-center">สิทธิ์สถานะบิล</th>
                <th className="p-2 px-2.5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-[11px] sm:text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-1.5 opacity-50 text-slate-900" />
                    กำลังดึงข้อมูลบัญชีรับชำระหนี้ลูกหนี้กลางประจำสาขา...
                  </td>
                </tr>
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-400 font-black italic select-none">
                    📭 ไม่พบรายการประวัติใบรับเงินลูกหนี้ในช่วงขอบเขตเวลานี้ครับ
                  </td>
                </tr>
              ) : sortedItems.map((item) => {
                const remains = Number(item?.remainingAmount || 0);
                const isCancelled = item?.status === 'CANCELLED';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-2 px-2.5 font-mono font-black text-slate-900 select-all">{item.code || '—'}</td>
                    <td className="p-2 px-2 font-bold text-slate-800 max-w-[180px] truncate" title={item?.customer?.name}>{item?.customer?.companyName || item?.customer?.name || 'ลูกค้าทั่วไป'}</td>
                    <td className="p-2 px-2 text-slate-500 font-mono text-[11px]">{item.paymentMethod || 'เงินสด'}</td>
                    <td className="p-2 px-2 text-right font-mono text-slate-500">{formatMoney(item.totalAmount)}</td>
                    <td className="p-2 px-2 text-right font-mono text-emerald-700 font-bold">{formatMoney(item.allocatedAmount)}</td>
                    <td className="p-2 px-2 text-right font-mono text-orange-600 font-black">{formatMoney(remains)}</td>
                    <td className="p-2 px-2 font-mono text-slate-400">{formatDate(item.createdAt)}</td>
                    <td className="p-2 px-2 text-center select-none">
                      {isCancelled ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-black rounded bg-rose-50 text-rose-600">
                          <XCircle className="w-2.5 h-2.5" /> ยกเลิกสิทธิ์
                        </span>
                      ) : remains <= 0 ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-black rounded bg-slate-900/5 text-emerald-600 border border-slate-100">
                          <CheckCircle2 className="w-2.5 h-2.5" /> ตัดหนี้ครบถ้วน
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-black rounded bg-blue-50 text-blue-600 border border-blue-100">
                          <Clock className="w-2.5 h-2.5" /> รอทำ Allocation
                        </span>
                      )}
                    </td>
                    <td className="p-2 px-2.5 text-center select-none">
                      <div className="flex items-center justify-center gap-1 mx-auto">
                        <button type="button" onClick={() => onOpenDetail(item)} className="h-5 px-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-black text-[10px] rounded shadow-sm transition-all active:scale-95">
                          ดีเทล
                        </button>
                        <button type="button" onClick={() => onOpenReprint(item)} className="h-5 px-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 font-black text-[10px] rounded shadow-sm transition-all active:scale-95">
                          พิมพ์
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-2 bg-slate-50/40 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1 select-none">
        <FileCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>ระบบปิดงบทางการเงินประจำเซสชันจะคำนวณแยกส่วนกับ Payment Core ยอดคงเหลือสามารถนำไปตัดจ่ายในประวัติลูกหนี้หน่วยงานได้ทันที</span>
      </div>
    </div>
  </div>
);

export default CustomerReceiptListWorkspace;
