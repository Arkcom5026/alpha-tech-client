// ✅ StockItemTable.jsx — แสดงรายการ SN ที่ยิงเข้าสต๊อก

import React from 'react';
import useStockItemStore from '../../stockItem/store/stockItemStore';
import { Button } from '@/components/ui/button';

const ReceivedSNTable = () => {
  const { stockItems, deleteStockItem } = useStockItemStore();

  if (stockItems.length === 0) {
    return <p className="text-sm text-gray-500">ยังไม่มีรายการ SN</p>;
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Barcode</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Serial</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ราคาทุน</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">วันที่รับ</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">สถานะ</th>
            <th className="px-4 py-2 text-sm text-center text-gray-700">การจัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {stockItems.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-2 text-sm">{item.barcode}</td>
              <td className="px-4 py-2 text-sm">{item.serial}</td>
              <td className="px-4 py-2 text-sm">{item.costPrice?.toLocaleString()} ฿</td>
              <td className="px-4 py-2 text-sm">{new Date(item.receivedAt).toLocaleDateString()}</td>
              <td className="px-4 py-2 text-sm">{item.status}</td>
              <td className="px-4 py-2 text-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteStockItem(item.id)}
                >
                  ลบ
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReceivedSNTable;
  
