

// src/features/customerReceipt/components/CustomerReceiptAllocateForm.jsx

import { useMemo, useState } from 'react';

import SaleAllocationCandidateTable from './SaleAllocationCandidateTable';

const formatMoney = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const toSafePositiveNumber = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

const buildAutoAllocationPlan = ({ candidates = [], receiptRemainingAmount = 0 }) => {
  let remaining = toSafePositiveNumber(receiptRemainingAmount);
  if (remaining <= 0) return [];

  const sortedCandidates = [...candidates].sort((a, b) => {
    const aDate = new Date(a?.saleDate || a?.createdAt || 0).getTime() || 0;
    const bDate = new Date(b?.saleDate || b?.createdAt || 0).getTime() || 0;

    if (aDate !== bDate) return aDate - bDate;
    return Number(a?.id || 0) - Number(b?.id || 0);
  });

  const allocations = [];

  for (const candidate of sortedCandidates) {
    const outstandingAmount = toSafePositiveNumber(candidate?.outstandingAmount);
    if (remaining <= 0) break;
    if (outstandingAmount <= 0) continue;

    const amount = Math.min(remaining, outstandingAmount);
    if (amount <= 0) continue;

    allocations.push({
      saleId: Number(candidate.id),
      code: candidate.code || `SALE #${candidate.id}`,
      customerName: candidate.customerName || candidate.customer?.name || null,
      outstandingAmount,
      amount,
    });

    remaining -= amount;
  }

  return allocations;
};

const CustomerReceiptAllocateForm = ({
  receipt,
  candidates = [],
  candidatesLoading = false,
  submitting = false,
  onSubmit,
}) => {
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [localError, setLocalError] = useState('');
  const [allocationPlan, setAllocationPlan] = useState([]);
  const [allocationMode, setAllocationMode] = useState('MANUAL');

  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  const receiptRemainingAmount = Number(receipt?.remainingAmount || 0);

  const normalizedCandidates = useMemo(() => {
    return safeCandidates.map((item) => {
      const totalAmount = Number(item?.totalAmount || 0);
      const paidAmount = Number(item?.paidAmount || 0);
      const outstandingAmount = Math.max(0, totalAmount - paidAmount);

      return {
        ...item,
        outstandingAmount,
      };
    });
  }, [safeCandidates]);

  const selectedSale = useMemo(() => {
    return normalizedCandidates.find((item) => Number(item?.id) === Number(selectedSaleId)) || null;
  }, [normalizedCandidates, selectedSaleId]);

  const suggestedAmount = useMemo(() => {
    if (!selectedSale) return 0;
    return Math.min(receiptRemainingAmount, Number(selectedSale.outstandingAmount || 0));
  }, [receiptRemainingAmount, selectedSale]);

  const plannedTotalAmount = useMemo(() => {
    return allocationPlan.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
  }, [allocationPlan]);

  const plannedRemainingReceiptAmount = Math.max(0, receiptRemainingAmount - plannedTotalAmount);

  const handleSelectSale = (sale) => {
    setLocalError('');
    setAllocationMode('MANUAL');
    setSelectedSaleId(sale?.id || null);

    const nextSuggestedAmount = Math.min(
      receiptRemainingAmount,
      Number(sale?.outstandingAmount || 0)
    );

    setAmount(nextSuggestedAmount > 0 ? String(nextSuggestedAmount) : '');
    setAllocationPlan(
      sale?.id
        ? [
            {
              saleId: Number(sale.id),
              code: sale.code || `SALE #${sale.id}`,
              outstandingAmount: Number(sale?.outstandingAmount || 0),
              amount: nextSuggestedAmount > 0 ? nextSuggestedAmount : 0,
            },
          ]
        : []
    );
  };

  const handleAutoAllocate = () => {
    setLocalError('');
    const nextPlan = buildAutoAllocationPlan({
      candidates: normalizedCandidates,
      receiptRemainingAmount,
    });

    if (!nextPlan.length) {
      setAllocationMode('AUTO');
      setSelectedSaleId(null);
      setAmount('');
      setAllocationPlan([]);
      setLocalError('ไม่พบบิลค้างชำระที่สามารถนำมาตัดชำระได้');
      return;
    }

    setAllocationMode('AUTO');
    setSelectedSaleId(null);
    setAmount('');
    setAllocationPlan(nextPlan);
  };

  const handleClearPlan = () => {
    setLocalError('');
    setAllocationMode('MANUAL');
    setSelectedSaleId(null);
    setAmount('');
    setAllocationPlan([]);
    setNote('');
  };

  const validateForm = () => {
    if (!receipt?.id) return 'ไม่พบข้อมูลใบรับเงินที่ต้องการตัดชำระ';

    if (receipt?.status === 'CANCELLED') {
      return 'ไม่สามารถตัดชำระได้ เนื่องจากใบรับเงินถูกยกเลิกแล้ว';
    }

    if (receiptRemainingAmount <= 0) {
      return 'ใบรับเงินนี้ไม่มียอดคงเหลือสำหรับตัดชำระแล้ว';
    }

    if (allocationMode === 'AUTO') {
      if (!allocationPlan.length) {
        return 'ยังไม่มีรายการ auto allocate ที่พร้อมตัดชำระ';
      }

      const invalidItem = allocationPlan.find(
        (item) => !Number(item?.saleId) || Number(item?.amount || 0) <= 0
      );
      if (invalidItem) {
        return 'พบรายการ auto allocate ที่ไม่สมบูรณ์ กรุณาสร้างแผนใหม่อีกครั้ง';
      }

      if (plannedTotalAmount > receiptRemainingAmount) {
        return 'ยอดรวม auto allocate มากกว่ายอดคงเหลือของใบรับเงิน';
      }

      return '';
    }

    if (!selectedSale || !selectedSale.id) {
      return 'กรุณาเลือกบิลขายที่ต้องการตัดชำระ';
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return 'กรุณาระบุจำนวนเงินที่ต้องการตัดชำระให้มากกว่า 0';
    }

    if (parsedAmount > receiptRemainingAmount) {
      return 'จำนวนเงินที่ตัดชำระมากกว่ายอดคงเหลือของใบรับเงิน';
    }

    if (parsedAmount > Number(selectedSale.outstandingAmount || 0)) {
      return 'จำนวนเงินที่ตัดชำระมากกว่ายอดคงค้างของบิลขาย';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');

    const validationMessage = validateForm();
    if (validationMessage) {
      setLocalError(validationMessage);
      return;
    }

    if (allocationMode === 'AUTO') {
      await onSubmit?.({
        allocations: allocationPlan.map((item) => ({
          saleId: Number(item.saleId),
          amount: Number(item.amount),
          note: note.trim() || null,
        })),
      });
    } else {
      await onSubmit?.({
        saleId: Number(selectedSaleId),
        amount: Number(amount),
        note: note.trim() || null,
      });
    }

    setAmount('');
    setNote('');
    setSelectedSaleId(null);
    setAllocationPlan([]);
    setAllocationMode('MANUAL');
  };

  const canSubmit =
    !submitting &&
    !candidatesLoading &&
    receipt?.status !== 'CANCELLED' &&
    receiptRemainingAmount > 0 &&
    normalizedCandidates.length > 0 &&
    (allocationMode === 'AUTO' ? allocationPlan.length > 0 : true);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-blue-700">ยอดคงเหลือในใบรับเงิน</p>
            <p className="mt-1 text-2xl font-semibold text-blue-900">
              {formatMoney(receiptRemainingAmount)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-blue-700">โหมดการตัดชำระ</p>
            <p className="mt-1 text-sm font-medium text-blue-900">
              {allocationMode === 'AUTO' ? 'Auto Allocate' : 'Manual Allocate'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-blue-700">บิลที่เลือก / แผนที่สร้าง</p>
            <p className="mt-1 text-sm font-medium text-blue-900">
              {allocationMode === 'AUTO'
                ? allocationPlan.length > 0
                  ? `${allocationPlan.length} รายการ`
                  : 'ยังไม่ได้สร้างแผน auto allocate'
                : selectedSale?.code || 'ยังไม่ได้เลือกบิลขาย'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-blue-700">ยอดรวมที่จะตัด</p>
            <p className="mt-1 text-2xl font-semibold text-blue-900">
              {formatMoney(allocationMode === 'AUTO' ? plannedTotalAmount : suggestedAmount)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleAutoAllocate}
            disabled={submitting || candidatesLoading || normalizedCandidates.length === 0}
            className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Auto Allocate ทั้งหมด
          </button>

          <button
            type="button"
            onClick={handleClearPlan}
            disabled={submitting || candidatesLoading}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            ล้างแผนการตัดชำระ
          </button>
        </div>
      </div>

      <SaleAllocationCandidateTable
        items={normalizedCandidates}
        loading={candidatesLoading}
        selectedSaleId={selectedSaleId}
        onSelect={handleSelectSale}
      />

      <form className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4" onSubmit={handleSubmit}>
        {!!localError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {localError}
          </div>
        )}

        {allocationMode === 'AUTO' && allocationPlan.length > 0 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-emerald-900">แผน Auto Allocate</h3>
                <p className="text-xs text-emerald-700">
                  ระบบจัดสรรยอดตามลำดับบิลเก่าก่อน โดยไม่ให้เกินยอดคงเหลือของใบรับเงินและยอดคงค้างของแต่ละบิล
                </p>
              </div>
              <div className="text-right text-xs text-emerald-800">
                <div>ยอดรวมที่จะตัด: {formatMoney(plannedTotalAmount)}</div>
                <div>ยอดคงเหลือหลังตัด: {formatMoney(plannedRemainingReceiptAmount)}</div>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-emerald-200 bg-white">
              <table className="min-w-full divide-y divide-emerald-100 text-sm">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      บิลขาย
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      ยอดคงค้าง
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      จำนวนที่จะตัด
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 bg-white">
                  {allocationPlan.map((item) => (
                    <tr key={`auto-plan-${item.saleId}`}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                      <td className="px-4 py-3 text-right text-sm text-amber-700">
                        {formatMoney(item.outstandingAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-700">
                        {formatMoney(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="allocate-sale-code" className="text-sm font-medium text-gray-700">
              บิลที่เลือก
            </label>
            <input
              id="allocate-sale-code"
              type="text"
              value={allocationMode === 'AUTO' ? 'AUTO ALLOCATE' : selectedSale?.code || ''}
              readOnly
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none"
              placeholder="กรุณาเลือกบิลจากตารางด้านบน"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="allocate-amount" className="text-sm font-medium text-gray-700">
              จำนวนเงินที่ตัดชำระ
            </label>
            <input
              id="allocate-amount"
              type="number"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-right text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="0.00"
              value={allocationMode === 'AUTO' ? String(plannedTotalAmount || '') : amount === '0' ? '' : amount}
              onChange={(event) => {
                if (allocationMode === 'AUTO') return;
                setLocalError('');
                setAmount(event.target.value);
              }}
              min="0"
              step="0.01"
              disabled={submitting || allocationMode === 'AUTO' || !selectedSale}
            />
            <p className="text-xs text-gray-500">
              สูงสุดไม่เกิน{' '}
              {formatMoney(
                allocationMode === 'AUTO'
                  ? plannedTotalAmount
                  : Math.min(receiptRemainingAmount, Number(selectedSale?.outstandingAmount || 0))
              )}
            </p>
            <p className="text-xs text-gray-500">
              ระบบจะอ้างอิงสาขาปัจจุบันจาก session อัตโนมัติ
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="allocate-note" className="text-sm font-medium text-gray-700">
            หมายเหตุการตัดชำระ
          </label>
          <textarea
            id="allocate-note"
            rows={3}
            value={note}
            onChange={(event) => {
              setLocalError('');
              setNote(event.target.value);
            }}
            disabled={submitting}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="บันทึกรายละเอียดเพิ่มเติม เช่น รับชำระตามหนังสือแจ้งหนี้, งวดที่ 1, หรือหมายเหตุภายใน"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? 'กำลังตัดชำระ...'
              : allocationMode === 'AUTO'
                ? 'ยืนยัน Auto Allocate'
                : 'ยืนยันตัดชำระ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerReceiptAllocateForm;



