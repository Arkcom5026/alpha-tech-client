// ✅ src/features/supplier/components/SupplierTable.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const SupplierTable = ({ suppliers = [], onDelete }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* 🔍 ช่องค้นหา */}
      <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h2 className="text-lg font-semibold">รายชื่อผู้ขาย</h2>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ขาย..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 w-full md:w-64 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
          />
          <StandardActionButtons showCreate onAdd={() => navigate('/pos/purchases/suppliers/create')} />
        </div>
      </div>

      {/* 📋 ตาราง */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr className="divide-x divide-gray-300 text-left">
              <th className="px-4 py-2">ชื่อ Supplier</th>
              <th className="px-4 py-2">เบอร์โทร</th>              
              <th className="px-4 py-2">อีเมล</th>
              <th className="px-4 py-2 text-right">วงเงิน</th>
              <th className="px-4 py-2 text-right">ยอดหนี้</th>
              <th className="px-4 py-2 text-center">วันเครดิต</th>
              <th className="px-4 py-2 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                  ไม่พบข้อมูลผู้ขาย
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="divide-x divide-gray-200">
                  <td className="px-4 py-2">{supplier.name}</td>
                  <td className="px-4 py-2">{supplier.phone}</td>                  
                  <td className="px-4 py-2">{supplier.email}</td>
                  <td className="px-4 py-2 text-right">{supplier.creditLimit?.toLocaleString()} ฿</td>
                  <td className="px-4 py-2 text-right">{supplier.creditBalance?.toLocaleString()} ฿</td>
                  <td className="px-4 py-2 text-center">{supplier.paymentTerms} วัน</td>
                  <td className="px-4 py-2 text-center">
                    <StandardActionButtons
                      onViewLink={`/pos/purchases/suppliers/view/${supplier.id}`}
                      onEditLink={`/pos/purchases/suppliers/edit/${supplier.id}`}
                      onDelete={onDelete ? () => onDelete(supplier.id) : undefined}
                      showDelete
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierTable;
