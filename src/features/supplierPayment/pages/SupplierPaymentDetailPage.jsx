

// SupplierPaymentDetailPage.js
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import SupplierPaymentTable from '../components/SupplierPaymentTable';
import useSupplierPaymentStore from '../store/supplierPaymentStore';

const SupplierPaymentDetailPage = () => {
  const { supplierId } = useParams();

  const {
    selectedSupplier,
    advancePayments,
    fetchAdvancePaymentsBySupplierAction,
    // setSelectedSupplier ไม่จำเป็นต้องดึงมาตรงๆ จาก store หาก action จัดการแล้ว
    // หรือถ้าจำเป็นต้องใช้ ควรมาจาก action ที่ถูกประกาศใน store อย่างชัดเจน
  } = useSupplierPaymentStore();

  useEffect(() => {
    if (supplierId) {
      // เรียก action เพื่อดึงข้อมูลและให้ action จัดการการตั้งค่า selectedSupplier ใน store
      fetchAdvancePaymentsBySupplierAction(supplierId);
    }
  }, [supplierId, fetchAdvancePaymentsBySupplierAction]); // เพิ่ม dependencies ให้ครบถ้วน

  console.log('selectedSupplier?.name : ', selectedSupplier?.name);
  console.log('advancePayments for table : ', advancePayments); // เพิ่ม log เพื่อตรวจสอบ

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">ข้อมูลการชำระเงิน Supplier</h1>

      <div className="bg-white border shadow rounded p-4 mb-6 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <span className="font-semibold">ชื่อ:</span> {selectedSupplier?.name || '-'}
          </div>
          <div>
            <span className="font-semibold">เบอร์โทร:</span> {selectedSupplier?.phone || '-'}
          </div>
          <div>
            <span className="font-semibold">วงเงินเครดิต:</span> {selectedSupplier?.creditLimit?.toLocaleString() || '0'} บาท
          </div>
        </div>
      </div>

      <div className="bg-white border shadow rounded p-4">
        <SupplierPaymentTable
          supplierId={supplierId}
          supplier={selectedSupplier}
          payments={advancePayments}
        />
      </div>
    </div>
  );
};

export default SupplierPaymentDetailPage;
