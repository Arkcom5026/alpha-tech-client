// ===============================
// features/bill/components/BillLayoutFullTax.jsx
// ===============================
import React, { useState } from 'react';

const formatCurrency = (val) => (Number(val) || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const BillLayoutFullTax = ({ sale, saleItems, payments, config }) => {
  // Hooks must be called unconditionally at the top of the component
  const [hideDate, setHideDate] = useState(Boolean(config?.hideDate));
  if (!sale || !saleItems || !payments || !config) return null;

  const vatRate = typeof config.vatRate === 'number' ? config.vatRate : 7;
  // Prefer precomputed totals from config if present
  const total = config?.totals?.total ?? saleItems.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const beforeVat = config?.totals?.beforeVat ?? saleItems.reduce((s, x) => s + (Number(x.totalExVat) || 0), 0);
  const vatAmount = config?.totals?.vatAmount ?? (total - beforeVat);

  const maxRowCount = 20;
  const emptyRowCount = Math.max(maxRowCount - saleItems.length, 0);
  const handlePrint = () => window.print();

  const getDisplayCustomerName = (customer) => {
    if (!customer) return '-';
    if (['GOVERNMENT', 'ORGANIZATION'].includes(customer.type)) return customer.companyName || '-';
    return customer.name || '-';
  };

  const renderDate = (iso) => hideDate ? (
    <span className="inline-block border-b border-black w-[120px] h-[18px] align-bottom" />
  ) : (config?.formatThaiDate ? config.formatThaiDate(iso) : iso);

  return (
    <>
      <div className="w-full max-w-[794px] mx-auto mb-4 text-right print:hidden">
        <label className="inline-flex items-center gap-2 px-5 text-sm">
          <input type="checkbox" checked={hideDate} onChange={(e) => setHideDate(e.target.checked)} className="w-5 h-5" />
          <span className="text-base ml-2">ไม่แสดงวันที่ในเอกสาร</span>
        </label>
        <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-4">
          พิมพ์บิล
        </button>
      </div>

      <div
        className="w-full overflow-hidden mx-auto text-sm border border-gray-600 px-4 pt-4 pb-2 flex flex-col rounded-md"
        style={{ width: '210mm', height: '297mm', fontFamily: 'TH Sarabun New, sans-serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-2 mb-2 gap-3">
          <div className="flex items-start gap-3">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="logo" className="w-16 h-16 object-contain print:mt-1" />
            ) : null}
            <div>
              <h2 className="font-bold text-sm">{config.branchName}</h2>
              <p>ที่อยู่: {config.address}</p>
              <p>โทร: {config.phone}</p>
              <p>เลขประจำตัวผู้เสียภาษี: {config.taxId}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="border border-gray-600 px-2 py-1 font-bold rounded-md leading-tight">
              ต้นฉบับลูกค้า<br />CUSTOMER ORIGINAL
            </p>
          </div>
        </div>

        <h3 className="text-center font-bold underline text-lg mb-4">
          ใบเสร็จรับเงิน / ใบกำกับภาษี<br />TAX INVOICE ORIGINAL / DELIVERY ORDER
        </h3>

        {/* Customer & Sale Info */}
        <div className="grid grid-cols-[4fr_1.5fr] gap-4 mb-4">
          <div className="border border-black p-2 rounded-lg">
            <p className="text-base">ลูกค้า: {getDisplayCustomerName(sale.customer)}</p>
            <p>ที่อยู่: {sale.customer?.address || '-'}</p>
            <p>โทร: {sale.customer?.phone || '-'}</p>
            <p>เลขประจำตัวผู้เสียภาษี: {sale.customer?.taxId || '-'}</p>
          </div>

          <div className="border border-black p-2 rounded-lg space-y-1">
            <p>วันที่: {renderDate(sale.soldAt)}</p>
            <p>เลขที่: {sale.code}</p>
            <p>เงื่อนไขการชำระเงิน: {sale.paymentTerms || '-'}</p>
            <p>วันที่ครบกำหนด: {sale.dueDate ? renderDate(sale.dueDate) : '-'}</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-xs mb-2 border border-black">
          <thead className="bg-gray-100">
            <tr className="border-b border-black">
              <th className="border border-black px-1 h-[28px]">ลำดับ<br />ITEM</th>
              <th className="border border-black px-1 h-[28px]">รายการ<br />DESCRIPTION</th>
              <th className="border border-black px-1 h-[28px]">จำนวน<br />QTY</th>
              <th className="border border-black px-1 h-[28px]">หน่วย<br />UNIT</th>
              <th className="border border-black px-1 h-[28px]">ราคาต่อหน่วย (ไม่รวม VAT)<br />UNIT PRICE (EX VAT)</th>
              <th className="border border-black px-1 h-[28px]">จำนวนเงิน (ไม่รวม VAT)<br />AMOUNT (EX VAT)</th>
            </tr>
          </thead>
          <tbody>
            {saleItems.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-black px-1 text-center h-[28px]">{index + 1}</td>
                <td className="border border-black px-1 h-[28px]">
                  {item.productName} {item.productModel ? `(${item.productModel})` : ''}
                </td>
                <td className="border border-black px-1 text-center h-[28px]">{item.quantity}</td>
                <td className="border border-black px-1 text-center h-[28px]">{item.unit || '-'}</td>
                <td className="border border-black px-1 text-right h-[28px]">{formatCurrency(item.unitPriceExVat)}</td>
                <td className="border border-black px-1 text-right h-[28px]">{formatCurrency(item.totalExVat)}</td>
              </tr>
            ))}
            {[...Array(emptyRowCount)].map((_, idx) => (
              <tr key={`empty-${idx}`}>
                <td className="border border-black px-1 text-center h-[28px]">&nbsp;</td>
                <td className="border border-black px-1 h-[28px]">&nbsp;</td>
                <td className="border border-black px-1 text-center h-[28px]">&nbsp;</td>
                <td className="border border-black px-1 text-center h-[28px]">&nbsp;</td>
                <td className="border border-black px-1 text-right h-[28px]">&nbsp;</td>
                <td className="border border-black px-1 text-right h-[28px]">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Payments summary */}
        <div className="text-xs mb-2">
          {Array.isArray(payments) && payments.length > 0 ? (
            <ul className="list-disc ml-5">
              {payments.map((p, i) => (
                <li key={i}>
                  ชำระโดย: {p.paymentMethod || '-'} — จำนวน: {formatCurrency(p.amount)} ฿ {p.note ? `(${p.note})` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p>-</p>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 text-xs mt-auto pt-4" style={{ minHeight: '130px' }}>
          <div>
            <ul className="list-decimal ml-4">
              <li>ได้รับสินค้าตามรายการข้างต้นครบถ้วน</li>
              <li>หากสินค้าไม่ครบต้องแจ้งภายใน 3 วัน</li>
              <li>สินค้าซื้อแล้วไม่รับคืน</li>
              <li>โปรดชำระเงินในนาม "{config.branchName}"</li>
            </ul>
          </div>
          <div>
            <p className="flex justify-between border-t border-black border-b py-1">
              <span>รวมเงิน / SUB TOTAL</span>
              <span>{formatCurrency(beforeVat)} ฿</span>
            </p>
            <p className="flex justify-between border-b border-black py-1">
              <span>ภาษีมูลค่าเพิ่ม {vatRate}% / VAT</span>
              <span>{formatCurrency(vatAmount)} ฿</span>
            </p>
            <p className="flex justify-between border-b border-black font-bold py-1">
              <span>จำนวนเงินรวมทั้งสิ้น / TOTAL AMOUNT</span>
              <span>{formatCurrency(total)} ฿</span>
            </p>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 text-sm mt-2 text-center pt-4">
          <div>
            <p className="border-t border-black pt-2 pb-4">ผู้รับของ / RECEIVED BY</p>
          </div>
          <div>
            <p className="border-t border-black pt-2 pb-4">ผู้ส่งของ / DELIVERED BY</p>
          </div>
          <div>
            <p className="border-t border-black pt-2 pb-4">ผู้อนุมัติ / AUTHORIZED BY</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BillLayoutFullTax;
