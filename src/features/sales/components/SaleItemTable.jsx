

// 📁 FILE: components/SaleItemTable.jsx

import React, { useEffect } from 'react'
import useSalesStore from '@/features/sales/store/salesStore'

const SaleItemTable = ({ items = [], onRemove, billDiscount = 0 }) => {
  const {
    sharedBillDiscountPerItem, // ใช้สำหรับแสดงผล “เฉลี่ยต่อรายการ” เท่านั้น
    setSharedBillDiscountPerItemAction,
    updateSaleItemAction,
  } = useSalesStore()

  // helper: ป้องกัน NaN/รูปแบบเงิน
  const toNumber = (raw) => {
    if (raw === '' || raw === null || raw === undefined) return 0
    const n = Number(String(raw).replace(/,/g, ''))
    return Number.isFinite(n) ? n : 0
  }

  // ✅ กระจาย “ลดท้ายบิล” ให้ผลรวมเท่ากับ billDiscount เสมอ (กัน rounding drift)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!Array.isArray(items) || items.length === 0) {
        if (sharedBillDiscountPerItem !== 0) setSharedBillDiscountPerItemAction(0)
        return
      }

      const totalPrice = items.reduce(
        (sum, item) => sum + (typeof item.price === 'number' ? item.price : 0),
        0
      )

      const totalPriceSatang = Math.round(totalPrice * 100)
      const totalDiscSatang = billDiscount > 0 ? Math.round(billDiscount * 100) : 0

      // ไม่มีส่วนลดท้ายบิล → เคลียร์ billShare เป็น 0 (ไม่ยุ่ง discountWithoutBill)
      if (totalPriceSatang <= 0 || totalDiscSatang <= 0) {
        items.forEach((item) => {
          if ((item.billShare || 0) !== 0) {
            const currentDiscountWithoutBill = item.discountWithoutBill || 0
            updateSaleItemAction(item.stockItemId, {
              billShare: 0,
              discount: currentDiscountWithoutBill,
            })
          }
        })

        if (sharedBillDiscountPerItem !== 0) setSharedBillDiscountPerItemAction(0)
        return
      }

      // สร้างแถวคำนวณในหน่วยสตางค์ แล้วแจก remainder ให้เศษมากสุดก่อน
      const rows = items.map((item) => {
        const price = typeof item.price === 'number' ? item.price : 0
        const priceSatang = Math.max(0, Math.round(price * 100))
        const raw = (totalDiscSatang * priceSatang) / totalPriceSatang
        const flo = Math.floor(raw)
        const frac = raw - flo
        return { item, flo, frac }
      })

      let used = rows.reduce((sum, r) => sum + r.flo, 0)
      let remain = Math.max(0, totalDiscSatang - used)

      rows.sort((a, b) => b.frac - a.frac)
      for (let i = 0; i < rows.length && remain > 0; i += 1) {
        rows[i].flo += 1
        remain -= 1
      }

      rows.forEach((r) => {
        const calculatedBillShare = r.flo / 100
        const currentDiscountWithoutBill = r.item.discountWithoutBill || 0
        const newTotalDiscount = currentDiscountWithoutBill + calculatedBillShare

        if (
          (r.item.billShare || 0) !== calculatedBillShare ||
          (r.item.discount || 0) !== newTotalDiscount
        ) {
          updateSaleItemAction(r.item.stockItemId, {
            billShare: calculatedBillShare,
            discount: newTotalDiscount,
          })
        }
      })

      // display only: เฉลี่ยต่อรายการ (2 ตำแหน่ง)
      const avg = Math.floor((billDiscount / items.length) * 100) / 100
      if (sharedBillDiscountPerItem !== avg) setSharedBillDiscountPerItemAction(avg)
    }, 100)

    return () => clearTimeout(handler)
  }, [
    billDiscount,
    items,
    updateSaleItemAction,
    setSharedBillDiscountPerItemAction,
    sharedBillDiscountPerItem,
  ])

  const handleDiscountChange = (itemId, input) => {
    // รองรับทั้ง event และ number
    const raw = typeof input === 'number' ? input : input?.target?.value
    const newDiscountWithoutBill = toNumber(raw)

    const itemToUpdate = items.find((item) => item.stockItemId === itemId)
    if (!itemToUpdate) return

    const billShare = itemToUpdate.billShare || 0
    const newTotalDiscount = newDiscountWithoutBill + billShare

    updateSaleItemAction(itemId, {
      discountWithoutBill: newDiscountWithoutBill,
      discount: newTotalDiscount,
    })
  }

  const handleSellingPriceChange = (itemId, input) => {
    const raw = typeof input === 'number' ? input : input?.target?.value
    const newSellingPrice = Math.max(0, toNumber(raw))

    const itemToUpdate = items.find((item) => item.stockItemId === itemId)
    if (!itemToUpdate) return

    const basePrice = typeof itemToUpdate.price === 'number' ? itemToUpdate.price : 0
    const billShare = itemToUpdate.billShare || 0

    // ✅ VAT-included pricing baseline
    // discountWithoutBill = basePrice - sellingPrice
    // ค่าบวก = ลดราคา / ค่าลบ = บวกเพิ่มราคา
    const nextDiscountWithoutBill = Number((basePrice - newSellingPrice).toFixed(2))
    const nextTotalDiscount = Number((nextDiscountWithoutBill + billShare).toFixed(2))

    updateSaleItemAction(itemId, {
      sellingPrice: newSellingPrice,
      discountWithoutBill: nextDiscountWithoutBill,
      discount: nextTotalDiscount,
    })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <table className="w-full text-left border">
        <thead className="bg-gray-100 text-center">
          <tr>
            <th className="p-2 border">ลำดับ</th>
            <th className="p-2 border">ชื่อสินค้า</th>
            <th className="p-2 border">รุ่น</th>
            <th className="p-2 border">บาร์โค้ด</th>
            <th className="p-2 border">ราคา</th>
            <th className="p-2 border">ขายจริง</th>
            <th className="p-2 border">ส่วนลด</th>
            <th className="p-2 border">ลดท้ายบิล</th>
            <th className="p-2 border">สุทธิ</th>
            <th className="p-2 border">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="10" className="p-4 text-center text-gray-500">
              ยังไม่มีสินค้าที่จะขาย
            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  return (
    <table className="w-full text-left border">
      <thead className="bg-gray-100 text-center">
        <tr>
          <th className="p-2 border w-12">ลำดับ</th>
          <th className="p-2 border w-[200px]">ชื่อสินค้า</th>
          <th className="p-2 border w-[140px]">รุ่น</th>
          <th className="p-2 border w-[100px]">บาร์โค้ด</th>
          <th className="p-2 border w-24">ราคา</th>
          <th className="p-2 border w-24">ขายจริง</th>
          <th className="p-2 border w-24">ส่วนลด</th>
          <th className="p-2 border w-24">ลดท้ายบิล</th>
          <th className="p-2 border w-24">สุทธิ</th>
          <th className="p-2 border w-20">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const discount = item.discount || 0
          const discountWithoutBill = item.discountWithoutBill || 0
          const billShare = item.billShare || 0
          const safePrice = typeof item.price === 'number' ? item.price : 0
          const sellingPrice =
            typeof item.sellingPrice === 'number'
              ? item.sellingPrice
              : Math.max(0, safePrice - discountWithoutBill)
          const net = Math.max(0, safePrice - discount)

          return (
            <tr key={item.stockItemId}>
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{item.productName}</td>
              <td className="p-2 border">{item.model}</td>
              <td className="p-2 border text-center">{item.barcode}</td>
              <td className="p-2 border text-right">{safePrice.toFixed(2)}</td>
              <td className="p-2 border text-right">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  step="0.01"
                  className="w-24 py-0 border rounded text-right"
                  placeholder="0.00"
                  value={sellingPrice === 0 ? '' : sellingPrice}
                  onChange={(e) => handleSellingPriceChange(item.stockItemId, e)}
                />
              </td>
              <td className="p-2 border text-right">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  className="w-20 py-0 border rounded text-right"
                  placeholder="0.00"
                  value={discountWithoutBill === 0 ? '' : discountWithoutBill}
                  onChange={(e) => handleDiscountChange(item.stockItemId, e)}
                />
              </td>
              <td className="p-2 border text-right">
                {billShare.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="p-2 border text-right">
                {net.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="p-2 border text-center">
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => onRemove(item.stockItemId)}
                >
                  ลบ
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default SaleItemTable




