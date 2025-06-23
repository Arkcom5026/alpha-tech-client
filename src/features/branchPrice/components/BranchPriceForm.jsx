// 📄 BranchPriceForm.jsx
import React, { useState } from 'react';
import useBranchPriceStore from '../store/branchPriceStore';

const BranchPriceForm = ({ productId, defaultValues = {}, rawCosts = [], rawPrices = [], latestCostPrice = null, avgCostPrice = null, onClose }) => {
  const { upsertBranchPriceAction } = useBranchPriceStore();

  const [price, setPrice] = useState(defaultValues.price || '');
  const [effectiveDate, setEffectiveDate] = useState(defaultValues.effectiveDate?.slice(0, 10) || '');
  const [expiredDate, setExpiredDate] = useState(defaultValues.expiredDate?.slice(0, 10) || '');
  const [note, setNote] = useState(defaultValues.note || '');
  const [isActive, setIsActive] = useState(defaultValues.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedRefPrice, setSelectedRefPrice] = useState('');

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

  const handleRefPriceSelect = (value) => {
    setSelectedRefPrice(value);
    setPrice(value);
  };

  const renderSalePriceRadios = (label, value) => {
    return (
      <label className="flex items-center space-x-1 whitespace-nowrap">
        <input type="radio" name={`ref-${productId}`} onChange={() => handleRefPriceSelect(value)} />
        <span><strong>{label}:</strong> {value ?? '-'} บาท</span>
      </label>
    );
  };

  const latestItem = rawPrices[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 text-sm text-gray-600 border rounded p-3 bg-gray-50">
          <div className="font-semibold text-gray-800 mb-2">ข้อมูลราคาทุน & ราคาขายอ้างอิง:</div>
          <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 items-center">
            {renderSalePriceRadios('ราคาทุนล่าสุด', latestCostPrice)}
            {renderSalePriceRadios('ราคาทุนเฉลี่ย', avgCostPrice)}
            {latestItem && (
              <>
                {renderSalePriceRadios('ราคาทุน', latestItem.costPrice)}
                {renderSalePriceRadios('ราคาขายส่ง', latestItem.priceWholesale)}
                {renderSalePriceRadios('ราคาช่าง', latestItem.priceTechnician)}
                {renderSalePriceRadios('ราคาขายปลีก', latestItem.priceRetail)}
              </>
            )}
            {(!latestItem && latestCostPrice === null && avgCostPrice === null) && (
              <div className="text-yellow-700">⚠️ ยังไม่มีข้อมูลราคาทุนจาก StockItem ในระบบ</div>
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">ราคาขาย (บาท)</label>
          <input
            type="number"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border px-3 py-1.5 rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">วันที่เริ่มใช้</label>
          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className="w-full border px-3 py-1.5 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">วันที่หมดอายุ</label>
          <input
            type="date"
            value={expiredDate}
            onChange={(e) => setExpiredDate(e.target.value)}
            className="w-full border px-3 py-1.5 rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">หมายเหตุ</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border px-3 py-1.5 rounded"
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
          className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
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