





import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const PurchaseOrderListTable = ({ purchaseOrders }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const filtered = (purchaseOrders || []).filter((po) => {
    const matchSupplier = po.supplier?.name?.toLowerCase().includes(searchText.toLowerCase());
    return matchSupplier;
  });

  const handleEdit = (id) => {
    navigate(`/pos/purchases/orders/edit/${id}`);
  };

  const handleDelete = (id) => {
    // ใส่ฟังก์ชันลบจริงในภายหลัง
    if (confirm('คุณต้องการลบใบสั่งซื้อนี้ใช่หรือไม่?')) {
      console.log('ลบ ID:', id);
    }
  };

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
                <StandardActionButtons
                  showEdit
                  showDelete
                  onEdit={() => handleEdit(po.id)}
                  onDelete={() => handleDelete(po.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseOrderListTable;




