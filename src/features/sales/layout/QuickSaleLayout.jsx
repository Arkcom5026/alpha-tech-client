import React, { useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import useSaleStore from '@/features/bill/store/saleStore';
import useCustomerStore from '@/features/customer/store/customerStore';
import CustomerSection from '../components/CustomerSection';
import PaymentSection from '../components/PaymentSection';

const QuickSaleLayout = () => {
  const barcodeInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    saleItems,
    addSaleItemAction,
    searchStockItemAction,
    confirmSaleAction,
  } = useSaleStore();

  const {
    customer,
  } = useCustomerStore();

  const netTotal = Array.isArray(saleItems) ? saleItems.reduce((sum, item) => sum + item.price, 0) : 0;

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const handleBarcodeSearch = async (e) => {
    if (e.key === 'Enter') {
      const barcode = e.target.value.trim();
      if (!barcode) return;
      try {
        const foundItem = await searchStockItemAction(barcode);
        if (foundItem) {
          addSaleItemAction(foundItem);
        }
        e.target.value = '';
      } catch (error) {
        console.error('ค้นหาสินค้าไม่สำเร็จ:', error);
      }
    }
  };

  const handleConfirmSale = async () => {
    if (!customer || saleItems.length === 0 || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await confirmSaleAction();
      // TODO: แสดงข้อความสำเร็จ / redirect หรือ reset
    } catch (err) {
      console.error('❌ ยืนยันการขายล้มเหลว:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 grid grid-cols-12 gap-4 bg-gray-50 min-h-screen">
      {/* ด้านขวา: รายการสินค้า */}
      <div className="col-span-12 lg:col-span-8 space-y-4">
        {/* ช่องสแกนบาร์โค้ด */}
        <div className="bg-white p-4 rounded-xl shadow">
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="ค้นหาหรือสแกนบาร์โค้ดสินค้า"
            onKeyDown={handleBarcodeSearch}
            className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 text-lg px-3 py-2 rounded"
          />
        </div>

        {/* รายการสินค้า */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">รายการสินค้า</h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left border-t">
              <thead>
                <tr>
                  <th className="px-2 py-1">ลำดับ</th>
                  <th className="px-2 py-1">ชื่อสินค้า</th>
                  <th className="px-2 py-1">บาร์โค้ด</th>
                  <th className="px-2 py-1">ราคา</th>
                  <th className="px-2 py-1">ลบ</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(saleItems) ? saleItems : []).map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-2 py-1">{index + 1}</td>
                    <td className="px-2 py-1">{item.name}</td>
                    <td className="px-2 py-1">{item.barcode}</td>
                    <td className="px-2 py-1">{item.price} ฿</td>
                    <td className="px-2 py-1">
                      <button className="text-red-600"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* สรุปการขาย */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">สรุปการขาย</h2>
          <p>ภาษี VAT (7%): <strong>0 ฿</strong></p>
          <p>ยอดสุทธิ (Net): <strong>{netTotal} ฿</strong></p>
          <p className="text-green-600 text-xl mt-2 bg-green-100 p-2 rounded">
            ยอดที่ต้องชำระ: <strong>{netTotal} ฿</strong>
          </p>
        </div>
      </div>

      {/* ด้านซ้าย: ลูกค้าและชำระเงิน */}
      <div className="col-span-12 lg:col-span-4 space-y-4">
        <CustomerSection />
        <PaymentSection netTotal={netTotal} onConfirm={handleConfirmSale} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default QuickSaleLayout;
