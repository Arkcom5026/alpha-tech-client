// ✅ ReceivedSNTable.jsx — ตารางรายการที่ "รับแล้ว" แสดงตรง ๆ จากข้อมูล API (ไม่ใช้ helper)
// - แสดงเฉพาะคอลัมน์ที่ต้องใช้บนตาราง Scanned: #, สินค้า, บาร์โค้ด, SN, สถานะ, การจัดการ
// - รองรับทั้งการส่ง props `items` (จาก API /barcodes/by-receipt) หรือดึงจาก store เดิมเป็น fallback

import React, { useMemo } from 'react';
import useStockItemStore from '../../stockItem/store/stockItemStore';
import { Button } from '@/components/ui/button';


const ReceivedSNTable = ({ items = [] }) => {
  const { stockItems = [], deleteStockItem } = useStockItemStore();

  // กำหนดแหล่งข้อมูล: ใช้ props.items ก่อน ถ้าไม่ส่งมาใช้ store เดิม
  const rows = useMemo(() => {
    if (Array.isArray(items) && items.length > 0) return items;
    // map store เดิมให้เข้า format เดียวกันพอประมาณ
    return (stockItems || []).map((s) => ({
      id: s.id,
      barcode: s.barcode,
      serialNumber: s.serial ?? s.serialNumber ?? null,
      productName: s.productName ?? s?.product?.name ?? '-',
      stockItemId: s.id,
      _fromStore: true,
    }));
  }, [items, stockItems]);

  if (!rows.length) {
    return <p className="text-sm text-gray-500">ยังไม่มีรายการรับเข้า</p>;
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-center">#</th>
            <th className="px-4 py-2 text-left">สินค้า</th>
            <th className="px-4 py-2 text-left">บาร์โค้ด</th>
            <th className="px-4 py-2 text-left">SN</th>
            <th className="px-4 py-2 text-center">สถานะ</th>
            <th className="px-4 py-2 text-center">การจัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((row, idx) => (
            <tr key={row.id ?? `${row.barcode}-${idx}`}>
              <td className="px-4 py-2 text-center">{idx + 1}</td>
              <td className="px-4 py-2">{row.productName ?? '-'}</td>
              <td className="px-4 py-2">{row.barcode}</td>
              <td className="px-4 py-2">{row.serialNumber ?? '-'}</td>
              <td className="px-4 py-2 text-center">{row.stockItemId ? 'พร้อมขาย' : '-'}</td>
              <td className="px-4 py-2 text-center">
                {row._fromStore ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteStockItem(row.id)}
                  >
                    ลบ
                  </Button>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReceivedSNTable;
