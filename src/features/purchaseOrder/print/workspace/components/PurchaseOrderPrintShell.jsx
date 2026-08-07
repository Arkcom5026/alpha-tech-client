import React from 'react';
import { formatPurchaseOrderMoney } from '../policies/purchaseOrderPrintPolicy';

const PurchaseOrderPrintShell = ({
  printRef,
  branch,
  branchId,
  po,
  lines,
  total,
}) => (
  <div
    ref={printRef}
    className="print-area p-8 print:p-0 text-sm font-sans print:bg-white bg-white max-w-[800px] mx-auto"
  >
    <style>{`
      @media print {
        body * {
          visibility: hidden;
        }

        .print-area, .print-area * {
          visibility: visible;
        }

        .print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `}</style>

    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-xl font-bold">{branch?.name || 'ชื่อบริษัท'}</h1>
        <p className="text-xs text-muted-foreground">
          {branch?.address || 'ที่อยู่บริษัท'} | โทร: {branch?.phone || '-'} | อีเมล: {branch?.email || '-'}
        </p>
        {branch?.taxId ? (
          <p className="text-xs text-muted-foreground">
            เลขประจำตัวผู้เสียภาษี: {branch.taxId}
          </p>
        ) : null}
      </div>

      <div className="text-right text-xs text-muted-foreground">
        <p>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}</p>
        {branchId ? <p>Branch ID: {branchId}</p> : null}
      </div>
    </div>

    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold">ใบสั่งซื้อ (Purchase Order)</h1>
      <p className="text-muted-foreground">เลขที่: {po.code || '-'}</p>
      <p className="text-muted-foreground">
        วันที่: {po.createdAt ? new Date(po.createdAt).toLocaleDateString('th-TH') : '-'}
      </p>
    </div>

    <div className="mb-4">
      <h2 className="font-semibold">ผู้ขาย (Supplier)</h2>
      <p>{po.supplier?.name || '-'}</p>
      <p className="text-muted-foreground">
        {po.supplier?.address || '(ข้อมูลที่อยู่ / เบอร์ติดต่อ เพิ่มเติม)'}
      </p>
      {po.supplier?.phone ? (
        <p className="text-muted-foreground">โทร: {po.supplier.phone}</p>
      ) : null}
    </div>

    <table className="w-full border-collapse border text-sm">
      <thead>
        <tr className="bg-gray-100 border">
          <th className="border p-2">#</th>
          <th className="border p-2 text-left">ชื่อสินค้า</th>
          <th className="border p-2">จำนวน</th>
          <th className="border p-2">ราคาต่อหน่วย</th>
          <th className="border p-2">รวม</th>
        </tr>
      </thead>

      <tbody>
        {lines.length === 0 ? (
          <tr>
            <td colSpan={5} className="border p-4 text-center text-muted-foreground">
              ไม่มีรายการสินค้า
            </td>
          </tr>
        ) : (
          lines.map((line, idx) => (
            <tr key={line.id ?? idx} className="border">
              <td className="border p-2 text-center">{idx + 1}</td>
              <td className="border p-2">{line.name}</td>
              <td className="border p-2 text-center">{line.quantity.toLocaleString('th-TH')}</td>
              <td className="border p-2 text-right">{formatPurchaseOrderMoney(line.costPrice)} ฿</td>
              <td className="border p-2 text-right">{formatPurchaseOrderMoney(line.lineTotal)} ฿</td>
            </tr>
          ))
        )}

        <tr className="font-semibold">
          <td colSpan={4} className="text-right border p-2">
            รวมทั้งสิ้น
          </td>
          <td className="border p-2 text-right">{formatPurchaseOrderMoney(total)} ฿</td>
        </tr>
      </tbody>
    </table>

    <div className="mt-6">
      <h3 className="font-semibold mb-1">หมายเหตุ</h3>
      <p className="text-muted-foreground whitespace-pre-line">{po.note || '-'}</p>
    </div>

    <div className="mt-[100px] flex justify-between signature-space">
      <div>
        <p>......................................</p>
        <p className="text-sm">ผู้สั่งซื้อ</p>
      </div>

      <div>
        <p>......................................</p>
        <p className="text-sm">ผู้ขาย (ลงชื่อรับทราบ)</p>
      </div>
    </div>
  </div>
);

export default PurchaseOrderPrintShell;
