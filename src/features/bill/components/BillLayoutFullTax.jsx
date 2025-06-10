// -----------------------
// BillLayoutFullTax.jsx
// -----------------------
import React from 'react';

const BillLayoutFullTax = ({ sale, saleItems, payments, config }) => {
  if (!sale || !saleItems || !payments || !config) return null;

  const discount = typeof sale.totalDiscount === 'number' ? sale.totalDiscount : 0;
  const computedTotal = saleItems.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return sum + price * quantity;
  }, 0);

  const total = computedTotal - discount;
  const vatRate = typeof config.vatRate === 'number' ? config.vatRate : 7;
  const vatAmount = total - total / (1 + vatRate / 100);
  const beforeVat = total - vatAmount;

  const formatCurrency = (val) => parseFloat(val || 0).toFixed(2);

  const maxRowCount = 20;
  const emptyRowCount = Math.max(maxRowCount - saleItems.length, 0);
  const handlePrint = () => window.print();

  return (
    <>
      <div className="w-full max-w-[794px] mx-auto mb-4 text-right ">
        <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded text-base print:hidden">
          พิมพ์บิล
        </button>
      </div>

      <div
        className="w-full overflow-hidden mx-auto text-sm border border-gray-600 px-4 pt-4 pb-2 flex flex-col rounded-md"
        style={{ width: '210mm', height: '297mm', fontFamily: 'TH Sarabun New, sans-serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-2">
          <div>
            <h2 className="font-bold text-sm">{config.branchName}</h2>
            <p>ที่อยู่: {config.address}</p>
            <p>โทร: {config.phone}</p>
            <p>เลขประจำตัวผู้เสียภาษี: {config.taxId}</p>          
          </div>
          
          <div className="text-right ">
            <p className="border border-gray-600 px-2 py-1 font-bold rounded-md">ต้นฉบับลูกค้า<br />CUSTOMER ORIGINAL</p>
          </div>

        </div>

        <h3 className="text-center font-bold underline text-lg mb-4">ใบกำกับภาษี / ใบส่งสินค้า<br />TAX INVOICE ORIGINAL / DELIVERY ORDER</h3>

        {/* Customer & Sale Info */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="border p-2 rounded-lg">
            <p><strong>ลูกค้า:</strong> {sale.customer?.name || '-'}</p>
            <p><strong>ที่อยู่:</strong> {sale.customer?.address || '-'}</p>
            <p><strong>โทร:</strong> {sale.customer?.phone || '-'}</p>
            <p><strong>เลขประจำตัวผู้เสียภาษี:</strong> {sale.customer?.taxId || '-'}</p>
          </div>
          <div className="border p-2 rounded-lg">
            <p><strong>วันที่:</strong> {new Date(sale.createdAt).toLocaleDateString('th-TH')}</p>
            <p><strong>เลขที่:</strong> {sale.code}</p>
            <p><strong>เงื่อนไขการชำระเงิน:</strong> {sale.paymentTerms || '-'}</p>
            <p><strong>วันที่ครบกำหนด:</strong> {sale.dueDate ? new Date(sale.dueDate).toLocaleDateString('th-TH') : '-'}</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-xs mb-2 border border-black">
          <thead className="bg-gray-100">
            <tr className="border-b">
              <th className="border px-1 h-[28px]">ลำดับ<br />ITEM</th>
              <th className="border px-1 h-[28px]">รายการ<br />DESCRIPTION</th>
              <th className="border px-1 h-[28px]">จำนวน<br />QTY</th>
              <th className="border px-1 h-[28px]">หน่วย<br />UNIT</th>
              <th className="border px-1 h-[28px]">ราคาต่อหน่วย<br />UNIT PRICE</th>
              <th className="border px-1 h-[28px]">จำนวนเงิน<br />AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {saleItems.map((item, index) => (
              <tr key={item.id}>
                <td className="border px-1 text-center h-[28px]">{index + 1}</td>
                <td className="border px-1 h-[28px]">{item.productName}</td>
                <td className="border px-1 text-center h-[28px]">{item.quantity}</td>
                <td className="border px-1 text-center h-[28px]">{item.unit || '-'}</td>
                <td className="border px-1 text-right h-[28px]">{formatCurrency(item.price)}</td>
                <td className="border px-1 text-right h-[28px]">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
            {[...Array(emptyRowCount)].map((_, idx) => (
              <tr key={`empty-${idx}`}>
                <td className="border px-1 text-center h-[28px]">&nbsp;</td>
                <td className="border px-1 h-[28px]">&nbsp;</td>
                <td className="border px-1 text-center h-[28px]">&nbsp;</td>
                <td className="border px-1 text-center h-[28px]">&nbsp;</td>
                <td className="border px-1 text-right h-[28px]">&nbsp;</td>
                <td className="border px-1 text-right h-[28px]">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

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
            <p className="flex justify-between border-t border-b py-1">
              <span>รวมเงิน / SUB TOTAL</span>
              <span>{formatCurrency(beforeVat)} ฿</span>
            </p>
            <p className="flex justify-between border-b py-1">
              <span>ภาษีมูลค่าเพิ่ม / VAT</span>
              <span>{formatCurrency(vatAmount)} ฿</span>
            </p>
            <p className="flex justify-between border-b font-bold py-1">
              <span>จำนวนเงินรวมทั้งสิ้น / TOTAL AMOUNT</span>
              <span>{formatCurrency(total)} ฿</span>
            </p>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 text-sm mt-2 text-center pt-4 ">
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
