




// 📁 FILE: src/features/sales/layout/QuickSaleLayout.jsx

import React, { useEffect, useRef, useState, useMemo } from 'react'
import useSalesStore from '@/features/sales/store/salesStore'
import useStockItemStore from '@/features/stockItem/store/stockItemStore'

import CustomerSection from '../components/CustomerSection'
import PaymentSection from '../components/PaymentSection'
import SaleItemTable from '../components/SaleItemTable'

const QuickSaleLayout = () => {
  const barcodeInputRef = useRef(null)
  const phoneInputRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPriceType, setSelectedPriceType] = useState('retail')
  const [clearPhoneTrigger, setClearPhoneTrigger] = useState(null)
  const [hideCustomerDetails, setHideCustomerDetails] = useState(false)

  // ✅ reset UI hiding when a new sale cycle starts (PaymentSection triggers clearPhoneTrigger)
  useEffect(() => {
    if (clearPhoneTrigger) setHideCustomerDetails(false)
  }, [clearPhoneTrigger])

  // 🔔 UI-based barcode error (no toast / no dialog)
  const [barcodeError, setBarcodeError] = useState('')

  // ✨ โหมดการขาย: CASH | CREDIT
  const [saleMode, setSaleMode] = useState('CASH')

  // 🧾 ตัวเลือกการพิมพ์บิลหลังยืนยันการขาย
  // NONE | RECEIPT | TAX_INVOICE | DELIVERY_NOTE
  const [saleOption, setSaleOption] = useState('NONE')

  const {
    saleItems,
    addSaleItemAction,
    removeSaleItemAction,
    confirmSaleOrderAction,
    sharedBillDiscountPerItem,
    billDiscount,
    error: saleError,
    clearErrorAction: clearSaleErrorAction,
  } = useSalesStore()

  const {
    searchStockItemAction,
    error: stockError,
    clearErrorAction: clearStockErrorAction,
  } = useStockItemStore()

  useEffect(() => {
    phoneInputRef.current?.focus()
  }, [])

  // ⚡ O(1) duplicate lookup (POS-grade performance)
  const saleItemKeySet = useMemo(() => {
    const s = new Set()
    ;(saleItems || []).forEach((it) => {
      const sid = it?.stockItemId
      const bc = it?.barcode
      if (sid != null) s.add(`SID:${String(sid)}`)
      if (bc) s.add(`BC:${String(bc).trim()}`)
    })
    return s
  }, [saleItems])

  // ✅ NOTE: การ reset หลังขาย ให้ PaymentSection เป็น owner เพียงจุดเดียว (กัน reset ซ้ำ)
  // QuickSaleLayout ควรทำแค่ “เปิดหน้าพิมพ์” และ “ปรับ UI เล็กน้อย” เท่านั้น

  const handleBarcodeSearch = async (e) => {
    clearSaleErrorAction?.()
    clearStockErrorAction?.()

    if (e.key !== 'Enter') return

    const barcode = e.target.value.trim()
    if (!barcode) return

    setBarcodeError('')

    try {
      const result = await searchStockItemAction(barcode)

      // ✅ แยกเคส: มีบาร์โค้ด แต่ไม่พร้อมขาย (เช่น SOLD/CLAIMED/LOST)
      if (result?.notSellable) {
        const status = result.status || 'UNKNOWN'

        if (status === 'SOLD') {
          setBarcodeError(`❌ บาร์โค้ด ${barcode} สินค้าชิ้นนี้ขายแล้ว`)
        } else {
          setBarcodeError(`❌ สินค้านี้ไม่พร้อมขาย (สถานะ: ${status})`)
        }

        e.target.value = ''
        barcodeInputRef.current?.focus()
        return
      }

      const foundItem = Array.isArray(result) ? result[0] : result

      if (!foundItem) {
        setBarcodeError('❌ ไม่พบบาร์โค้ดนี้ในระบบ')
        e.target.value = ''
        barcodeInputRef.current?.focus()
        return
      }

      // 🔒 Safety: เผื่อ backend คืน item ที่มี status ไม่พร้อมขายมาในอนาคต
      const status = foundItem.status || foundItem.stockItem?.status
      if (status && status !== 'IN_STOCK') {
        if (status === 'SOLD') {
          setBarcodeError(`❌ บาร์โค้ด ${barcode} สินค้าชิ้นนี้ขายแล้ว`)
        } else {
          setBarcodeError(`❌ สินค้านี้ไม่พร้อมขาย (สถานะ: ${status})`)
        }

        e.target.value = ''
        barcodeInputRef.current?.focus()
        return
      }

      const duplicated = saleItemKeySet.has(`SID:${String(foundItem.id)}`) || (foundItem.barcode && saleItemKeySet.has(`BC:${String(foundItem.barcode).trim()}`))
      if (duplicated) {
        setBarcodeError('⚠️ บาร์โค้ดนี้ถูกเพิ่มในรายการขายแล้ว')
        e.target.value = ''
        barcodeInputRef.current?.focus()
        return
      }

      const preparedItem = {
        // ✅ FE pricing baseline (VAT included)
        // - price         = ราคาตั้งต้นก่อนลด/บวกเพิ่ม (ใช้เป็น canonical base price ในตะกร้า)
        // - discount      = ส่วนลดสุทธิระดับรายการ
        //                   ค่าบวก = ลดราคา / ค่าลบ = บวกเพิ่มราคา
        // - sellingPrice  = ราคาที่แสดง/แก้ไขใน UI (เริ่มต้นเท่ากับ price)
        // - originalPrice = ราคาอ้างอิงจาก price type ที่เลือกตอนสแกนเข้า
        // หมายเหตุ: รอบนี้ยังไม่เปลี่ยน flow การแก้ราคาในไฟล์นี้ เพียงล็อก baseline ให้ชัดก่อน
        stockItemId: foundItem.id,
        barcode: foundItem.barcode,
        productName: foundItem.product?.name || '',
        model: foundItem.product?.model || '',
        price: foundItem.prices?.[selectedPriceType] || 0,
        originalPrice: foundItem.prices?.[selectedPriceType] || 0,
        sellingPrice: foundItem.prices?.[selectedPriceType] || 0,
        discount: 0,
        discountWithoutBill: 0,
        billShare: 0,
      }

      addSaleItemAction(preparedItem)
      e.target.value = ''
      barcodeInputRef.current?.focus()
    } catch {
      setBarcodeError('❌ ระบบค้นหาสินค้าขัดข้อง กรุณาลองใหม่')
      e.target.value = ''
      barcodeInputRef.current?.focus()
    }
  }

  const handleConfirmSale = async (opts = {}) => {
    // ✅ PaymentSection เป็นคนคุม flow (confirm -> pay -> onSaleConfirmed)
    // หน้าที่: “ยืนยันการขาย” และส่ง saleId กลับไปเท่านั้น
    clearSaleErrorAction?.()

    if (saleItems.length === 0 || isSubmitting) return { error: 'ยังไม่มีรายการสินค้า' }

    try {
      setIsSubmitting(true)

      const res = await confirmSaleOrderAction(saleMode, opts)
      if (res?.error) return res

      const saleId = res?.saleId
      return { saleId, data: res?.data }
    } catch (err) {
      return { error: err?.message || 'ยืนยันการขายล้มเหลว' }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 🔒 กันการเปิดหน้าพิมพ์ซ้ำ (POS มักเจอ double-trigger จาก enter/double click)
  const lastPrintKeyRef = useRef('')

  const handleSaleConfirmed = (saleId, option) => {
    // ✅ basePath guard: รองรับ route ที่ถูก mount ใต้ /app
    const basePath = window.location.pathname.startsWith('/app') ? '/app' : ''

    const finalOption = option || saleOption

    // ✅ เปิดหน้า print ตามตัวเลือกที่ผู้ใช้เลือก (ใช้ route เดียวกับ “พิมพ์บิลย้อนหลัง”)
    if (saleId && finalOption && finalOption !== 'NONE') {
      const printKey = `${String(saleId)}::${String(finalOption)}`
      if (lastPrintKeyRef.current === printKey) {
        // ป้องกันการเปิดซ้ำ
        return
      }

      let printUrl = ''

      if (finalOption === 'RECEIPT') {
        printUrl = `${basePath}/pos/sales/bill/print-short/${saleId}`
      } else if (finalOption === 'TAX_INVOICE') {
        printUrl = `${basePath}/pos/sales/bill/print-full/${saleId}`
      } else if (finalOption === 'DELIVERY_NOTE') {
        // TODO: ใส่ route จริงของใบส่งของเมื่อพร้อม
        // ตอนนี้กัน UX ว่าง ๆ ไว้ก่อน
        setBarcodeError('ℹ️ ใบส่งของยังไม่พร้อมใช้งานในเวอร์ชันนี้')
        printUrl = ''
      }

      if (printUrl) {
        lastPrintKeyRef.current = printKey
        window.open(printUrl, '_blank', 'noopener,noreferrer')
      }
    }

    // ✅ UI reset เล็กน้อยเท่านั้น (ตัว reset หลักอยู่ใน PaymentSection)
    // ไม่ล้างข้อมูลหลักซ้ำซ้อน (PaymentSection เป็น owner)
    setTimeout(() => {
      setHideCustomerDetails(true)
    }, 200)
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 lg:col-span-4">
          <CustomerSection
            phoneInputRef={phoneInputRef}
            productSearchRef={barcodeInputRef}
            clearTrigger={clearPhoneTrigger}
            onClearFinish={() => setClearPhoneTrigger(null)}
            key={clearPhoneTrigger}
            hideCustomerDetails={hideCustomerDetails}
            onSaleModeSelect={setSaleMode}
          />
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white p-4">
            <h2 className="text-lg font-bold text-gray-800">เลือกราคาขาย:</h2>
            <div className="mb-2 flex gap-4 min-w-[1100px]">
              <label className="flex items-center space-x-2 text-gray-700">
                <input
                  type="radio"
                  value="wholesale"
                  checked={selectedPriceType === 'wholesale'}
                  onChange={(e) => setSelectedPriceType(e.target.value)}
                  className="form-radio text-blue-600"
                />
                <span>ราคาส่ง</span>
              </label>
              <label className="flex items-center space-x-2 text-gray-700">
                <input
                  type="radio"
                  value="technician"
                  checked={selectedPriceType === 'technician'}
                  onChange={(e) => setSelectedPriceType(e.target.value)}
                  className="form-radio text-blue-600"
                />
                <span>ราคาช่าง</span>
              </label>
              <label className="flex items-center space-x-2 text-gray-700">
                <input
                  type="radio"
                  value="retail"
                  checked={selectedPriceType === 'retail'}
                  onChange={(e) => setSelectedPriceType(e.target.value)}
                  className="form-radio text-blue-600"
                />
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

            {(barcodeError || saleError || stockError) && (
              <div
                className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-red-700"
                aria-live="assertive"
              >
                {barcodeError || saleError || stockError}
              </div>
            )}
          </div>

          <div className="bg-white p-4 min-h-[400px]">
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

      <div className="col-span-12 py-4">
        <PaymentSection
          saleItems={saleItems}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          onSaleConfirmed={handleSaleConfirmed}
          setClearPhoneTrigger={setClearPhoneTrigger}
          currentSaleMode={saleMode}
          onSaleModeChange={setSaleMode}
          saleOption={saleOption}
          onSaleOptionChange={setSaleOption}
          onConfirmSale={handleConfirmSale}
        />
      </div>
    </>
  )
}

export default QuickSaleLayout













