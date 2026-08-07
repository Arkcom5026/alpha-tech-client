import React from 'react';
import { Link } from 'react-router-dom';

const CustomerReceiptAllocationAside = ({ receiptListPath, receiptDetailPath }) => (
  <div className="space-y-6">
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">คำแนะนำการตัดชำระ</h2>
      <div className="mt-3 space-y-3 text-sm text-gray-600">
        <p>1. ตรวจสอบยอดคงเหลือของใบรับเงินก่อนทุกครั้ง</p>
        <p>2. เลือกบิลที่ยังค้างชำระจริง และตัดทีละบิลอย่างระมัดระวัง</p>
        <p>3. ระบบจะไม่ให้ตัดเกินยอดคงเหลือของ receipt หรือยอดค้างของบิล</p>
        <p>4. ระบบจะโหลดบิลค้างชำระจากลูกค้าของ receipt นี้โดยอัตโนมัติภายใต้สาขาปัจจุบัน</p>
        <p>5. หากยกเลิกใบรับเงินภายหลัง ระบบจะ rollback allocation ของใบนี้ทั้งหมด</p>
      </div>
    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">ทางลัด</h2>
      <div className="mt-4 flex flex-col gap-2">
        <Link
          to={receiptDetailPath}
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          กลับหน้ารายละเอียดใบรับเงิน
        </Link>

        <Link
          to={receiptListPath}
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          กลับไปรายการทั้งหมด
        </Link>
      </div>
    </div>
  </div>
);

export default CustomerReceiptAllocationAside;
