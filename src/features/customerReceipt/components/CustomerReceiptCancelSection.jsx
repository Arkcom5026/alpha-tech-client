
// src/features/customerReceipt/components/CustomerReceiptCancelSection.jsx

import { useMemo, useState } from 'react';

const formatMoney = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const CustomerReceiptCancelSection = ({ item, submitting = false, onSubmit }) => {
  const [cancelReason, setCancelReason] = useState('');
  
  const [localError, setLocalError] = useState('');

  const canCancel = useMemo(() => {
    return !!item && item.status !== 'CANCELLED';
  }, [item]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');

    if (!item?.id) {
      setLocalError('ไม่พบข้อมูลใบรับเงินที่ต้องการยกเลิก');
      return;
    }

    

    if (!cancelReason.trim()) {
      setLocalError('กรุณาระบุเหตุผลการยกเลิกรายการ');
      return;
    }

    await onSubmit?.({
      cancelReason: cancelReason.trim(),
    });
  };

  if (!item) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">ยกเลิกใบรับเงิน</h2>
        <p className="mt-1 text-sm text-gray-500">
          ใช้เมื่อจำเป็นต้องยกเลิกรายการรับเงินและ rollback การตัดชำระทั้งหมดของใบนี้ โดยระบบจะอ้างอิงสาขาปัจจุบันจาก session อัตโนมัติ
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="space-y-2 text-sm text-amber-900">
          <p>
            เลขที่ใบรับเงิน: <span className="font-semibold">{item?.code || '-'}</span>
          </p>
          <p>
            ยอดรับทั้งหมด: <span className="font-semibold">{formatMoney(item?.totalAmount)}</span>
          </p>
          <p>
            ยอดที่ตัดชำระแล้ว: <span className="font-semibold">{formatMoney(item?.allocatedAmount)}</span>
          </p>
          <p>
            การยกเลิกจะคืนยอดคงเหลือของใบรับเงิน และ rollback paidAmount ของ sale ที่เคยถูกตัดจากใบนี้
          </p>
        </div>
      </div>

      {item?.status === 'CANCELLED' ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          รายการนี้ถูกยกเลิกแล้ว
          {item?.cancelReason ? ` — เหตุผล: ${item.cancelReason}` : ''}
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!!localError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {localError}
            </div>
          )}

          

          <div className="space-y-1.5">
            <label htmlFor="customer-receipt-cancel-reason" className="text-sm font-medium text-gray-700">
              เหตุผลการยกเลิก
            </label>
            <textarea
              id="customer-receipt-cancel-reason"
              rows={4}
              value={cancelReason}
              onChange={(event) => {
                setLocalError('');
                setCancelReason(event.target.value);
              }}
              disabled={submitting || !canCancel}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="อธิบายเหตุผลที่ต้องยกเลิกรายการนี้"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !canCancel}
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิกใบรับเงิน'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CustomerReceiptCancelSection;



