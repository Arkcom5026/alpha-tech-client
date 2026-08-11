import React from 'react';
import {
  formatTaxDate,
  formatTaxMoney,
  linkStateLabel,
  receiptIdentity,
  remainingReceiptAmount,
  sourceTypeLabel,
} from '../utils/inputTaxReceiptLink';

const badge = {
  UNLINKED: 'bg-amber-50 text-amber-700',
  PARTIALLY_LINKED: 'bg-blue-50 text-blue-700',
  LINKED: 'bg-emerald-50 text-emerald-700',
};

const InputTaxReceiptCandidateTable = ({
  receipts,
  selected,
  selectedSupplierId,
  loading,
  onToggle,
  onAllocationChange,
}) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 p-4">
      <h2 className="font-black text-slate-900">ขั้นตอนที่ 1 · เลือกใบรับสินค้า</h2>
      <p className="text-xs text-slate-500">เลือกได้หลายใบ แต่ต้องเป็นผู้จำหน่ายรายเดียวกันและอ้างอิงใบกำกับภาษีจริงฉบับเดียวกัน</p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
          <tr>
            <th className="p-3">เลือก</th><th className="p-3">ใบรับ / ใบส่งสินค้า</th>
            <th className="p-3">ผู้จำหน่าย</th><th className="p-3">วันที่รับ</th>
            <th className="p-3 text-right">ยอดใบรับ</th><th className="p-3 text-right">ยอดที่ยังไม่ได้ผูก</th>
            <th className="p-3">สถานะ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {receipts.map((receipt) => {
            const key = receiptIdentity(receipt);
            const selection = selected[key];
            const supplierConflict = selectedSupplierId && Number(selectedSupplierId) !== Number(receipt.supplierId);
            return (
              <React.Fragment key={key}>
                <tr className={selection ? 'bg-blue-50/50' : ''}>
                  <td className="p-3"><input type="checkbox" checked={Boolean(selection)} disabled={supplierConflict} onChange={() => onToggle(receipt)} /></td>
                  <td className="p-3"><p className="font-bold text-slate-900">{receipt.receiptCode}</p><p className="text-xs text-slate-500">{sourceTypeLabel[receipt.sourceType]} · {receipt.deliveryNoteNumber || 'ไม่มีเลขใบส่งสินค้า'}</p></td>
                  <td className="p-3"><p className="font-semibold text-slate-800">{receipt.supplierName}</p><p className="text-xs text-slate-500">รหัส #{receipt.supplierId}</p></td>
                  <td className="p-3 text-slate-600">{formatTaxDate(receipt.receivedAt)}</td>
                  <td className="p-3 text-right font-semibold">{formatTaxMoney(receipt.receiptAmount)}</td>
                  <td className="p-3 text-right font-bold text-blue-700">{formatTaxMoney(remainingReceiptAmount(receipt))}</td>
                  <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge[receipt.linkState] || 'bg-slate-100 text-slate-600'}`}>{linkStateLabel[receipt.linkState] || 'รอตรวจสอบสถานะ'}</span></td>
                </tr>
                {selection && (
                  <tr className="bg-blue-50/30">
                    <td />
                    <td colSpan={6} className="p-3">
                      <div className="grid gap-2 sm:grid-cols-3">
                        {[
                          ['allocatedSubtotal', 'มูลค่าก่อนภาษีมูลค่าเพิ่ม'],
                          ['allocatedVatAmount', 'ภาษีมูลค่าเพิ่ม'],
                          ['allocatedTotalAmount', 'ยอดรวมที่นำไปผูก'],
                        ].map(([field, label]) => (
                          <label key={field}><span className="mb-1 block text-xs font-bold text-slate-600">{label}</span><input type="number" min="0" step="0.01" value={selection[field]} onChange={(event) => onAllocationChange(key, field, event.target.value)} className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-right" /></label>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {!loading && receipts.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-slate-500">ไม่พบใบรับสินค้าตามตัวกรอง</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

export default InputTaxReceiptCandidateTable;
