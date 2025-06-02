// ✅ Component ตารางพร้อมปุ่มตรวจรับ + filter แบบ radio ด้านขวาบน + ค้นหาชื่อ Supplier
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PurchaseOrderReceiptTable = ({ purchaseOrders }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const filtered = (purchaseOrders || []).filter((po) => {
    const matchSupplier = po.supplier?.name?.toLowerCase().includes(searchText.toLowerCase());
    return matchSupplier;
  });

  return (
    <div className="border rounded-md">
      <div className="flex justify-between items-center p-4 flex-wrap gap-4">
        <input
          type="text"
          placeholder="ค้นหา Supplier"
          className="border px-2 py-1 rounded"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">วันที่</th>
            <th className="px-4 py-2 text-left">เลขที่ใบสั่งซื้อ</th>
            <th className="px-4 py-2 text-left">Supplier</th>
            <th className="px-4 py-2 text-left">สถานะ</th>
            <th className="px-4 py-2 text-left">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((po, index) => (
            <tr key={po.id} className="border-t">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{new Date(po.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-2">{po.code}</td>
              <td className="px-4 py-2">{po.supplier?.name || '-'}</td>
              <td className="px-4 py-2">{po.status}</td>
              <td className="px-4 py-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/pos/purchases/receipt/create/${po.id}`)}
                >
                  ตรวจรับ
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseOrderReceiptTable;
