import React, { useEffect, useRef, useState, useCallback } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import useStockItemStore from '@/features/stockItem/store/stockItemStore';

import CustomerSection from '../components/CustomerSection';
import PaymentSection from '../components/PaymentSection'; // PaymentSection ที่จะถูก Refactor
import SaleItemTable from '../components/SaleItemTable';

const QuickSaleLayout = () => {
  const barcodeInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPriceType, setSelectedPriceType] = useState('retail');
  const [clearPhoneTrigger, setClearPhoneTrigger] = useState(null);
  const [hideCustomerDetails, setHideCustomerDetails] = useState(false);

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
    // กำหนด focus ไปที่ช่องเบอร์โทรศัพท์เมื่อ Component โหลดครั้งแรก
    phoneInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (clearPhoneTrigger) {
      setHideCustomerDetails(false); // ✅ เปิดให้แสดงฟอร์มใหม่เมื่อค้นหาเบอร์ใหม่
    }
  }, [clearPhoneTrigger]);

  useEffect(() => {
    // เมื่อการขายเสร็จสมบูรณ์ ให้เคลียร์ข้อมูลลูกค้าและตั้งค่าการซ่อนรายละเอียด
    if (saleCompleted) {
      console.log('✅ เคลียร์ข้อมูลลูกค้าและมัดจำ...');
      clearCustomerAndDeposit();
      setCustomerIdAction(null);
      setSaleCompleted(false);
      setClearPhoneTrigger(Date.now()); // ทริกเกอร์การล้างข้อมูลใน CustomerSection
      setTimeout(() => {
        setHideCustomerDetails(true); // ซ่อนรายละเอียดลูกค้าหลังจากเคลียร์ข้อมูล
      }, 200);
    }
  }, [saleCompleted, clearCustomerAndDeposit, setCustomerIdAction, setSaleCompleted]);

  const handleBarcodeSearch = async (e) => {
    // เมื่อกด Enter ในช่องบาร์โค้ด
    if (e.key === 'Enter') {
      const barcode = e.target.value.trim();
      if (!barcode) return; // ไม่ทำอะไรถ้าบาร์โค้ดว่างเปล่า
      try {
        const results = await searchStockItemAction(barcode); // ค้นหาสินค้าจากบาร์โค้ด
        const foundItem = Array.isArray(results) ? results[0] : results; // เลือกสินค้าตัวแรกหากมีหลายรายการ
        if (foundItem) {
          // เตรียมข้อมูลสินค้าเพื่อเพิ่มเข้าในรายการขาย
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
          addSaleItemAction(preparedItem); // เพิ่มสินค้าลงในรายการขาย
        }
        e.target.value = ''; // ล้างช่องบาร์โค้ดหลังจากเพิ่มสินค้า
      } catch (error) {
        console.error('❌ ค้นหาสินค้าไม่สำเร็จ:', error);
      }
    }
  };

  const handleSaleConfirmed = () => {
    // เมื่อการขายได้รับการยืนยัน ให้แสดงรายละเอียดลูกค้าอีกครั้ง (ถ้ามี)
    setHideCustomerDetails(false);
  };

  const handleConfirmSale = async () => {
    // ยืนยันการขาย (Logic นี้จะถูกย้ายไปอยู่ใน PaymentSection ที่ Refactor แล้ว)
    // แต่ยังคงอยู่ใน QuickSaleLayout เพื่อให้ PaymentSection สามารถเรียกใช้ได้
    if (saleItems.length === 0 || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await confirmSaleOrderAction();
      console.log('✅ ยืนยันการขายเสร็จแล้ว → เคลียร์ข้อมูลลูกค้า');
      clearCustomerAndDeposit();
      setCustomerIdAction(null);
      setClearPhoneTrigger(Date.now());
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
    <div className="p-4 bg-white rounded-xl shadow-lg mt-4 min-w-[1600px]">
      <div className="bg-blue-100 p-4 rounded-xl shadow flex flex-col-2 gap-4 min-w-[600px]">
        {/* ส่วนข้อมูลลูกค้า */}
        <CustomerSection
          phoneInputRef={phoneInputRef}
          productSearchRef={barcodeInputRef}
          clearTrigger={clearPhoneTrigger}
          onClearFinish={() => setClearPhoneTrigger(null)}
          key={clearPhoneTrigger}
          hideCustomerDetails={hideCustomerDetails}
        />
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* ส่วนเลือกราคาขายและค้นหาสินค้า */}
          <div className="bg-white p-4 rounded-xl shadow">
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

          {/* ตารางรายการสินค้า */}
          <div className="bg-white p-4 rounded-xl shadow min-h-[390px]">
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

      {/* ส่วนการชำระเงิน - ใช้ PaymentSection ที่ Refactor แล้ว */}
      <div className="col-span-12 py-4">
        <PaymentSection
          saleItems={saleItems}
          onConfirm={handleConfirmSale} // ส่งฟังก์ชันยืนยันการขายจาก QuickSaleLayout
          isSubmitting={isSubmitting}
          onSaleConfirmed={handleSaleConfirmed}
          setClearPhoneTrigger={setClearPhoneTrigger}
        />
      </div>
    </div>
  );
};

export default QuickSaleLayout;
