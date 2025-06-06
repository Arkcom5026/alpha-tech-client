// 📁 FILE: pages/pos/sales/QuickSalePage.jsx
// ✅ COMMENT: ปรับ input ส่วนลดท้ายบิล: ให้อยู่ชิดขวา และลดขนาด box ให้เล็กลง
// ✅ COMMENT: เพิ่มยอดรวมราคาสินค้าก่อนส่วนลด และ Vat 7% แบบแยกรายการ

import React, { useState, useEffect } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';
import SaleItemTable from '@/features/sales/components/SaleItemTable';

const QuickSalePage = () => {
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [billDiscount, setBillDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [liveItems, setLiveItems] = useState([]);

  const {
    saleItems,
    addSaleItemAction,
    removeSaleItemAction,
    confirmSaleOrderAction,
    searchStockItemAction,
  } = useSalesStore();

  const handleCreateCustomer = async () => {
    if (!phone || phone.length < 9) return alert('กรุณากรอกเบอร์โทรให้ถูกต้อง');
    try {
      setCreatingCustomer(true);
      const res = await fetch('/api/customers/quick-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      const customerId = data.customerId;
      setCustomerName(data.name);
      useSalesStore.setState({ customerId });
    } catch (err) {
      console.error('❌ [createCustomerInPOS]', err);
      alert('ไม่สามารถสร้างลูกค้าได้');
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleConfirmSale = async () => {
    await confirmSaleOrderAction();
  };

  const handleBarcodeSearch = async (e) => {
    if (e.key === 'Enter') {
      const barcode = e.target.value.trim();
      if (!barcode) return;
      const item = await searchStockItemAction(barcode);
      if (!item) return alert('ไม่พบสินค้านี้ในระบบ');
      addSaleItemAction(item);
      e.target.value = '';
    }
  };

  const totalDiscountOnly = liveItems.reduce(
    (sum, item) => sum + (item.discount || 0),
    0
  );

  const totalDiscount = totalDiscountOnly + billDiscount;

  const totalOriginalPrice = liveItems.reduce(
    (sum, item) => sum + (item.price || 0),
    0
  );

  const vatAmount = finalPrice * 0.07;
  const priceBeforeVat = finalPrice - vatAmount;

  useEffect(() => {
    const price = liveItems.reduce(
      (sum, item) => sum + Math.max(0, item.price - (item.discount || 0) - (item.billShare || 0)),
      0
    );
    setFinalPrice(price);
  }, [liveItems]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-md mx-auto">
      <h1 className="text-xl font-bold text-center md:text-left">ขายสินค้า (Quick Sale)</h1>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
        <input
          type="tel"
          placeholder="กรอกเบอร์โทรลูกค้า"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-64"
        />
        <button
          onClick={handleCreateCustomer}
          disabled={creatingCustomer}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {creatingCustomer ? 'กำลังตรวจสอบ...' : 'ยืนยันเบอร์ลูกค้า'}
        </button>
        {customerName && <span className="text-green-600">📌 ลูกค้า: {customerName}</span>}
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="ยิงหรือกรอกรหัสบาร์โค้ดสินค้า"
          onKeyDown={handleBarcodeSearch}
          className="border rounded px-3 py-2 w-full md:w-96"
        />
      </div>

      <SaleItemTable
        items={saleItems}
        onRemove={removeSaleItemAction}
        billDiscount={billDiscount}
        onChangeItems={setLiveItems}
      />

      <div className="pt-4">
        <div className="bg-gray-50 border rounded shadow-sm p-4 w-full max-w-sm ml-auto space-y-3 text-base">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 items-center">
            <span className="text-gray-600">ยอดรวมราคาสินค้า:</span>
            <span className="text-right text-gray-800">{totalOriginalPrice.toLocaleString()} ฿</span>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-x-3 items-center">
            <span className="text-gray-600">ส่วนลดต่อรายการ:</span>
            <span className="text-right font-semibold text-orange-500">{totalDiscountOnly.toLocaleString()} ฿</span>
          </div>

          <div className="flex justify-between items-center">
            <label className="text-gray-600">ส่วนลดท้ายบิล:</label>
            <input
              type="number"
              min="0"
              value={billDiscount}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setBillDiscount(Number.isNaN(val) ? 0 : val);
              }}
              className="w-20 px-2 py-1 border rounded text-right font-medium"
            />
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-x-3 items-center">
            <span className="text-gray-600">รวมส่วนลดทั้งหมด:</span>
            <span className="text-right font-bold text-orange-700">🧾 {totalDiscount.toLocaleString()} ฿</span>
          </div>

          <hr />

          <div className="grid grid-cols-[auto_1fr] gap-x-3 items-center">
            <span className="text-gray-600">ยอดก่อนภาษี (Net):</span>
            <span className="text-right text-gray-800">{priceBeforeVat.toLocaleString()} ฿</span>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-x-3 items-center">
            <span className="text-gray-600">Vat 7%:</span>
            <span className="text-right text-red-500">{vatAmount.toLocaleString()} ฿</span>
          </div>

          <div className="text-xl font-bold text-green-700 text-right">
            ยอดที่ต้องชำระ: {finalPrice.toLocaleString()} ฿
          </div>

          <div className="pt-4 text-right">
            <button
              onClick={handleConfirmSale}
              disabled={!Array.isArray(saleItems) || saleItems.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              ✅ ยืนยันการขาย
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSalePage;
