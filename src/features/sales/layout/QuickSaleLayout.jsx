// ✅ อัปเดต Discount Logic ให้ถูกต้องตาม flow

import React, { useEffect, useRef, useState } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerStore from '@/features/customer/store/customerStore';
import useStockItemStore from '@/features/stockItem/store/stockItemStore';

import CustomerSection from '../components/CustomerSection';
import PaymentSection from '../components/PaymentSection';
import SaleItemTable from '../components/SaleItemTable';

const QuickSaleLayout = () => {
  const barcodeInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPriceType, setSelectedPriceType] = useState('retail');

  const {
    saleItems,
    addSaleItemAction,
    removeSaleItemAction,
    confirmSaleOrderAction,
    sharedBillDiscountPerItem,
    billDiscount,
  } = useSalesStore();

  const { searchStockItemAction } = useStockItemStore();
  const { customer } = useCustomerStore();

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (customer?.priceLevel) {
      setSelectedPriceType(customer.priceLevel);
    }
  }, [customer]);

  const handleBarcodeSearch = async (e) => {
    if (e.key === 'Enter') {
      const barcode = e.target.value.trim();
      if (!barcode) return;
      try {
        const results = await searchStockItemAction(barcode);
        const foundItem = Array.isArray(results) ? results[0] : results;
        if (foundItem) {
          const preparedItem = {
            barcode: foundItem.barcode,
            productName: foundItem.product?.name || '',
            model: foundItem.product?.model || '',
            price: foundItem.prices?.[selectedPriceType] || 0,
            stockItemId: foundItem.id,
            discount: 0,
            discountWithoutBill: 0,
            billShare: 0,
          };
          addSaleItemAction(preparedItem);
        }
        e.target.value = '';
      } catch (error) {
        console.error('❌ ค้นหาสินค้าไม่สำเร็จ:', error);
      }
    }
  };

  const handleConfirmSale = async () => {
    if (!customer || saleItems.length === 0 || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await confirmSaleOrderAction();
    } catch (err) {
      console.error('❌ ยืนยันการขายล้มเหลว:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg mt-4 min-w-[1600px]">
      <div className="bg-blue-100 p-4 rounded-xl shadow flex flex-col-2 gap-4 min-w-[600px]">
        <CustomerSection />
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-bold text-black">เลือกราคาขาย:</h2>
            <div className="mb-2 flex gap-4 min-w-[1100px]">
              <label><input type="radio" value="wholesale" checked={selectedPriceType === 'wholesale'} onChange={(e) => setSelectedPriceType(e.target.value)} /> ราคาส่ง</label>
              <label><input type="radio" value="technician" checked={selectedPriceType === 'technician'} onChange={(e) => setSelectedPriceType(e.target.value)} /> ราคาช่าง</label>
              <label><input type="radio" value="retail" checked={selectedPriceType === 'retail'} onChange={(e) => setSelectedPriceType(e.target.value)} /> ราคาปลีก</label>
            </div>
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="ค้นหาหรือสแกนบาร์โค้ดสินค้า"
              onKeyDown={handleBarcodeSearch}
              className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 text-lg px-3 py-2 rounded"
            />
          </div>

          <div className="bg-white p-4 rounded-xl shadow min-h-[390px]">
            <h2 className="text-lg font-semibold mb-2">รายการสินค้า</h2>
            <div className="overflow-x-auto">
              <SaleItemTable
                items={saleItems}
                onRemove={removeSaleItemAction}
                sharedBillDiscountPerItem={sharedBillDiscountPerItem}
                billDiscount={billDiscount}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 py-4">
        <PaymentSection
          saleItems={saleItems}
          onConfirm={handleConfirmSale}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default QuickSaleLayout;
