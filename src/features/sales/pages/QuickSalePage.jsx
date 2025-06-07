// 📁 FILE: pages/pos/sales/QuickSalePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import InputMask from 'react-input-mask';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerStore from '@/features/customer/store/customerStore';
import SaleItemTable from '@/features/sales/components/SaleItemTable';
import PaymentForm from '@/features/payment/components/PaymentForm';
import { useNavigate } from 'react-router-dom';

const QuickSalePage = () => {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [saleOption, setSaleOption] = useState('NONE');
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
  const [confirmedSaleId, setConfirmedSaleId] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  const [cardRef, setCardRef] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [slipImage, setSlipImage] = useState(null);
  const [govImage, setGovImage] = useState(null);

  const handleCaptureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/png');
    if (paymentMethod === 'TRANSFER') setSlipImage(imageData);
    if (paymentMethod === 'GOVERNMENT') setGovImage(imageData);
  };

  useEffect(() => {
    if (paymentMethod === 'TRANSFER' || paymentMethod === 'GOVERNMENT') {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const videoConstraints = isMobile ? { facingMode: 'environment' } : true;

      navigator.mediaDevices.getUserMedia({ video: videoConstraints })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.error('Camera access error:', err);
        });
    }
  }, [paymentMethod]);

  const navigate = useNavigate();

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
    setPendingPhone(result?.id ? '' : rawPhone);
  };

  const handleConfirmCreateCustomer = async () => {
    if (!pendingPhone) return;
    const fullName = `${name || 'ลูกค้าทั่วไป'}${lastName ? ' ' + lastName : ''}`;
    await createCustomerAction({ phone: pendingPhone, name: fullName, email: email || null, address: address || null });
    await handleVerifyPhone();
    setPendingPhone('');
    setName(''); setLastName(''); setEmail(''); setAddress('');
  };

  const handleCancelCreateCustomer = () => {
    setPendingPhone(''); setPhone('');
  };

  const handleConfirmSale = async () => {
    setFormError('');
    if (!customer?.id) {
      setFormError('กรุณายืนยันเบอร์ลูกค้าก่อนทำรายการขาย');
      return;
    }
    if (paymentMethod === 'CASH' && receivedAmount < finalPrice) {
      setFormError('ยอดที่รับต้องมากกว่าหรือเท่ากับยอดที่ต้องชำระ');
      return;
    }
    if (paymentMethod === 'TRANSFER' && !slipImage) {
      setFormError('กรุณาถ่ายภาพสลิปก่อนยืนยันการขาย');
      return;
    }
    if (paymentMethod === 'CREDIT' && (!cardRef || cardRef.length < 15)) {
      setFormError('กรุณากรอกเลขอ้างอิงการชำระเงินด้วยบัตรเครดิต (อย่างน้อย 15 หลัก)');
      return;
    }
    const payload = {
      customerId: customer.id,
      totalBeforeDiscount: totalOriginalPrice,
      totalDiscount,
      vat: vatAmount,
      vatRate: 7,
      totalAmount: finalPrice,
      paymentMethod,
      paymentDetails: paymentMethod === 'CREDIT' ? { cardRef } : null,
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
    const result = await confirmSaleOrderAction(payload);
    if (result?.error) {
      setFormError(result.error);
      return;
    }
    if (result?.code) {
      setConfirmedSaleId(result.code);
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
    const price = liveItems.reduce((sum, item) => sum + Math.max(0, item.price - (item.discount || 0) - (item.billShare || 0)), 0);
    setFinalPrice(price);
  }, [liveItems]);

  useEffect(() => {
    setChangeAmount(Math.max(0, receivedAmount - finalPrice));
  }, [receivedAmount, finalPrice]);

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

  const isConfirmEnabled = (() => {
    if (!liveItems.length) return false;
    if (paymentMethod === 'CASH') return receivedAmount >= finalPrice;
    if (paymentMethod === 'TRANSFER') return !!slipImage;
    if (paymentMethod === 'CREDIT') return !!cardRef && cardRef.length >= 15;
    if (paymentMethod === 'GOVERNMENT') return true; // ✅ อนุญาตให้กดยืนยันได้แม้ไม่มีภาพถ่าย
    return false;
  })();

  const renderGovernmentCapture = () => (
    <div className="pt-4 space-y-4 border p-4 rounded bg-white shadow">
      <h3 className="font-semibold text-gray-700 mb-2">📸 ถ่ายภาพผู้แทนหน่วยงาน</h3>
      {!govImage ? (
        <div className="flex flex-col items-start gap-2">
          <video ref={videoRef} className="w-64 h-48 border rounded bg-black object-cover" />
          <button
            onClick={handleCaptureImage}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >📷 ถ่ายภาพ</button>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <img src={govImage} alt="ตัวแทนหน่วยงาน" className="w-64 h-48 border rounded object-cover" />
          <button
            onClick={() => setGovImage(null)}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >🔁 ถ่ายใหม่</button>
        </div>
      )
      }
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-md mx-auto">
      
      <h1 className="text-xl font-bold text-center md:text-left">ขายสินค้า (Quick Sale)</h1>

      {/* เบอร์โทร + ตรวจสอบลูกค้า */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
        <div className="w-full md:w-64">
          <InputMask mask="099-999-9999" value={phone} onChange={(e) => setPhone(e.target.value)}>
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
        </div>

        <button
          onClick={handleVerifyPhone}
          disabled={customerLoading || !/^[0-9]{10}$/.test(rawPhone)}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {customerLoading ? 'กำลังตรวจสอบ...' : 'ยืนยันเบอร์ลูกค้า'}
        </button>

        {customer && <span className="text-green-600">📌 ลูกค้า: {customer.name}</span>}
      </div>

      {formError && (
        <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded text-sm">⚠️ {formError}</div>
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
            <button onClick={handleConfirmCreateCustomer} className="px-4 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700">➕ สร้างข้อมูลลูกค้าใหม่</button>
            <button onClick={handleCancelCreateCustomer} className="px-4 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">🔁 แก้ไขเบอร์โทร</button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="bg-gray-50 border rounded shadow-sm p-4 space-y-3 text-base">
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
            <input type="number" min="0" value={billDiscount} onChange={(e) => setBillDiscount(parseFloat(e.target.value) || 0)} className="w-20 px-2 py-1 border rounded text-right font-medium" />
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
        </div>

        <div className="bg-gray-50 border rounded shadow-sm p-4 space-y-6">


          <div className="space-y-4">
            <div>
            <div className="text-sm text-left flex flex-wrap gap-4">
                <label className="inline-flex items-center">
                  <input type="radio" name="paymentMethod" value="CASH" className="mr-2" checked={paymentMethod === 'CASH'} onChange={(e) => setPaymentMethod(e.target.value)} /> เงินสด
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="paymentMethod" value="TRANSFER" className="mr-2" checked={paymentMethod === 'TRANSFER'} onChange={(e) => setPaymentMethod(e.target.value)} /> โอน
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="paymentMethod" value="CREDIT" className="mr-2" checked={paymentMethod === 'CREDIT'} onChange={(e) => setPaymentMethod(e.target.value)} /> บัตรเครดิต   
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="paymentMethod" value="GOVERNMENT" className="mr-2" checked={paymentMethod === 'GOVERNMENT'} onChange={(e) => setPaymentMethod(e.target.value)} /> เครดิต
                </label>
              </div>

            </div>
            {paymentMethod === 'CASH' && (<div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">ยอดที่รับ:</label>
                <input type="number" className="mt-1 w-full border rounded px-3 py-2" placeholder="0.00" value={receivedAmount} onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">เงินทอน:</label>
                <input type="text" className="mt-1 w-full border rounded px-3 py-2 bg-gray-100" value={changeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} readOnly />
              </div>
            </div>)}

            {paymentMethod === 'TRANSFER' && !slipImage && (
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">📱 QR สำหรับโอนเงิน</label>
                <img src={`https://promptpay.io/1234567890123/${finalPrice.toFixed(2)}`} alt="QR PromptPay" className="w-48 h-48 border rounded" />
                <p className="text-sm text-gray-600 mt-1">กรุณาสแกนด้วยแอปธนาคารเพื่อโอนเข้าบัญชีบริษัท</p>
              </div>
            )}


            {paymentMethod === 'TRANSFER' && (
              <div className="pt-4 space-y-4 border p-4 rounded bg-white shadow">
                <h3 className="font-semibold text-gray-700 mb-2">📸 ถ่ายภาพสลิปจากกล้อง</h3>

                {!slipImage ? (
                  <div className="flex flex-col items-start gap-2">
                    <video ref={videoRef} className="w-64 h-48 border rounded bg-black object-cover" />
                    <button
                      onClick={handleCaptureImage}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >📷 ถ่ายภาพ</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-2">
                    <img src={slipImage} alt="Captured slip" className="w-64 h-48 border rounded object-cover" />
                    <button
                      onClick={() => setSlipImage(null)}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >🔁 ถ่ายใหม่</button>
                  </div>
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            )}



            {/* ✅ Input reference number for credit card */}
            {paymentMethod === 'CREDIT' && (
              <div className="mt-2">
                <label className="text-sm">เลขอ้างอิงบัตรเครดิต:</label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  className="border rounded p-1 w-full mt-1"
                  placeholder="กรอกเลขอ้างอิงจากเครื่องรูดบัตร"
                  maxLength={24}
                />
              </div>
            )}
            <div className="space-y-4">
              <div className="text-sm text-left space-y-2">
                <div className="pl-3 space-y-1">
                  <label className="inline-flex items-center mr-4"><input type="radio" value="NONE" checked={saleOption === 'NONE'} onChange={(e) => setSaleOption(e.target.value)} className="mr-2" /> 🚫 ไม่พิมพ์บิล</label>
                  <label className="inline-flex items-center"><input type="radio" value="RECEIPT" checked={saleOption === 'RECEIPT'} onChange={(e) => setSaleOption(e.target.value)} className="mr-2" /> ✅ พิมพ์บิล</label>
                  <label className="block"><input type="radio" value="TAX_INVOICE" checked={saleOption === 'TAX_INVOICE'} onChange={(e) => setSaleOption(e.target.value)} className="mr-2" /> 🧾 ขอใบกำกับภาษี</label>
                 
                </div>
              </div>

              {paymentMethod === 'GOVERNMENT' && renderGovernmentCapture()}

              <div className="text-center pt-2">
                <button
                  onClick={handleConfirmSale}
                  disabled={!isConfirmEnabled}
                  className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {paymentMethod === 'GOVERNMENT' ? '📄 บันทึกรายการ' : '✅ ยืนยันการขาย'}
                </button>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSalePage;


