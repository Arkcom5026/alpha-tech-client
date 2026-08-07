import React from 'react';
import { Link } from 'react-router-dom';

const CustomerReceiptAllocationHeader = ({
  receiptListPath,
  receiptCode,
  detailLoading = false,
  canAllocate = false,
  hasReceipt = false,
}) => (
  <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-start md:justify-between">
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to={receiptListPath} className="transition hover:text-gray-700">
          รายการรับชำระลูกหนี้
        </Link>
        <span>/</span>
        <span className="text-gray-700">ตัดชำระใบรับเงิน</span>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900">
        {receiptCode ? `ตัดชำระ ${receiptCode}` : 'ตัดชำระใบรับเงิน'}
      </h1>
      <p className="text-sm text-gray-600">
        นำยอดคงเหลือของใบรับเงินไปตัดชำระกับบิลขายที่ค้างชำระของลูกค้ารายเดียวกัน
      </p>
    </div>

    {!detailLoading && !canAllocate && hasReceipt && (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        ใบรับเงินนี้ไม่สามารถตัดชำระเพิ่มได้แล้ว
      </div>
    )}
  </div>
);

export default CustomerReceiptAllocationHeader;
