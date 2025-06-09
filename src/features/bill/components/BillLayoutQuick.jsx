// BillLayoutQuick.jsx (เวอร์ชันใหม่ ใช้ข้อมูลจาก state)

import React from 'react';
import { useLocation } from 'react-router-dom';

const BillLayoutQuick = () => {
  const { state } = useLocation();
  const payment = state?.payment;
  const sale = payment?.sale;
  const saleItems = sale?.items || [];
  const config = sale?.branch?.receiptConfig || {};

  if (!sale || !payment || !config) return null;

  const subtotal = saleItems.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + quantity * price;
  }, 0);

  const discountTotal = saleItems.reduce((sum, item) => {
    const discount = Number(item.discount) || 0;
    return sum + discount;
  }, 0);

  const vat = typeof sale.vat === 'number' ? sale.vat : 0;
  const total = typeof sale.total === 'number' ? sale.total : subtotal - discountTotal + vat;

  return (
    <div className="w-full max-w-md mx-auto text-sm">
      <div className="text-center mb-2">
        {config.headerText && <h2 className="font-bold text-lg">{config.headerText}</h2>}
        {config.subHeader && <p>{config.subHeader}</p>}
        {config.address && <p>{config.address}</p>}
        {config.phone && <p>โทร. {config.phone}</p>}
      </div>

      <div className="text-sm mb-2">
        <p>เลขที่ใบเสร็จ: {sale.code} - {new Date(sale.createdAt).toLocaleDateString('th-TH')} {new Date(sale.createdAt).toLocaleTimeString('th-TH')}</p>
        <p>ลูกค้า: {sale.customer?.name || '-'}</p>
        <p>เบอร์โทร: {sale.customer?.phone || '-'}</p>
        <p>พนักงาน: {sale.employee?.name || '-'}</p>
      </div>

      <table className="w-full border-t border-b border-black text-xs mb-2">
        <thead>
          <tr>
            <th className="text-left">สินค้า</th>
            <th className="text-center">จำนวน</th>
            <th className="text-right">ราคา</th>
            <th className="text-right">รวม</th>
          </tr>
        </thead>
        <tbody>
          {saleItems.map((item) => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const lineTotal = quantity * price;

            return (
              <tr key={item.id}>
                <td>{item.product?.title || item.productName}</td>
                <td className="text-center">{quantity}</td>
                <td className="text-right">{price.toFixed(2)}</td>
                <td className="text-right">{lineTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="text-right text-xs space-y-1">
        <p>รวม: {subtotal.toFixed(2)} ฿</p>
        <p>ส่วนลด: {discountTotal.toFixed(2)} ฿</p>
        {config.showVat && <p>ภาษีมูลค่าเพิ่ม (7%): {vat.toFixed(2)} ฿</p>}
        <p className="font-bold">ยอดสุทธิ: {total.toFixed(2)} ฿</p>
      </div>

      <div className="mt-4">
        <p>ช่องทางการชำระเงิน</p>
        <p>{payment.paymentMethod}: {Number(payment.amount || 0).toFixed(2)} ฿</p>
      </div>

      {config.footerNote && (
        <div className="mt-4 text-center text-xs">
          <p>{config.footerNote}</p>
        </div>
      )}
    </div>
  );
};

export default BillLayoutQuick;
