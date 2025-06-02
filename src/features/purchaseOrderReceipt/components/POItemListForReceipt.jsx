import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const POItemListForReceipt = ({ poId, receiptId, items = [] }) => {
  const [quantities, setQuantities] = useState(() => {
    const initial = {};
    items.forEach(item => {
      initial[item.id] = '';
    });
    return initial;
  });

  const handleChange = (itemId, value) => {
    setQuantities((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSave = () => {
    const dataToSubmit = items.map(item => ({
      poItemId: item.id,
      quantity: Number(quantities[item.id]) || 0,
    })).filter(x => x.quantity > 0);

    console.log('📦 กำลังส่งข้อมูล receiptItems:', dataToSubmit);
    // TODO: เรียก API เพื่อบันทึก receiptItems
  };

  return (
    <div className="space-y-4">
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-1 border">#</th>
            <th className="px-2 py-1 border text-left">สินค้า</th>
            <th className="px-2 py-1 border">สั่ง</th>
            <th className="px-2 py-1 border">รับแล้ว</th>
            <th className="px-2 py-1 border">รับรอบนี้</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const received = item.receiptItems?.reduce((sum, r) => sum + r.quantity, 0) || 0;
            const remaining = item.quantity - received;
            return (
              <tr key={item.id}>
                <td className="px-2 py-1 border text-center">{index + 1}</td>
                <td className="px-2 py-1 border">{item.product?.title || '-'}</td>
                <td className="px-2 py-1 border text-center">{item.quantity}</td>
                <td className="px-2 py-1 border text-center">{received}</td>
                <td className="px-2 py-1 border text-center">
                  <Input
                    type="number"
                    min={0}
                    max={remaining}
                    value={quantities[item.id] || ''}
                    onChange={(e) => handleChange(item.id, e.target.value)}
                    className="w-24 mx-auto"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="text-right">
        <Button onClick={handleSave}>💾 บันทึกรายการรับสินค้า</Button>
      </div>
    </div>
  );
};

export default POItemListForReceipt;
