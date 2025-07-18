import React, { useEffect, useRef, useState, useCallback } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import useStockItemStore from '@/features/stockItem/store/stockItemStore';

import CustomerSection from '../components/CustomerSection';
import PaymentSection from '../components/PaymentSection';
import SaleItemTable from '../components/SaleItemTable';

const QuickSaleLayout = () => {
  const barcodeInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPriceType, setSelectedPriceType] = useState('retail');
  const [clearPhoneTrigger, setClearPhoneTrigger] = useState(null);
  const [hideCustomerDetails, setHideCustomerDetails] = useState(false);

  // ✨ 1. สร้าง State ใหม่เพื่อเก็บ "โหมดการขาย" ('CASH' หรือ 'CREDIT')
  const [saleMode, setSaleMode] = useState('CASH');

  const {
    saleItems,
    addSaleItemAction,
    removeSaleItemAction,
    confirmSaleOrderAction,
    sharedBillDiscountPerItem,
    billDiscount,
    saleCompleted,
    setSaleCompleted,
  } = useSalesStore();

  const { searchStockItemAction } = useStockItemStore();
  const { clearCustomerAndDeposit, setCustomerIdAction } = useCustomerDepositStore();

  useEffect(() => {
    phoneInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (saleCompleted) {
      console.log('✅ เคลียร์ข้อมูลลูกค้าและมัดจำ...');
      clearCustomerAndDeposit();
      setCustomerIdAction(null);
      setSaleCompleted(false);
      setClearPhoneTrigger(Date.now());
      setSaleMode('CASH'); // ✨ รีเซ็ตโหมดการขายเป็นขายสดเสมอ
      setTimeout(() => {
        setHideCustomerDetails(true);
      }, 200);
    }
  }, [saleCompleted, clearCustomerAndDeposit, setCustomerIdAction, setSaleCompleted]);

  const handleBarcodeSearch = async (e) => {
    if (e.key === 'Enter') {
      const barcode = e.target.value.trim();
      if (!barcode) return;
      try {
        const results = await searchStockItemAction(barcode);
        const foundItem = Array.isArray(results) ? results[0] : results;
        if (foundItem) {
          const preparedItem = {
            barcodeId: foundItem.id,
            barcode: foundItem.barcode,
            stockItemId: foundItem.id,
            productName: foundItem.product?.name || '',
            model: foundItem.product?.model || '',
            price: foundItem.prices?.[selectedPriceType] || 0,
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

  const handleSaleConfirmed = () => {
    setHideCustomerDetails(false);
  };

  const handleConfirmSale = async () => {
    if (saleItems.length === 0 || isSubmitting) return;
    try {
      setIsSubmitting(true);
      // ✨ 2. ส่ง saleMode เข้าไปใน Action เพื่อให้ Backend รู้ว่าเป็นการขายสดหรือเครดิต
      await confirmSaleOrderAction(saleMode); 
      console.log('✅ ยืนยันการขายเสร็จแล้ว → เคลียร์ข้อมูลลูกค้า');
      clearCustomerAndDeposit();
      setCustomerIdAction(null);
      setClearPhoneTrigger(Date.now());
      setSaleMode('CASH'); // ✨ รีเซ็ตโหมดการขาย
      setTimeout(() => {
        setHideCustomerDetails(true);
      }, 200);
    } catch (err) {
      console.error('❌ ยืนยันการขายล้มเหลว:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    {/* <div className="p-4 bg-white rounded-xl shadow-lg mt-4 min-w-[1600px]"> */}
      <div className="flex flex-col-2 gap-2">

        <CustomerSection
          phoneInputRef={phoneInputRef}
          productSearchRef={barcodeInputRef}
          clearTrigger={clearPhoneTrigger}
          onClearFinish={() => setClearPhoneTrigger(null)}
          key={clearPhoneTrigger}
          hideCustomerDetails={hideCustomerDetails}
          // ✨ 3. ส่งฟังก์ชัน setSaleMode เข้าไปใน CustomerSection
          onSaleModeSelect={setSaleMode}
        />
        
        <div className="col-span-12 lg:col-span-8 ">
          <div className="bg-white p-4 ">
            <h2 className="text-lg font-bold text-gray-800">เลือกราคาขาย:</h2>
            <div className="mb-2 flex gap-4 min-w-[1100px]">
              <label className="flex items-center space-x-2 text-gray-700">
                <input type="radio" value="wholesale" checked={selectedPriceType === 'wholesale'} onChange={(e) => setSelectedPriceType(e.target.value)} className="form-radio text-blue-600" />
                <span>ราคาส่ง</span>
              </label>
              <label className="flex items-center space-x-2 text-gray-700">
                <input type="radio" value="technician" checked={selectedPriceType === 'technician'} onChange={(e) => setSelectedPriceType(e.target.value)} className="form-radio text-blue-600" />
                <span>ราคาช่าง</span>
              </label>
              <label className="flex items-center space-x-2 text-gray-700">
                <input type="radio" value="retail" checked={selectedPriceType === 'retail'} onChange={(e) => setSelectedPriceType(e.target.value)} className="form-radio text-blue-600" />
                <span>ราคาปลีก</span>
              </label>
            </div>
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="ค้นหาหรือสแกนบาร์โค้ดสินค้า"
              onKeyDown={handleBarcodeSearch}
              className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 text-lg px-3 py-2 rounded-md shadow-sm"
            />
          </div>

          <div className="bg-white p-4 min-h-[490px]">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">รายการสินค้า</h2>
            <div className="overflow-x-auto">
              <SaleItemTable
                items={saleItems}
                onRemove={removeSaleItemAction}
                sharedBillDiscountPerItem={sharedBillDiscountPerItem}
                billDiscount={billDiscount}
              />
              {saleItems.length === 0 && (
                <p className="text-center text-gray-500 mt-8 text-xl">ไม่มีรายการสินค้า</p>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="col-span-12 py-4 ">
        <PaymentSection
          saleItems={saleItems}
          onConfirm={handleConfirmSale}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          onSaleConfirmed={handleSaleConfirmed}
          setClearPhoneTrigger={setClearPhoneTrigger}
          // ✨ 4. ส่ง saleMode ปัจจุบันและ setter ไปยัง PaymentSection
          onSaleModeChange={setSaleMode}
          currentSaleMode={saleMode}
        />
      </div>
    {/* </div> */}
    </>
  );
};

export default QuickSaleLayout;




