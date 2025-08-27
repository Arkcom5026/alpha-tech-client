// pages/FullSalePage.jsx
import React, { useState } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';
import ProductSearchBox from '@/components/pos/ProductSearchBox';
import SaleItemTable from '@/components/pos/SaleItemTable';
import CustomerSelector from '@/components/pos/CustomerSelector';
import { useNavigate } from 'react-router-dom';

const FullSalePage = () => {
  const navigate = useNavigate();
  const {
    saleItems,
    customer,
    totalAmount,
    addSaleItemAction,
    removeSaleItemAction,
    updateSaleItemQtyAction,
    setCustomerAction,
    createSaleOrderAction,
  } = useSalesStore();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmSale = async () => {
    try {
      if (!customer?.id || saleItems.length === 0) {
        setError('กรุณาเลือกลูกค้าและสินค้าให้ครบถ้วน');
        return;
      }
      setSubmitting(true);
      const saleOrder = await createSaleOrderAction();
      navigate(`/pos/full-sale/${saleOrder.id}/payment`); // ➜ หน้า payment แยก
    } catch (err) {
      console.error('❌ สร้างใบขายล้มเหลว:', err);
      setError('เกิดข้อผิดพลาดในการสร้างใบขาย');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🧾 การขายแบบเต็ม (Full Sale)</h1>

      <div className="mb-4">
        <CustomerSelector onSelect={(cust) => setCustomerAction(cust)} selected={customer} />
      </div>

      <div className="mb-4">
        <ProductSearchBox onAdd={addSaleItemAction} />
      </div>

      <div className="mb-4">
        <SaleItemTable
          items={saleItems}
          onRemove={removeSaleItemAction}
          onUpdateQty={updateSaleItemQtyAction}
        />
      </div>

      <div className="mb-4 text-right text-lg font-semibold">
        ยอดรวม: {totalAmount.toFixed(2)} ฿
      </div>

      {error && <p className="text-red-600 mb-4">❌ {error}</p>}

      <div className="text-right">
        <button
          onClick={handleConfirmSale}
          disabled={submitting}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          ✅ บันทึกใบขายและไปชำระเงิน
        </button>
      </div>
    </div>
  );
};

export default FullSalePage;
