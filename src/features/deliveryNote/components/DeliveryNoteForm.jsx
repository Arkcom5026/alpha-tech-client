// ✅ DeliveryNoteForm ปรับโครงสร้างให้ตรงกับ BillLayoutFullTax 100%
import { concat } from 'lodash';
import React from 'react';

const DeliveryNoteForm = ({ sale, saleItems, payments, config, hideDate, setHideDate, showDateLine }) => {
  if (!sale || !saleItems || !config) {
    return <div className="p-4 text-center text-gray-600">ไม่พบข้อมูลใบส่งของ</div>;
  }

  const formatThaiDate = (dateString) => {
    const thMonths = ['', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543;
    return `${day} ${thMonths[month]} ${year}`;
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val || 0);
    return num.toFixed(2);
  };

  const vatRate = typeof sale.vatRate === 'number' ? sale.vatRate : 7;

  // ✅ รวมราคาสินค้าหลังหักส่วนลดแต่ละรายการ
  const computedTotal = saleItems.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    const discount = typeof item.discount === 'number' ? item.discount : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    const netUnitPrice = price - discount;
    return sum + netUnitPrice * quantity;
  }, 0);

  const total = computedTotal;
  const beforeVat = total / (1 + vatRate / 100);
  const vatAmount = total - beforeVat;

  const maxRowCount = 20;
  const emptyRowCount = Math.max(maxRowCount - saleItems.length, 0);
  const handlePrint = () => window.print();

  const getDisplayCustomerName = (customer) => {
    if (!customer) return '-';
    if (['GOVERNMENT', 'ORGANIZATION'].includes(customer.type)) return customer.companyName || '-';
    return customer.name || '-';
  };

  return (
    <>
      <div className="w-full max-w-[794px] mx-auto mb-4 text-right print:hidden">
        <label className="inline-flex items-center gap-2 px-5 text-sm">
          <input
            type="checkbox"
            checked={hideDate}
            onChange={(e) => setHideDate(e.target.checked)}
            className="w-5 h-5"
          />
          <span className="text-base ml-2">ไม่แสดงวันที่ในเอกสาร</span>
        </label>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-4"
        >
          พิมพ์ใบส่งของ
        </button>
      </div>

      <div
        className="w-full overflow-hidden mx-auto text-sm border border-gray-600 px-4 pt-4 pb-2 flex flex-col rounded-md relative print:overflow-visible"
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
          <div className="text-right">
            <p className="border border-gray-400 px-2 py-1 font-bold rounded-md text-xs">ต้นฉบับลูกค้า<br />CUSTOMER ORIGINAL</p>
          </div>
        </div>

        <h3 className="text-center font-bold underline text-lg mb-4">ใบส่งของ<br />DELIVERY NOTE</h3>

        {/* Customer & Sale Info */}
        <div className="grid grid-cols-[4fr_1.5fr] gap-4 text-sm mb-4">
          <div className="border border-black p-2 rounded-lg space-y-1">
            <p>ลูกค้า: {getDisplayCustomerName(sale.customer)}</p>
            <p>ที่อยู่: {sale.customer?.address || '-'}</p>
            <p>โทร: {sale.customer?.phone || '-'}</p>
            <p>เลขประจำตัวผู้เสียภาษี: {sale.customer?.taxId || '-'}</p>
          </div>

          <div className="border border-black p-2 rounded-lg space-y-1">
            <p>
              วันที่: {hideDate ? (
                <span className="inline-block border-b border-black w-[120px] h-[18px] align-bottom" />
              ) : formatThaiDate(sale.soldAt)}
            </p>

            <p>เลขที่: {sale.code}</p>
            <p>เงื่อนไขการชำระเงิน: {sale.paymentTerms || '-'}</p>
            <p>วันที่ครบกำหนด: {sale.dueDate ? formatThaiDate(sale.dueDate) : '-'}</p>
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
              <th className="border border-black px-1 h-[28px]">ราคาต่อหน่วย<br />UNIT PRICE</th>
              <th className="border border-black px-1 h-[28px]">จำนวนเงิน<br />AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {saleItems.map((item, index) => {
              const price = typeof item.price === 'number' ? item.price : 0;
              const discount = typeof item.discount === 'number' ? item.discount : 0;
              const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
              const netUnitPrice = price - discount;
              const unitPriceBeforeVat = netUnitPrice / (1 + vatRate / 100);
              const amountBeforeVat = unitPriceBeforeVat * quantity;
              return (
                <tr key={item.id}>
                  <td className="border border-black px-1 text-center h-[28px]">{index + 1}</td>
                  <td className="border border-black px-1 h-[28px]">
                    {item.productName} {item.productModel ? `(${item.productModel})` : ''}
                  </td>
                  <td className="border border-black px-1 text-center h-[28px]">{quantity}</td>
                  <td className="border border-black px-1 text-center h-[28px]">{item.unit || '-'}</td>
                  <td className="border border-black px-1 text-right h-[28px]">{formatCurrency(unitPriceBeforeVat)}</td>
                  <td className="border border-black px-1 text-right h-[28px]">{formatCurrency(amountBeforeVat)}</td>
                </tr>
              );
            })}
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
              <span>ภาษีมูลค่าเพิ่ม / VAT</span>
              <span>{formatCurrency(vatAmount)} ฿</span>
            </p>
            <p className="flex justify-between border-b border-black font-extrabold text-base py-1 bg-gray-100">
              <span>จำนวนเงินรวมทั้งสิ้น / TOTAL AMOUNT</span>
              <span>{formatCurrency(total)} ฿</span>
            </p>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 text-sm mt-2 text-center pt-4">
          <div>
            <p className="border-t border-black pt-2 pb-6 min-h-[80px]">ผู้รับของ / RECEIVED BY</p>
          </div>
          <div>
            <p className="border-t border-black pt-2 pb-6 min-h-[80px]">ผู้ส่งของ / DELIVERED BY</p>
          </div>
          <div>
            <p className="border-t border-black pt-2 pb-6 min-h-[80px]">ผู้อนุมัติ / AUTHORIZED BY</p>
          </div>
        </div>

        {/* Page number */}
        <div className="absolute bottom-2 right-4 text-xs text-gray-400 print:block hidden">
          1/1
        </div>
      </div>
    </>
  );
};

export default DeliveryNoteForm;
