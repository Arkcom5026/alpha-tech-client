// 📁 FILE: pages/pos/sales/QuickSalePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import InputMask from 'react-input-mask';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerStore from '@/features/customer/store/customerStore';

import SaleItemTable from '@/features/sales/components/SaleItemTable';

import PaymentForm from '@/features/payment/components/PaymentForm';
import { useNavigate } from 'react-router-dom';
import usePaymentStore from '@/features/payment/store/paymentStore';
import useStockItemStore from '@/features/stockItem/store/stockItemStore';

const translatePaymentMethod = (method) => {
  switch (method) {
    case 'CASH':
      return 'เงินสด';
    case 'TRANSFER':
      return 'โอนเงิน';
    case 'QR':
      return 'พร้อมเพย์ (QR)';
    case 'CREDIT':
      return 'บัตรเครดิต';
    case 'GOVERNMENT':
      return 'หน่วยงานราชการ';
    case 'OTHER':
      return 'อื่น ๆ';
    default:
      return method;
  }
};

const QuickSalePage = () => {
  const [isModified, setIsModified] = useState(false);

  const togglePaymentMethod = (method) => {
    const isGov = method === 'GOVERNMENT';
    const govSelected = paymentList.some((p) => p.method === 'GOVERNMENT');
    const otherSelected = paymentList.some((p) => ['CASH', 'TRANSFER', 'CREDIT'].includes(p.method));

    if (isGov) {
      if (govSelected) {
        usePaymentStore.setState({ paymentList: [] });
      } else {
        usePaymentStore.setState({ paymentList: [{ method: 'GOVERNMENT', amount: 0, note: '' }] });
      }
      return;
    }

    if (govSelected) {
      usePaymentStore.setState({ paymentList: [] });
    }

    const exists = paymentList.find((p) => p.method === method);
    if (exists) {
      usePaymentStore.setState({ paymentList: paymentList.filter((p) => p.method !== method) });
    } else {
      usePaymentStore.setState({ paymentList: [...paymentList.filter((p) => p.method !== 'GOVERNMENT'), { method, amount: 0, note: '' }] });
    }
  };
  const [showQR, setShowQR] = useState(false);

  const handleTransferKeyDown = (e) => {
    if (e.key === 'Enter') {
      const amt = parseFloat(e.target.value);
      if (amt && amt > 0) setShowQR(true);
    }
  };

  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [saleOption, setSaleOption] = useState('NONE');
  const [formError, setFormError] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [billDiscount, setBillDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [liveItems, setLiveItems] = useState([]);
  const [pendingPhone, setPendingPhone] = useState('');
  const phoneInputRef = useRef(null);
  const [confirmedSaleId, setConfirmedSaleId] = useState(null);
  const [originalCustomerData, setOriginalCustomerData] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  const [cardRef, setCardRef] = useState('');
  const [customerType, setCustomerType] = useState('บุคคลทั่วไป');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [slipImage, setSlipImage] = useState(null);
const [skipSlip, setSkipSlip] = useState(false);
  const [govImage, setGovImage] = useState(null);

  const {
    paymentList,
    setPaymentAmount,
    setPaymentNote,
    sumPaymentList,
    submitMultiPaymentAction,
  } = usePaymentStore();

  const {
    updateStockItemsToSoldAction,
  } = useStockItemStore();



  const handleCaptureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.readyState < 2) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/png');

    if (paymentList.some(p => p.method === 'TRANSFER')) {
      setSlipImage(imageData);
    }
    if (paymentList.some(p => p.method === 'GOVERNMENT')) {
      setGovImage(imageData);
    }
  };

  useEffect(() => {
    if (paymentList.some(p => p.method === 'TRANSFER' || p.method === 'GOVERNMENT')) {
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
  }, [paymentList]);

  const navigate = useNavigate();

  const {
    customer,
    searchCustomerByPhoneAction,
    createCustomerAction,
    updateCustomerAction,
    loading: customerLoading,
    error: customerError,
  } = useCustomerStore();

  const {
    saleItems,
    addSaleItemAction,
    removeSaleItemAction,
    confirmSaleOrderAction,
    searchStockItemAction,
    setCustomerIdAction,

  } = useSalesStore();

  const rawPhone = phone.replace(/-/g, '');

  const handleVerifyPhone = async () => {
    setOriginalCustomerData(null);
    setFormError('');
    if (!/^[0-9]{10}$/.test(rawPhone)) {
      setFormError('กรุณากรอกเบอร์โทรให้ครบ 10 หลัก');
      return;
    }
    const result = await searchCustomerByPhoneAction(rawPhone);
    console.log('-result- :  ', result);
    setPendingPhone(result?.id ? '' : rawPhone);
    if (result?.id) {
      const nameParts = (result.name || '').split(' ');
      setName(result.name || '');
      setEmail(result.email || '');
      setAddress(result.address || '');
      setOriginalCustomerData({
        name: result.name || '',
        email: result.email || '',
        address: result.address || ''
      });
    }
  };

  const handleConfirmCreateCustomer = async () => {
    if (!pendingPhone) return;
    const fullName = name || 'ลูกค้าทั่วไป';
    await createCustomerAction({ phone: pendingPhone, name: fullName, email: email || null, address: address || null });
    await handleVerifyPhone();
    setPendingPhone('');

  };

  const handleCancelCreateCustomer = () => {
    setPendingPhone(''); setPhone('');
  };

  const handleConfirmSale = async () => {
    if (customer?.id && originalCustomerData) {
      const isChanged =
        name !== originalCustomerData.name ||
        email !== originalCustomerData.email ||
        address !== originalCustomerData.address;

      if (isChanged) {
        setFormError('คุณได้แก้ไขข้อมูลลูกค้า แต่ยังไม่ได้กด "อัปเดตข้อมูล"');
        return;
      }
    }
    setFormError('');

    if (!customer?.id) {
      setFormError('กรุณายืนยันเบอร์ลูกค้าก่อนทำรายการขาย');
      return;
    }
    if (sumPaymentList() < finalPrice) {
      setFormError('ยอดที่รับยังไม่ครบตามยอดที่ต้องชำระ');
      return;
    }
    if (paymentList.some((p) => p.method === 'TRANSFER') && !slipImage && !skipSlip) {
    setFormError('กรุณาถ่ายภาพสลิปก่อนยืนยันการขาย หรือเลือกข้ามการแนบสลิป');
    return;
  }
    if (paymentList.some((p) => p.method === 'CREDIT') && (!cardRef || cardRef.length < 15)) {
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
      paymentMethod: paymentMethod,
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
      const cleanList = paymentList.map((p) => ({
        saleId: result.id,
        paymentMethod: p.method,
        amount: parseFloat(p.amount),
        note: p.note || '',
      }));

      const success = await submitMultiPaymentAction(cleanList);
      if (!success) {
        setFormError('เกิดข้อผิดพลาดในการบันทึกการชำระเงิน กรุณาลองใหม่');
        return;
      }

      // ✅ อัปเดตสถานะ stockItem หลังชำระเงินสำเร็จ
      await updateStockItemsToSoldAction(result.stockItemIds);


      setConfirmedSaleId(result.code);

      const paymentData = {
        saleId: result.id,
        paymentMethod: paymentList[0].method,
        amount: parseFloat(paymentList[0].amount),
        note: paymentList[0].note || '',
        sale: result,
      };

      if (saleOption === 'RECEIPT') {
        navigate('/pos/sales/bill/print-short/' + result.id, { state: { payment: paymentData } });
      } else if (saleOption === 'TAX_INVOICE') {
        navigate('/pos/sales/bill/print-full/' + result.id, { state: { payment: paymentData } });
      }
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
      setFormError(''); // ✅ ล้าง error เมื่อพบสินค้าใหม่
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
    if (originalCustomerData) {
      const changed =
        name !== originalCustomerData.name ||
        email !== originalCustomerData.email ||
        address !== originalCustomerData.address;
      setIsModified(changed);
    } else {
      setIsModified(false);
    }
  }, [name, email, address, originalCustomerData]);

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

  useEffect(() => {
    if (customer?.id) {
      setCustomerIdAction(customer.id);
    }
  }, [customer]);

  const isConfirmEnabled = (() => {
  if (!liveItems.length) return false;

  const cash = paymentList.find(p => p.method === 'CASH');
  const transfer = paymentList.find(p => p.method === 'TRANSFER');
  const credit = paymentList.find(p => p.method === 'CREDIT');
  const government = paymentList.find(p => p.method === 'GOVERNMENT');

  if (cash) return receivedAmount >= finalPrice;
  if (transfer) return !!slipImage || skipSlip;
  if (credit) return !!cardRef && cardRef.length >= 15;
  if (government) return true;

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


  const handleUpdateCustomer = async () => {
    if (!customer?.id) {
      setFormError('ไม่พบข้อมูลลูกค้า');
      return;
    }

    const updatedData = {
      name: name.trim(),
      email: email.trim(),
      address: address.trim(),
    };

    try {
      const result = await updateCustomerAction(customer.id, updatedData);
      if (result) {
        setOriginalCustomerData(updatedData);
        setFormError('');
      } else {
        setFormError('อัปเดตข้อมูลไม่สำเร็จ');
      }
    } catch (err) {
      console.error('❌ updateCustomerAction error:', err);
      setFormError('เกิดข้อผิดพลาดระหว่างการอัปเดต');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-md mx-auto">

      <h1 className="text-2xl font-bold text-center md:text-left mb-1">ขายสินค้า</h1>

        {/* เบอร์โทร + ตรวจสอบลูกค้า */}
        <h2 className="text-lg font-semibold text-gray-700">ข้อมูลลูกค้า</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <div className="w-full md:w-64">
            <InputMask mask="099-999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleVerifyPhone()}>
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


        </div>

        {formError && (
          <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded text-sm">⚠️ {formError}</div>
        )}

        {(pendingPhone || customer?.id) && (
          <div className="mt-2 text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-3 py-2 space-y-3">
            <p>📋 <strong>รายละเอียดลูกค้า</strong></p>
            {customer?.id ? null : <p>เบอร์: <strong>{phone}</strong> ถูกต้องใช่ไหม?</p>}

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทลูกค้า:</label>
                <div className="flex gap-4 text-sm">
                  <label>
                    <input
                      type="radio"
                      name="customerType"
                      value="บุคคลทั่วไป"
                      className="mr-1"
                      checked={customerType === 'บุคคลทั่วไป'}
                      onChange={() => setCustomerType('บุคคลทั่วไป')}
                    /> บุคคลทั่วไป
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="customerType"
                      value="นิติบุคคล"
                      className="mr-1"
                      checked={customerType === 'นิติบุคคล'}
                      onChange={() => setCustomerType('นิติบุคคล')}
                    /> นิติบุคคล
                  </label>
                </div>
              </div>
              {customerType === 'นิติบุคคล' && (
                <>
                  <input
                    type="text"
                    placeholder="ชื่อบริษัท / หน่วยงาน"
                    className="border px-2 py-1 rounded col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="เลขผู้เสียภาษี (ถ้ามี)"
                    className="border px-2 py-1 rounded col-span-2"
                  />
                </>
              )}
              <input type="text" placeholder="ชื่อ" value={name} onChange={(e) => setName(e.target.value)} className="border px-2 py-1 rounded" />

              <input type="email" placeholder="อีเมล (ถ้ามี)" value={email} onChange={(e) => setEmail(e.target.value)} className="border px-2 py-1 rounded col-span-2" />
              {!email && (
                <p className="text-xs text-gray-500 italic col-span-2">
                  * ลูกค้ารายนี้ยังไม่มีอีเมลในระบบ
                </p>
              )}
              <textarea placeholder="ที่อยู่ (ถ้ามี)" value={address} onChange={(e) => setAddress(e.target.value)} className="border px-2 py-1 rounded col-span-2" />
            </div>

            <div className="pt-2 flex gap-3">
              {customer?.id ? (
                <button
                  onClick={handleUpdateCustomer}
                  disabled={!isModified}
                  className={`px-4 py-1 text-white rounded hover:bg-blue-700 ${isModified ? 'bg-blue-500' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                  อัปเดตข้อมูล
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmCreateCustomer}
                    className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ➕ บันทึกลูกค้าใหม่
                  </button>
                  <button
                    onClick={handleCancelCreateCustomer}
                    className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    ยกเลิก
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      <h2 className="text-lg font-semibold text-gray-700 mt-6">รายการสินค้า</h2>
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="ยิงหรือกรอกรหัสบาร์โค้ดสินค้า"
          onKeyDown={handleBarcodeSearch}
          className="border rounded px-3 py-2 w-full md:w-96"
        />
      </div>
      {formError && (
        <div className="mt-2 text-red-600 text-sm">⚠️ {formError}</div>
      )}


      <SaleItemTable
        items={saleItems}
        onRemove={removeSaleItemAction}
        billDiscount={billDiscount}
        onChangeItems={setLiveItems}
      />


      <h2 className="text-lg font-semibold text-gray-700 mt-6">การชำระเงิน</h2>
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
                {['CASH', 'TRANSFER', 'CREDIT', 'GOVERNMENT'].map((method) => (
                  <label key={method} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={paymentList.some((p) => p.method === method)}
                      onChange={() => togglePaymentMethod(method)}
                      className="mr-2"
                    />
                    {translatePaymentMethod(method)}
                  </label>
                ))}
              </div>

            </div>


            {paymentList.some(p => p.method === 'CASH') && (
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ยอดที่รับ (เงินสด):</label>
                  <input
                    type="number"
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="0.00"
                    value={paymentList.find(p => p.method === 'CASH')?.amount || ''}
                    onChange={(e) => {
                      setPaymentAmount('CASH', e.target.value);
                      setReceivedAmount(parseFloat(e.target.value) || 0); // ✅ sync กับเงินทอน
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">เงินทอน:</label>
                  <div className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 text-right">
                    {changeAmount.toLocaleString()} ฿
                  </div>
                </div>
              </div>
            )}





            {paymentList.some(p => p.method === 'TRANSFER') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">ยอดที่โอน:</label>
                <input
                  type="number"
                  className="mt-1 mb-3 w-full border rounded px-3 py-2"
                  placeholder="0.00"
                  value={paymentList.find(p => p.method === 'TRANSFER')?.amount || ''}
                  onChange={(e) => setPaymentAmount('TRANSFER', e.target.value)}
                  onKeyDown={handleTransferKeyDown}
                />
              </div>
            )}




            {paymentList.some(p => p.method === 'TRANSFER') && showQR && (
              <div className="mt-4">
                <p className="mb-2 font-medium">QR พร้อมเพย์</p>
                <img
                  src={`https://promptpay.io/1234567890123/${paymentList.find(p => p.method === 'TRANSFER')?.amount || 0}`}
                  alt="QR PromptPay"
                  className="w-48 h-48 mx-auto"
                />

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
              </div>
            )}





            <div className="mt-2 text-sm text-gray-700">
  <label className="inline-flex items-center">
    <input type="checkbox" checked={skipSlip} onChange={() => setSkipSlip(!skipSlip)} className="mr-2" />
      ไม่ถ่ายภาพสลิป
  </label>
</div>

{/* ✅ Input reference number for credit card */}
            {paymentList.some(p => p.method === 'CREDIT') && (
              <div className="mt-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">ยอดบัตรเครดิต:</label>
                <input
                  type="number"
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="0.00"
                  value={paymentList.find(p => p.method === 'CREDIT')?.amount || ''}
                  onChange={(e) => setPaymentAmount('CREDIT', e.target.value)}
                />

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
                  <label className="block"><input type="radio" value="NONE" checked={saleOption === 'NONE'} onChange={(e) => setSaleOption(e.target.value)} className="mr-2" /> ไม่พิมพ์บิล</label>

                  <label className="block"><input type="radio" value="RECEIPT" checked={saleOption === 'RECEIPT'} onChange={(e) => setSaleOption(e.target.value)} className="mr-2" /> ใบกำกับภาษี อย่างย่อ</label>

                  <label className="block"><input type="radio" value="TAX_INVOICE" checked={saleOption === 'TAX_INVOICE'} onChange={(e) => setSaleOption(e.target.value)} className="mr-2" /> ใบกำกับภาษี เต็มรูป</label>

                </div>
              </div>

              {paymentList.some(p => p.method === 'GOVERNMENT') && renderGovernmentCapture()}

              <div className="text-right mt-4">
                <div className="text-gray-700 text-sm">ยอดรวมที่กรอก: {sumPaymentList().toLocaleString()} ฿</div>
                <div className="text-sm text-green-600">
                  {sumPaymentList() === finalPrice ? '✅ ยอดชำระตรงกับยอดขาย' : '⚠️ ยอดชำระยังไม่ตรง'}
                </div>
              </div>


              <div className="text-center pt-2">
                <button
                  onClick={handleConfirmSale}
                  disabled={!isConfirmEnabled || !liveItems.length || !customer?.id}
                  className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  ✅ ยืนยันการขาย
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













