import React from 'react';
import { Link } from 'react-router-dom';
import CustomerReceiptDetailCard from '../../../components/CustomerReceiptDetailCard';
import CustomerReceiptAllocateForm from '../../../components/CustomerReceiptAllocateForm';

const CustomerReceiptAllocationBody = ({
  detailLoading = false,
  receipt,
  receiptListPath,
  candidates = [],
  candidatesSummary = null,
  candidatesLoading = false,
  submitting = false,
  onSubmit,
}) => {
  if (detailLoading) {
    return (
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white" />
        <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-white" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-base font-medium text-gray-900">ไม่พบข้อมูลใบรับเงิน</p>
        <p className="mt-1 text-sm text-gray-500">
          ระบบยังไม่สามารถโหลดข้อมูลใบรับเงินรายการนี้เพื่อทำ allocation ได้
        </p>
        <div className="mt-4">
          <Link
            to={receiptListPath}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            กลับไปรายการ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        <CustomerReceiptDetailCard item={receipt} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">บิลขายที่พร้อมให้ตัดชำระ</h2>
            <p className="text-sm text-gray-500">
              เลือกบิลที่ยังค้างชำระของลูกค้ารายนี้ แล้วกำหนดยอดที่จะตัดจากใบรับเงิน
            </p>
          </div>

          {candidatesSummary?.totalItems != null && (
            <div className="text-sm text-gray-500">ทั้งหมด {candidatesSummary.totalItems} รายการ</div>
          )}
        </div>

        <div className="mt-4">
          <CustomerReceiptAllocateForm
            receipt={receipt}
            candidates={candidates}
            candidatesLoading={candidatesLoading}
            submitting={submitting}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerReceiptAllocationBody;
