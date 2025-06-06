// 📁 FILE: pages/pos/sales/QuickSalePage.jsx
// ✅ COMMENT: เพิ่มฟอร์มเก็บข้อมูลลูกค้าเพิ่มเติม (ชื่อ, นามสกุล, อีเมล, ที่อยู่) แบบไม่บังคับ

import React, { useState, useEffect, useRef } from 'react';
import InputMask from 'react-input-mask';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerStore from '@/features/customer/store/customerStore';
import SaleItemTable from '@/features/sales/components/SaleItemTable';

const QuickSalePage = () => {
  const [formError, setFormError] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [billDiscount, setBillDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [liveItems, setLiveItems] = useState([]);
  const [pendingPhone, setPendingPhone] = useState('');

  const phoneInputRef = useRef(null);

  const {
    customer,
    searchCustomerByPhoneAction,
    createCustomerAction,
    loading: customerLoading,
    error: customerError,
  } = useCustomerStore();

  const {
    saleItems,
    addSaleItemAction,
    removeSaleItemAction,
    confirmSaleOrderAction,
    searchStockItemAction,
  } = useSalesStore();

  const rawPhone = phone.replace(/-/g, '');

  const handleVerifyPhone = async () => {
    setFormError('');
    if (!/^[0-9]{10}$/.test(rawPhone)) {
      setFormError('กรุณากรอกเบอร์โทรให้ครบ 10 หลัก');
      return;
    }

    const result = await searchCustomerByPhoneAction(rawPhone);

    if (result?.id) {
      setPendingPhone('');
    } else {
      setPendingPhone(rawPhone);
    }
  };

  const handleConfirmCreateCustomer = async () => {
    if (!pendingPhone) return;

    const fullName = `${name || 'ลูกค้าทั่วไป'}${lastName ? ' ' + lastName : ''}`;
    await createCustomerAction({
      phone: pendingPhone,
      name: fullName,
      email: email || null,
      address: address || null,
    });

    await handleVerifyPhone(); // ✅ ตรวจสอบข้อมูลลูกค้าอีกครั้งทันทีหลังสร้าง

    setPendingPhone('');
    setName('');
    setLastName('');
    setEmail('');
    setAddress('');
  };

  const handleCancelCreateCustomer = () => {
    setPendingPhone('');
    setPhone('');
  };

  const handleConfirmSale = async () => {
    if (!customer?.id) {
      setFormError('กรุณายืนยันเบอร์ลูกค้าก่อนทำรายการขาย');
      return;
    }

    const payload = {
      customerId: customer.id,
      totalBeforeDiscount: totalOriginalPrice,
      totalDiscount,
      vat: vatAmount,
      vatRate: 7,
      totalAmount: finalPrice,
      paymentMethod: 'CASH',
      paymentDetails: null,
      note: '',
      items: liveItems.map((item) => ({
        stockItemId: item.stockItemId,
        barcodeId: item.barcodeId,
        price: item.price,
        discount: item.discount,
        basePrice: item.basePrice || 0,
        vatAmount: item.vatAmount || 0,
        remark: item.remark || '',
      })),
    };

    console.log('📦 Payload ส่งไปที่ backend:', payload);

    const result = await confirmSaleOrderAction(payload);
    if (result?.error) {
      setFormError(result.error);
      return;
    }
  };

  const handleBarcodeSearch = async (e) => {
    if (e.key === 'Enter') {
      const barcode = e.target.value.trim();
      if (!barcode) return;
      const item = await searchStockItemAction(barcode);
      if (!item) {
        setFormError('ไม่พบสินค้านี้ในระบบ');
        return;
      }
      addSaleItemAction(item);
      e.target.value = '';
    }
  };

  const totalDiscountOnly = liveItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  const totalDiscount = totalDiscountOnly + billDiscount;
  const totalOriginalPrice = liveItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const vatAmount = finalPrice * 0.07;
  const priceBeforeVat = finalPrice - vatAmount;

  useEffect(() => {
    const price = liveItems.reduce(
      (sum, item) => sum + Math.max(0, item.price - (item.discount || 0) - (item.billShare || 0)),
      0
    );
    setFinalPrice(price);
  }, [liveItems]);

  useEffect(() => {
    if (pendingPhone && phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, [pendingPhone]);

  useEffect(() => {
    if (pendingPhone && rawPhone !== pendingPhone) {
      setPendingPhone('');
    }
  }, [phone]);

  return (
    // 🔽 unchanged JSX ด้านล่าง
    <div className="p-4 md:p-6 space-y-6 max-w-screen-md mx-auto">


      <h1 className="text-xl font-bold text-center md:text-left">ขายสินค้า (Quick Sale)</h1>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
        <div className="w-full md:w-64">
          <InputMask
            mask="099-999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          >
            {(inputProps) => (
              <input
                {...inputProps}
                ref={phoneInputRef}
                type="tel"
                placeholder="เบอร์โทรลูกค้า (0xx-xxx-xxxx)"
                className="border rounded px-3 py-2 w-full"
              />
            )}
          </InputMask>
          {!/^[0-9]{10}$/.test(rawPhone) && (
            <span className="text-sm text-red-500 mt-1 block">กรุณากรอกเบอร์โทรให้ครบ 10 หลัก</span>
          )}
        </div>

        <button
          onClick={handleVerifyPhone}
          disabled={customerLoading || !/^[0-9]{10}$/.test(rawPhone)}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {customerLoading ? 'กำลังตรวจสอบ...' : 'ยืนยันเบอร์ลูกค้า'}
        </button>

        {customer && (
          <span className="text-green-600">📌 ลูกค้า: {customer.name}</span>
        )}
      </div>

      {formError && (
        <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded text-sm">
          ⚠️ {formError}
        </div>
      )}

      {pendingPhone && !customer?.id && (
        <div className="mt-2 text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-3 py-2 space-y-3">
          <p>📱 <strong>ไม่พบข้อมูลลูกค้าในระบบ</strong></p>
          <p>เบอร์: <strong>{phone}</strong> ถูกต้องใช่ไหม?</p>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <input type="text" placeholder="ชื่อ" value={name} onChange={(e) => setName(e.target.value)} className="border px-2 py-1 rounded" />
            <input type="text" placeholder="นามสกุล" value={lastName} onChange={(e) => setLastName(e.target.value)} className="border px-2 py-1 rounded" />
            <input type="email" placeholder="อีเมล (ถ้ามี)" value={email} onChange={(e) => setEmail(e.target.value)} className="border px-2 py-1 rounded col-span-2" />
            <textarea placeholder="ที่อยู่ (ถ้ามี)" value={address} onChange={(e) => setAddress(e.target.value)} className="border px-2 py-1 rounded col-span-2" />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={handleConfirmCreateCustomer}
              className="px-4 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              ➕ สร้างข้อมูลลูกค้าใหม่
            </button>
            <button
              onClick={handleCancelCreateCustomer}
              className="px-4 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              🔁 แก้ไขเบอร์โทร
            </button>
          </div>
        </div>
      )}

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
