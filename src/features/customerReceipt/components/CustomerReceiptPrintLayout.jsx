import React from 'react'

import {
  buildCustomerReceiptBranchAddress,
  buildCustomerReceiptCustomerAddress,
  buildCustomerReceiptCustomerName,
  buildCustomerReceiptLineItems,
  formatCustomerReceiptCurrency,
  formatCustomerReceiptDate,
  getCustomerReceiptVatSummary,
} from '../utils/customerReceiptDocumentMapper'

const round2 = (value) => Number((Number(value || 0)).toFixed(2))

const buildStructuredBranchAddress = (branch, fallbackAddress = '-') => {
  const subdistrict = branch?.subdistrict || null
  const district = subdistrict?.district || null
  const province = district?.province || null

  const structuredAddress = [
    branch?.address,
    subdistrict?.nameTh ? `ต.${subdistrict.nameTh}` : null,
    district?.nameTh ? `อ.${district.nameTh}` : null,
    province?.nameTh ? `จ.${province.nameTh}` : null,
    subdistrict?.postcode,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  if (structuredAddress) return structuredAddress

  const mappedAddress = buildCustomerReceiptBranchAddress(branch)
  if (typeof mappedAddress === 'string' && mappedAddress.trim() && mappedAddress.trim() !== '-') {
    return mappedAddress.trim()
  }

  const fallback = typeof fallbackAddress === 'string' ? fallbackAddress.trim() : ''
  return fallback || '-'
}

const bahtText = (amount) => {
  const number = Number(amount)
  if (!Number.isFinite(number)) return 'ศูนย์บาทถ้วน'

  const fixed = round2(number)
  const absolute = Math.abs(fixed)
  const baht = Math.floor(absolute)
  const satang = Math.round((absolute - baht) * 100)
  const digits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน']

  const readUnderMillion = (value) => {
    if (!value) return ''

    const text = String(value).padStart(6, '0')
    let result = ''

    for (let index = 0; index < 6; index += 1) {
      const digit = Number(text[index])
      const position = 5 - index
      if (digit === 0) continue

      if (position === 1) {
        if (digit === 1) result += 'สิบ'
        else if (digit === 2) result += 'ยี่สิบ'
        else result += `${digits[digit]}สิบ`
      } else if (position === 0) {
        if (digit === 1 && value > 1 && Number(text[4]) !== 0) result += 'เอ็ด'
        else result += digits[digit]
      } else {
        result += `${digits[digit]}${units[position]}`
      }
    }

    return result
  }

  const readNumber = (value) => {
    if (value === 0) return 'ศูนย์'

    let remaining = value
    let result = ''
    let firstChunk = true

    while (remaining > 0) {
      const chunk = remaining % 1_000_000
      if (chunk) {
        const chunkText = readUnderMillion(chunk)
        result = firstChunk ? chunkText + result : `${chunkText}ล้าน${result}`
      }
      remaining = Math.floor(remaining / 1_000_000)
      firstChunk = false
    }

    return result
  }

  const sign = fixed < 0 ? 'ลบ' : ''
  const bahtPart = `${sign}${readNumber(baht)}บาท`
  const satangPart = satang === 0 ? 'ถ้วน' : `${readNumber(satang)}สตางค์`
  return bahtPart + satangPart
}

const CustomerReceiptPrintLayout = ({ receipt, config = null }) => {
  const customer = receipt?.customer || null
  const branch = receipt?.branch || null
  const allocations = Array.isArray(receipt?.allocations) ? receipt.allocations : []
  const lineItems = buildCustomerReceiptLineItems(allocations)
  const { total, vatRate, vatAmount, beforeVat } = getCustomerReceiptVatSummary(receipt)
  const emptyRowCount = Math.max(20 - lineItems.length, 0)

  const branchName = config?.branchName || branch?.name || branch?.branchName || '-'
  const branchAddress = buildStructuredBranchAddress(branch, config?.address)
  const branchPhone = config?.phone || branch?.phone || '-'
  const branchTaxId = config?.taxId || branch?.taxId || '-'
  const branchLogoUrl = config?.logoUrl || branch?.receiptConfig?.logoUrl || null

  return (
    <>
      <style>{`
        @media print {
          .customer-receipt-full-root {
            width: 210mm !important;
            min-height: 297mm !important;
            height: auto !important;
          }

          .customer-receipt-no-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .customer-receipt-full-root table {
            page-break-inside: auto;
          }

          .customer-receipt-full-root tr,
          .customer-receipt-full-root td,
          .customer-receipt-full-root th {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      <div
        className="customer-receipt-full-root mx-auto flex w-full flex-col overflow-hidden rounded-md border border-gray-600 bg-white px-5 pb-3 pt-4 text-sm text-black"
        style={{ width: '210mm', minHeight: '297mm', height: 'auto', fontFamily: 'Tahoma, Arial, sans-serif' }}
      >
        <div className="customer-receipt-no-break mb-2 flex items-start justify-between gap-3 border-b pb-2">
          <div className="flex items-start gap-3">
            {branchLogoUrl ? (
              <img src={branchLogoUrl} alt="logo" className="h-16 w-16 object-contain print:mt-1" />
            ) : null}
            <div>
              <h2 className="text-[16px] font-bold leading-tight">{branchName}</h2>
              <p>ที่อยู่: {branchAddress}</p>
              <p>โทร: {branchPhone}</p>
              <p>เลขประจำตัวผู้เสียภาษี: {branchTaxId}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="rounded-md border border-gray-400 px-3 py-2 text-[13px] font-bold leading-tight">
              ต้นฉบับลูกค้า
              <br />
              CUSTOMER ORIGINAL
            </p>
          </div>
        </div>

        <h1 className="mb-4 text-center text-[20px] font-bold leading-tight underline">
          ใบเสร็จรับเงินลูกหนี้
          <br />
          CUSTOMER RECEIPT
        </h1>

        <div className="customer-receipt-no-break mb-4 grid grid-cols-[2.8fr_1.7fr] gap-4 text-[15px]">
          <div className="space-y-1.5 rounded-lg border border-black p-3 leading-tight">
            <p>ลูกค้า: {buildCustomerReceiptCustomerName(customer)}</p>
            <p>ที่อยู่: {buildCustomerReceiptCustomerAddress(customer)}</p>
            <p>โทร: {customer?.user?.loginId || customer?.phone || customer?.phoneNumber || '-'}</p>
            <p>เลขประจำตัวผู้เสียภาษี: {customer?.taxId || customer?.taxNo || '-'}</p>
          </div>

          <div className="space-y-1.5 rounded-lg border border-black p-3 leading-tight">
            <p>วันที่: {formatCustomerReceiptDate(receipt?.receivedAt || receipt?.createdAt)}</p>
            <p>เลขที่: {receipt?.code || '-'}</p>
            <p>วิธีรับชำระ: {receipt?.paymentMethod || '-'}</p>
          </div>
        </div>

        <table className="mb-3 w-full table-fixed border border-black text-xs">
          <thead className="bg-gray-100">
            <tr className="border-b border-black">
              <th className="h-[28px] w-[7%] border border-black px-1 leading-tight">ลำดับ<br />ITEM</th>
              <th className="h-[28px] w-[18%] border border-black px-2 leading-tight">เลขที่บิล<br />BILL NO.</th>
              <th className="h-[28px] w-[31%] border border-black px-2 leading-tight">รายการ<br />DESCRIPTION</th>
              <th className="h-[28px] w-[9%] border border-black px-1 leading-tight">จำนวน<br />QTY</th>
              <th className="h-[28px] w-[8%] border border-black px-1 leading-tight">หน่วย<br />UNIT</th>
              <th className="h-[28px] w-[13.5%] border border-black px-2 text-right leading-tight">ราคาต่อหน่วย<br />UNIT PRICE</th>
              <th className="h-[28px] w-[13.5%] border border-black px-2 text-right leading-tight">จำนวนเงิน<br />AMOUNT</th>
            </tr>
          </thead>

          <tbody>
            {lineItems.map((item, index) => (
              <tr key={item.key || index}>
                <td className="h-[28px] border border-black px-1 text-center align-top">{index + 1}</td>
                <td className="h-[28px] border border-black px-2 align-top">{item.saleCode}</td>
                <td className="h-[28px] border border-black px-2 align-top whitespace-normal break-words">
                  {item.productName}
                  {item.productModel ? <span className="ml-1">รุ่น {item.productModel}</span> : null}
                </td>
                <td className="h-[28px] border border-black px-1 text-center align-top">{item.quantity}</td>
                <td className="h-[28px] border border-black px-1 text-center align-top">{item.unit}</td>
                <td className="h-[28px] border border-black px-2 text-right align-top tabular-nums">
                  {formatCustomerReceiptCurrency(item.unitPrice)}
                </td>
                <td className="h-[28px] border border-black px-2 text-right align-top tabular-nums">
                  {formatCustomerReceiptCurrency(item.amount)}
                </td>
              </tr>
            ))}

            {Array.from({ length: emptyRowCount }).map((_, index) => (
              <tr key={`empty-${index}`}>
                {Array.from({ length: 7 }).map((__, columnIndex) => (
                  <td key={columnIndex} className="h-[28px] border border-black">&nbsp;</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div
          className="customer-receipt-no-break mt-auto grid grid-cols-2 gap-5 pt-3 text-[13px]"
          style={{ minHeight: '110px' }}
        >
          <div className="flex flex-col items-center justify-start pt-3 text-center leading-tight">
            <p className="font-bold">จำนวนเงินเป็นตัวอักษร</p>
            <p className="text-[18px] font-semibold italic">({bahtText(total)})</p>
          </div>

          <div>
            <p className="flex justify-between border-b border-t border-black py-1 text-[14px]">
              <span>รวมเงิน</span>
              <span>{formatCustomerReceiptCurrency(beforeVat)} ฿</span>
            </p>
            <p className="flex justify-between border-b border-black py-1 text-[14px]">
              <span>ภาษีมูลค่าเพิ่ม {vatRate}%</span>
              <span>{formatCustomerReceiptCurrency(vatAmount)} ฿</span>
            </p>
            <p className="flex justify-between border-b border-black bg-gray-100 py-1 text-[18px] font-extrabold tabular-nums">
              <span>จำนวนเงินรวมทั้งสิ้น</span>
              <span>{formatCustomerReceiptCurrency(total)} ฿</span>
            </p>
          </div>
        </div>

        <div
          className="customer-receipt-no-break mt-2 grid grid-cols-2 gap-12 text-center text-[15px]"
          style={{ minHeight: '92px' }}
        >
          <div className="flex h-[92px] flex-col justify-end">
            <div className="flex min-h-[28px] flex-col items-center justify-start border-t border-dashed border-black pt-1">
              <span className="mt-1">ผู้ชำระเงิน / PAID BY</span>
            </div>
          </div>

          <div className="flex h-[92px] flex-col justify-end">
            <div className="flex min-h-[28px] flex-col items-center justify-start border-t border-dashed border-black pt-1">
              <span className="mt-1">ผู้รับชำระเงิน / RECEIVED BY</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default React.memo(CustomerReceiptPrintLayout)
