import React, { useEffect, useState } from 'react';
import useCombinedBillingStore from '@/features/combinedBilling/store/combinedBillingStore';
import dayjs from 'dayjs';

const PendingDeliveryNoteTable = () => {
  const {
    customer,
    createCombinedBillingAction,
  } = useCombinedBillingStore();

  const [selectedSaleIds, setSelectedSaleIds] = useState([]);
  const [localSales, setLocalSales] = useState([]);

  useEffect(() => {
    if (customer?.sales?.length > 0) {
      setLocalSales(customer.sales);
      setSelectedSaleIds([]);
    } else {
      setLocalSales([]);
    }
  }, [customer]);

  const toggleSelect = (saleId) => {
    setSelectedSaleIds((prev) =>
      prev.includes(saleId)
        ? prev.filter((id) => id !== saleId)
        : [...prev, saleId]
    );
  };

  const handleCombineBilling = () => {
    if (selectedSaleIds.length === 0) return;
    createCombinedBillingAction(selectedSaleIds);
  };

  if (!customer) return null;

  return (
    <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border w-full">
      <h2 className="text-2xl font-bold text-black mb-4">
        ใบส่งของค้างของลูกค้า: {customer.name}
      </h2>
      <table className="min-w-full table-auto border border-gray-300">
        <thead className="bg-gray-100 text-left text-sm">
          <tr>
            <th className="px-4 py-2 border">เลือก</th>
            <th className="px-4 py-2 border">เลขที่ขาย</th>
            <th className="px-4 py-2 border">หมายเหตุ</th>
            <th className="px-4 py-2 border">วันที่ขาย</th>
            <th className="px-4 py-2 border">ยอดรวม</th>
          </tr>
        </thead>
        <tbody>
          {localSales.map((sale) => (
            <tr key={sale.id} className="text-sm">
              <td className="px-4 py-2 border text-center">
                <input
                  type="checkbox"
                  checked={selectedSaleIds.includes(sale.id)}
                  onChange={() => toggleSelect(sale.id)}
                />
              </td>
              <td className="px-4 py-2 border">{sale.code}</td>
              <td className="px-4 py-2 border">{sale.note || '-'}</td>
              <td className="px-4 py-2 border">{dayjs(sale.soldAt).format('DD/MM/YYYY')}</td>
              <td className="px-4 py-2 border text-right">
                {Number(sale.totalBeforeDiscount || 0).toFixed(2)}
              </td>
            </tr>
          ))}
          {localSales.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-gray-600 py-4">
                ไม่พบใบส่งของที่ค้างของลูกค้ารายนี้
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <button
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={selectedSaleIds.length === 0}
        onClick={handleCombineBilling}
      >
        ยืนยันการรวมบิล
      </button>
    </div>
  );
};

export default PendingDeliveryNoteTable;
