// -----------------------
// BillLayoutFullTax.jsx
// -----------------------
import React from 'react';

const BillLayoutShortTax = ({ sale, saleItems, payments, config }) => {
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

  return (
    <div className="w-full max-w-xl mx-auto text-sm">
      <div className="text-center mb-2">
        <h2 className="font-bold text-xl">{config.headerText}</h2>
        {config.address && <p>{config.address}</p>}
        {config.phone && <p>โทร. {config.phone}</p>}
        <p className="mt-2">ใบกำกับภาษี (แบบย่อ)</p>
      </div>

      <div className="text-sm mb-2">
        <p>เลขที่ใบเสร็จ: {sale.code}</p>
        <p>วันที่: {new Date(sale.createdAt).toLocaleDateString('th-TH')}</p>
        <p>ลูกค้า: {sale.customer?.name || '-'}</p>
        <p>ที่อยู่: {sale.customer?.address || '-'}</p>
        <p>เลขประจำตัวผู้เสียภาษี: {sale.customer?.taxId || '-'}</p>
      </div>

      <table className="w-full text-xs mb-2 border-t border-b border-gray-300">
        <thead>
          <tr className="border-b">
            <th className="text-left">สินค้า</th>
            <th className="text-center">จำนวน</th>
            <th className="text-right">ราคาต่อหน่วย</th>
            <th className="text-right">รวม</th>
          </tr>
        </thead>
        <tbody>
          {saleItems.map(item => (
            <tr key={item.id}>
              <td>{item.productName}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">
                {typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
              </td>
              <td className="text-right">
                {typeof item.price === 'number' && typeof item.quantity === 'number'
                  ? (item.price * item.quantity).toFixed(2)
                  : '0.00'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right text-xs">
        <p>ยอดก่อนภาษี: {beforeVat.toFixed(2)} ฿</p>
        <p>VAT {vatRate}%: {vatAmount.toFixed(2)} ฿</p>
        <p>ส่วนลด: {discount.toFixed(2)} ฿</p>
        <p className="font-bold">ยอดสุทธิ: {total.toFixed(2)} ฿</p>
      </div>

      <div className="mt-4 text-sm">
        <p>วิธีชำระเงิน: {payments.map(p => `${p.paymentMethod}: ${parseFloat(p.amount).toFixed(2)} ฿`).join(', ')}</p>
        <p className="text-center mt-4">{config.footerNote || 'ขอบคุณที่ใช้บริการ'}</p>
      </div>
    </div>
  );
};

export default BillLayoutShortTax;
