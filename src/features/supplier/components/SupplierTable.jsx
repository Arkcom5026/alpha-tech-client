// ✅ src/features/supplier/components/SupplierTable.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash } from 'lucide-react';

const SupplierTable = ({ suppliers = [], onDelete }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button
            onClick={() => navigate('/pos/purchases/suppliers/create')}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700"
          >
            ➕ เพิ่ม Supplier
          </button>
        </div>
      </div>

      return (
    <div className="p-4">
      <button
        onClick={() => navigate('/pos/purchases/suppliers')}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        ← ย้อนกลับ
      </button>
      {/* 🔍 ช่องค้นหา */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">รายชื่อผู้ขาย</h2>
        <input
          type="text"
          placeholder="ค้นหาชื่อผู้ขาย..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 w-64 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
        />
      </div>

      {/* 📋 ตาราง */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr className="divide-x divide-gray-300 text-left">
              <th className="px-4 py-2">ชื่อ Supplier</th>
              <th className="px-4 py-2">เบอร์โทร</th>
              <th className="px-4 py-2">ที่อยู่</th>
              <th className="px-4 py-2">อีเมล</th>
              <th className="px-4 py-2 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  ไม่พบข้อมูลผู้ขาย
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="divide-x divide-gray-200">
                  <td className="px-4 py-2">{supplier.name}</td>
                  <td className="px-4 py-2">{supplier.phone}</td>
                  <td className="px-4 py-2">{supplier.address}</td>
                  <td className="px-4 py-2">{supplier.email}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/pos/purchases/suppliers/view/${supplier.id}`)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>ดูรายละเอียด</span>
                      </button>

                      <button
                        onClick={() => navigate(`/pos/purchases/suppliers/edit/${supplier.id}`)}
                        className="text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
                      >
                        <Pencil className="w-4 h-4" />
                        <span>แก้ไข</span>
                      </button>

                      {onDelete && (
                        <button
                          onClick={() => {
                            if (confirm('คุณต้องการลบผู้ขายรายนี้ใช่หรือไม่?')) {
                              onDelete(supplier.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash className="w-4 h-4" />
                          <span>ลบ</span>
                        </button>
                      )}
                    </div>
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

