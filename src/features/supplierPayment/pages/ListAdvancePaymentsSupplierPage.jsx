import React, { useEffect, useState } from 'react';
// ✅ FIX: นำ useParams จาก react-router-dom มาเปิดระบบแกะค่า Tenant ปลอดภัย
import { useNavigate, useParams } from 'react-router-dom';
import useSupplierStore from '@/features/supplier/store/supplierStore';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
dayjs.locale('th');


// Page to list suppliers eligible for advance payment
const ListAdvancePaymentsSupplierPage = () => {
  const navigate = useNavigate();
  
  // 🟢 FIXED: เรียกใช้งาน useParams ดึงรหัสร้านค้าความปลอดภัยเพื่อคุม Multi-Tenant URL
  const { shopSlug } = useParams();
  const targetSlug = shopSlug || 'advancetech';

  const { suppliers, fetchSuppliersAction, isSupplierLoading } = useSupplierStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSuppliersAction();
  }, [fetchSuppliersAction]);

  const handleNavigate = (supplierId) => {
    // 🟢 FIXED: ซ่อมพาสปุ่มกดจ่ายเงินล่วงหน้าของซัพพลายเออร์ให้วิ่งผ่านเลน Tenant ร่วมสาขา
    navigate(`/${targetSlug}/pos/finance/payments/advance/supplier/${supplierId}`);
  };

  // Filter for suppliers who do not offer credit (creditLimit is 0)
  const nonCreditSuppliers = suppliers.filter(
    (s) => Number(s.creditLimit || 0) === 0
  );

  const filteredSuppliers = nonCreditSuppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">จ่ายเงินล่วงหน้าให้ Supplier</h1>
        <input
          type="text"
          placeholder="ค้นหาชื่อผู้ขาย..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 w-full md:w-72 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
        />
      </div>
      {isSupplierLoading ? (
        <p className="text-center text-gray-600">กำลังโหลดข้อมูล...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white shadow-sm rounded">
            <thead className="bg-blue-100 text-gray-700 text-sm">
              <tr>
                <th className="border px-4 py-2 text-left">ชื่อ Supplier</th>
                <th className="border px-4 py-2 text-center">เบอร์โทร</th>
                <th className="border px-4 py-2 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">
                    ไม่พบข้อมูล Supplier ที่ตรงเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 text-sm">
                    <td className="border px-4 py-2">{s.name}</td>
                    <td className="border px-4 py-2 text-center">{s.phone}</td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleNavigate(s.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded transition"
                      >
                        จ่ายเงินล่วงหน้า
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListAdvancePaymentsSupplierPage;