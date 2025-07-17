// -----------------------
// BillLayoutFullTax.jsx
// -----------------------
import React from 'react';

const BillLayoutFullTax = ({ sale, saleItems, payments, config }) => {
  if (!sale || !saleItems || !payments || !config) return null;

  // Debugging log to check incoming saleItems data
  console.log('BillLayoutFullTax: Incoming saleItems:', saleItems);
  saleItems.forEach((item, index) => {
    // Modified to log item.amount instead of item.price
    console.log(`Item ${index}: productName=${item.productName}, amount=${item.amount}, quantity=${item.quantity}, typeOfAmount=${typeof item.amount}, typeOfQuantity=${typeof item.quantity}`);
  });

  const discount = typeof sale.totalDiscount === 'number' ? sale.totalDiscount : 0;
  const computedTotal = saleItems.reduce((sum, item) => {
    // Changed from item.price to item.amount for price per unit
    const pricePerUnit = typeof item.amount === 'number' ? item.amount : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return sum + pricePerUnit * quantity;
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
          <div className="border border-black p-2 rounded-lg"> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
            <p>ลูกค้า: {sale.customer?.name || '-'}</p>
            <p>ที่อยู่: {sale.customer?.address || '-'}</p>
            <p>โทร: {sale.customer?.phone || '-'}</p>
            <p>เลขประจำตัวผู้เสียภาษี: {sale.customer?.taxId || '-'}</p>
          </div>
          <div className="border border-black p-2 rounded-lg"> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
            <p>วันที่: {new Date(sale.createdAt).toLocaleDateString('th-TH')}</p>
            <p>เลขที่: {sale.code}</p>
            <p>เงื่อนไขการชำระเงิน: {sale.paymentTerms || '-'}</p>
            <p>วันที่ครบกำหนด: {sale.dueDate ? new Date(sale.dueDate).toLocaleDateString('th-TH') : '-'}</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-xs mb-2 border border-black"> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
          <thead className="bg-gray-100">
            <tr className="border-b border-black"> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
              <th className="border border-black px-1 h-[28px]">ลำดับ<br />ITEM</th> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
              <th className="border border-black px-1 h-[28px]">รายการ<br />DESCRIPTION</th> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
              <th className="border border-black px-1 h-[28px]">จำนวน<br />QTY</th> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
              <th className="border border-black px-1 h-[28px]">หน่วย<br />UNIT</th> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
              <th className="border border-black px-1 h-[28px]">ราคาต่อหน่วย<br />UNIT PRICE</th> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
              <th className="border border-black px-1 h-[28px]">จำนวนเงิน<br />AMOUNT</th> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
            </tr>
          </thead>
          <tbody>
            {saleItems.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-black px-1 text-center h-[28px]">{index + 1}</td> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
                <td className="border border-black px-1 h-[28px]">{item.productName}</td> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
                <td className="border border-black px-1 text-center h-[28px]">{item.quantity}</td> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
                <td className="border border-black px-1 text-center h-[28px]">{item.unit || '-'}</td> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
                <td className="border border-black px-1 text-right h-[28px]">{formatCurrency(item.amount)}</td> {/* Changed from item.price to item.amount */}
                <td className="border border-black px-1 text-right h-[28px]">{formatCurrency(item.amount * item.quantity)}</td> {/* Changed from item.price to item.amount */}
              </tr>
            ))}
            {[...Array(emptyRowCount)].map((_, idx) => (
              <tr key={`empty-${idx}`}>
                <td className="border border-black px-1 text-center h-[28px]">&nbsp;</td> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
                <td className="border border-black px-1 h-[28px]">&nbsp;</td> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
                <td className="border border-black px-1 text-center h-[28px]">&nbsp;</td> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
                <td className="border border-black px-1 text-center h-[28px]">&nbsp;</td> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
                <td className="border border-black px-1 text-right h-[28px]">&nbsp;</td> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
                <td className="border border-black px-1 text-right h-[28px]">&nbsp;</td> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
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
            <p className="flex justify-between border-t border-black border-b py-1"> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
              <span>รวมเงิน / SUB TOTAL</span>
              <span>{formatCurrency(beforeVat)} ฿</span>
            </p>
            <p className="flex justify-between border-b border-black py-1"> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
              <span>ภาษีมูลค่าเพิ่ม / VAT</span>
              <span>{formatCurrency(vatAmount)} ฿</span>
            </p>
            <p className="flex justify-between border-b border-black font-bold py-1"> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
              <span>จำนวนเงินรวมทั้งสิ้น / TOTAL AMOUNT</span>
              <span>{formatCurrency(total)} ฿</span>
            </p>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 text-sm mt-2 text-center pt-4 ">
          <div>
            <p className="border-t border-black pt-2 pb-4">ผู้รับของ / RECEIVED BY</p> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
          </div>
          <div>
            <p className="border-t border-black pt-2 pb-4">ผู้ส่งของ / DELIVERED BY</p> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
          </div>
          <div>
            <p className="border-t border-black pt-2 pb-4">ผู้อนุมัติ / AUTHORIZED BY</p> {/* ✅ ปรับความเข้มของเส้นขอบเป็น border-black */}
          </div>
        </div>
      </div>
    </>


  );
};

export default BillLayoutFullTax;
