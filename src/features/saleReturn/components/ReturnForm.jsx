
// ReturnForm.jsx
import { useState } from 'react';

const ReturnForm = ({ items = [], onSubmit, sale }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [reason, setReason] = useState('');

  const toggleItem = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleSubmit = () => {
    const selected = items.filter((item) => selectedItems[item.id]);
    if (selected.length === 0) return;

    const payload = {
      reason,
      items: selected.map((item) => ({ saleItemId: item.id })),
    };

    onSubmit(payload);
  };

  return (
    <div className="p-4 border rounded bg-white">
      {sale && (
        <div className="mb-4 text-sm text-gray-700 space-y-1">
          <div>วันที่ขาย: {new Date(sale.soldAt).toLocaleDateString('th-TH')}</div>
          <div>เลขที่ใบเสร็จ: {sale.code}</div>
          <div>ลูกค้า: {sale.customer?.name || '-'} ({sale.customer?.phone || '-'})</div>
          <div>ช่องทางชำระเงิน: {sale.paymentMethod || '-'}</div>
          <div>สถานะบิล: {sale.status || '-'}</div>
          <div>เลขที่ใบกำกับภาษี: {sale.officialDocumentNumber || '-'}</div>
          <div>ยอดก่อนส่วนลด: {sale.totalBeforeDiscount?.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</div>
          <div>ส่วนลด: {sale.totalDiscount?.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</div>
          <div>VAT {sale.vatRate}%: {sale.vat?.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</div>
          <div>ยอดสุทธิ: {sale.totalAmount?.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</div>
        </div>
      )}

      <div className="mb-4">
        <label className="block font-medium mb-1">เหตุผลการคืน</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border px-2 py-1 rounded"
          rows={3}
        />
      </div>

      <table className="w-full text-sm border table-fixed">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 w-[40px]"></th>
            <th className="border px-2 py-1 w-[60px]">Serial / Barcode</th>
            <th className="border px-2 py-1 w-[100px]">สินค้า</th>
            <th className="border px-2 py-1 w-[360px]">รายละเอียด</th>
            <th className="border px-2 py-1 w-[100px] text-right">ราคา</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="border px-2 py-1 text-center">
                <input
                  type="checkbox"
                  checked={!!selectedItems[item.id]}
                  onChange={() => toggleItem(item.id)}
                />
              </td>
              <td className="border px-2 py-1">{item.stockItem?.barcode || '-'}</td>
              <td className="border px-2 py-1">{item.stockItem?.product?.title || '-'}</td>
              <td className="border px-2 py-1 whitespace-pre-wrap text-xs">
                {item.stockItem?.product?.description || '-'}
              </td>
              <td className="border px-2 py-1 text-right">
                {item.costPrice?.toLocaleString('th-TH', { minimumFractionDigits: 2 }) || '0.00'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pt-4 text-right">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ยืนยันการคืนสินค้า
        </button>
      </div>
    </div>
  );
};

export default ReturnForm;
