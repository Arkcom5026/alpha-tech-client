// 📄 BranchPriceForm.jsx
import React, { useState } from 'react';
import useBranchPriceStore from '../store/branchPriceStore';

const BranchPriceForm = ({ productId, defaultValues = {}, rawCosts = [], rawPrices = [], onClose }) => {
  const { upsertBranchPriceAction } = useBranchPriceStore();

  const [price, setPrice] = useState(defaultValues.price || '');
  const [effectiveDate, setEffectiveDate] = useState(defaultValues.effectiveDate?.slice(0, 10) || '');
  const [expiredDate, setExpiredDate] = useState(defaultValues.expiredDate?.slice(0, 10) || '');
  const [note, setNote] = useState(defaultValues.note || '');
  const [isActive, setIsActive] = useState(defaultValues.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await upsertBranchPriceAction({
        productId,
        price: parseFloat(price),
        effectiveDate: effectiveDate || null,
        expiredDate: expiredDate || null,
        note,
        isActive,
      });
      onClose?.();
    } catch (err) {
      // error ถูกจัดการใน store แล้ว
    } finally {
      setSubmitting(false);
    }
  };

  console.log('🧪 rawPrices : ', rawPrices);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md bg-white">
      <div>
        <label className="block text-sm font-medium">ราคาขาย (บาท)</label>
        <input
          type="number"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border px-3 py-1 rounded"
        />
      </div>

      {rawPrices?.length > 0 ? (
        <div className="text-sm text-gray-500 space-y-1">
          <div>
            <strong>ราคาทุน:</strong> {rawPrices.map((item) => item.costPrice).filter(Boolean).join(', ')} บาท
          </div>
          <div>
            <strong>ราคาขาย 1:</strong> {rawPrices.map((item) => item.salePrice1).filter(Boolean).join(', ')} บาท
          </div>
          <div>
            <strong>ราคาขาย 2:</strong> {rawPrices.map((item) => item.salePrice2).filter(Boolean).join(', ')} บาท
          </div>
          <div>
            <strong>ราคาขาย 3:</strong> {rawPrices.map((item) => item.salePrice3).filter(Boolean).join(', ')} บาท
          </div>
        </div>
      ) : (
        <div className="text-sm text-yellow-600">⚠️ ยังไม่มีข้อมูลราคาทุนหรือราคาขายจาก StockItem</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">วันที่เริ่มใช้</label>
          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className="w-full border px-3 py-1 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">วันที่หมดอายุ</label>
          <input
            type="date"
            value={expiredDate}
            onChange={(e) => setExpiredDate(e.target.value)}
            className="w-full border px-3 py-1 rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">หมายเหตุ</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border px-3 py-1 rounded"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <label className="text-sm">เปิดใช้งาน</label>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          {submitting ? 'กำลังบันทึก...' : 'บันทึกราคา'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-2 text-gray-600 hover:underline"
          >
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
};

export default BranchPriceForm;
