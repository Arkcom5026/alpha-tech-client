
// SupplierPaymentDetailPage.js

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';


import useSupplierPaymentStore from '../store/supplierPaymentStore';
import SupplierPaymentHistoryTable from '../components/SupplierPaymentHistoryTable';


const SupplierPaymentDetailPage = () => {
  const { supplierId } = useParams();

  const {
    selectedSupplier,
    supplierPayments,
    fetchSupplierPaymentsBySupplierIdAction,
    // setSelectedSupplier ไม่จำเป็นต้องดึงมาตรงๆ จาก store หาก action จัดการแล้ว
    // หรือถ้าจำเป็นต้องใช้ ควรมาจาก action ที่ถูกประกาศใน store อย่างชัดเจน
  } = useSupplierPaymentStore();

  useEffect(() => {
    if (supplierId) {
      // เรียก action เพื่อดึงข้อมูลและให้ action จัดการการตั้งค่า selectedSupplier ใน store
      fetchSupplierPaymentsBySupplierIdAction(supplierId);
    }
  }, [supplierId, fetchSupplierPaymentsBySupplierIdAction]); // เพิ่ม dependencies ให้ครบถ้วน

  console.log('selectedSupplier?.name : ', selectedSupplier?.name);
  console.log('supplierPayments for table : ', supplierPayments); // เพิ่ม log เพื่อตรวจสอบ

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
            <div>
            <span className="font-semibold">วงเงินเครดิต:</span> {selectedSupplier?.creditLimit?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'} บาท
          </div>
          <div>
            <span className="font-semibold">ยอดเครดิตคงเหลือ:</span> {selectedSupplier?.creditBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'} บาท
          </div>
          </div>
        </div>
      </div>

      <div className="bg-white border shadow rounded p-4">
        <SupplierPaymentHistoryTable
          supplierId={supplierId}
          supplier={selectedSupplier}
          payments={supplierPayments}
        />
      </div>
    </div>
  );
};

export default SupplierPaymentDetailPage;


