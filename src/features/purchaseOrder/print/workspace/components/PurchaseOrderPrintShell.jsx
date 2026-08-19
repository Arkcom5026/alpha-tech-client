import React from 'react';
import PurchaseOrderPresentationFooter from '../../../components/PurchaseOrderPresentationFooter';
import { formatPurchaseOrderMoney } from '../policies/purchaseOrderPrintPolicy';

const PurchaseOrderPrintShell = ({
  printRef,
  headerConfig = {},
  po,
  lines,
  total,
  presentationFooterContent,
  presentationFooterFontSize,
}) => (
  <div className="purchase-order-print-shell min-h-screen bg-slate-100 px-4 py-6 print:min-h-0 print:bg-white print:p-0">
    <style>{`
      @page { size: A4; margin: 4mm; }
      .purchase-order-a4-page {
        box-sizing: border-box;
        width: 210mm;
        min-height: 296mm;
        margin: 0 auto;
        padding: 6mm;
        font-family: var(--document-font-family, "TH Sarabun New", "Sarabun", Tahoma, Arial, sans-serif);
      }
      @media print {
        html, body, #root, .purchase-order-print-shell {
          width: auto !important; min-height: 0 !important; height: auto !important;
          margin: 0 !important; padding: 0 !important; overflow: visible !important; background: #fff !important;
        }
        body * { visibility: hidden; }
        .purchase-order-a4-page, .purchase-order-a4-page * { visibility: visible; }
        .purchase-order-a4-page {
          position: relative !important; box-sizing: border-box !important;
          width: 201mm !important; min-height: 288mm !important; height: 288mm !important;
          margin: 0 auto !important; padding: 5mm !important; overflow: hidden !important;
          border: 0.3mm solid #444 !important; border-radius: 2.5mm !important;
          box-shadow: none !important; background: #fff !important;
          font-family: var(--document-font-family, "TH Sarabun New", "Sarabun", Tahoma, Arial, sans-serif) !important;
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
      }
    `}</style>

    <article ref={printRef} className="print-area purchase-order-a4-page relative bg-white text-[14px] text-black shadow-sm">
      <div role="banner" className="mb-5 flex items-start justify-between gap-4 border-b border-slate-300 pb-3">
        <div className="flex min-w-0 items-start gap-3">
          {headerConfig?.logoUrl ? <img src={headerConfig.logoUrl} alt="logo" className="h-16 w-16 shrink-0 object-contain" /> : null}
          <div className="min-w-0">
            {headerConfig?.branchName ? <h1 className="text-[18px] font-bold leading-tight">{headerConfig.branchName}</h1> : null}
            {headerConfig?.address ? <p className="leading-tight">{headerConfig.address}</p> : null}
            {headerConfig?.phone ? <p className="leading-tight">โทร: {headerConfig.phone}</p> : null}
            {headerConfig?.taxId ? <p className="leading-tight">เลขประจำตัวผู้เสียภาษี: {headerConfig.taxId}</p> : null}
            {headerConfig?.headerStyle?.headerNote ? <p className="mt-1 leading-tight">{headerConfig.headerStyle.headerNote}</p> : null}
          </div>
        </div>
        <div className="shrink-0 text-right leading-tight">
          <p className="font-bold">ใบสั่งซื้อ</p>
          <p>PURCHASE ORDER</p>
        </div>
      </div>

      <div className="mb-5 text-center">
        <h1 className="text-[22px] font-bold leading-tight">ใบสั่งซื้อ (Purchase Order)</h1>
        <p>เลขที่: {po.code || '-'}</p>
        <p>วันที่: {po.date || po.createdAt ? new Date(po.date || po.createdAt).toLocaleDateString('th-TH') : '-'}</p>
      </div>

      <div className="mb-4 rounded-[2mm] border border-black p-3 leading-tight">
        <h2 className="font-bold">ผู้ขาย (Supplier)</h2>
        <p>{po.supplier?.name || '-'}</p>
        <p>{po.supplier?.address || '(ข้อมูลที่อยู่ / เบอร์ติดต่อ เพิ่มเติม)'}</p>
        {po.supplier?.phone ? <p>โทร: {po.supplier.phone}</p> : null}
      </div>

      <table className="w-full table-fixed border-collapse border border-black text-[13px] leading-tight">
        <thead><tr className="bg-gray-100">
          <th className="w-[7%] border border-black px-1 py-1">#</th>
          <th className="w-[49%] border border-black px-2 py-1 text-left">ชื่อสินค้า / DESCRIPTION</th>
          <th className="w-[10%] border border-black px-1 py-1">จำนวน</th>
          <th className="w-[17%] border border-black px-2 py-1 text-right">ราคาต่อหน่วย</th>
          <th className="w-[17%] border border-black px-2 py-1 text-right">รวม</th>
        </tr></thead>
        <tbody>
          {lines.length === 0 ? <tr><td colSpan={5} className="border border-black p-4 text-center">ไม่มีรายการสินค้า</td></tr> : lines.map((line, idx) => (
            <tr key={line.id ?? idx}>
              <td className="border border-black px-1 py-1 text-center">{idx + 1}</td>
              <td className="border border-black px-2 py-1">{line.name}</td>
              <td className="border border-black px-1 py-1 text-center">{line.quantity.toLocaleString('th-TH')}</td>
              <td className="border border-black px-2 py-1 text-right tabular-nums">{formatPurchaseOrderMoney(line.costPrice)} ฿</td>
              <td className="border border-black px-2 py-1 text-right tabular-nums">{formatPurchaseOrderMoney(line.lineTotal)} ฿</td>
            </tr>
          ))}
          <tr className="font-bold"><td colSpan={4} className="border border-black px-2 py-1 text-right">รวมทั้งสิ้น</td><td className="border border-black px-2 py-1 text-right tabular-nums">{formatPurchaseOrderMoney(total)} ฿</td></tr>
        </tbody>
      </table>

      {po.note ? <div className="mt-4 rounded-[2mm] border border-slate-400 p-2 leading-tight"><h3 className="mb-1 font-bold">หมายเหตุ</h3><p className="whitespace-pre-line">{po.note}</p></div> : null}

      <PurchaseOrderPresentationFooter content={presentationFooterContent} fontSizePx={presentationFooterFontSize} />

      <div className="signature-space absolute bottom-[8mm] left-[6mm] right-[6mm] grid grid-cols-2 gap-12 text-center text-[14px]">
        <div className="flex h-[20mm] flex-col justify-end"><div className="border-t border-dashed border-black pt-1">ผู้สั่งซื้อ</div></div>
        <div className="flex h-[20mm] flex-col justify-end"><div className="border-t border-dashed border-black pt-1">ผู้ขาย (ลงชื่อรับทราบ)</div></div>
      </div>
    </article>
  </div>
);

export default PurchaseOrderPrintShell;
