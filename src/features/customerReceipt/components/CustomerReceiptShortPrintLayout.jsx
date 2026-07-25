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

const CustomerReceiptShortPrintLayout = ({ receipt }) => {
  const customer = receipt?.customer || null
  const branch = receipt?.branch || null
  const allocations = Array.isArray(receipt?.allocations) ? receipt.allocations : []
  const lineItems = buildCustomerReceiptLineItems(allocations)
  const { total, vatRate, vatAmount, beforeVat } = getCustomerReceiptVatSummary(receipt)
  const branchAddress = buildCustomerReceiptBranchAddress(branch)
  const customerAddress = buildCustomerReceiptCustomerAddress(customer)

  return (
    <div
      className="customer-receipt-short-root w-[80mm] max-w-[80mm] bg-white px-4 py-4 text-black"
      style={{ fontFamily: "'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif" }}
    >
      <div className="text-center leading-tight">
        <div className="text-[16px] font-black tracking-tight">
          {branch?.name || branch?.branchName || '-'}
        </div>
        <div className="mt-1 text-[11px] leading-snug">{branchAddress}</div>
        <div className="text-[11px] leading-snug">โทร {branch?.phone || '-'}</div>
        <div className="text-[11px] leading-snug">
          เลขประจำตัวผู้เสียภาษี {branch?.taxId || '-'}
        </div>
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="text-center leading-tight">
        <div className="text-[16px] font-black">ใบเสร็จรับเงินลูกหนี้</div>
        <div className="text-[10px] tracking-wide">CUSTOMER RECEIPT</div>
      </div>

      <div className="mt-2 space-y-0.5 text-[12px] leading-snug">
        <div className="flex justify-between gap-3">
          <span>เลขที่</span>
          <span className="font-bold">{receipt?.code || '-'}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>วันที่</span>
          <span>{formatCustomerReceiptDate(receipt?.receivedAt)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>วิธีรับชำระ</span>
          <span>{receipt?.paymentMethod || '-'}</span>
        </div>
      </div>

      <div className="mt-2 border-y border-dashed border-black py-2 text-[12px] leading-snug">
        <div className="flex items-start justify-between gap-3">
          <span className="shrink-0">ลูกค้า</span>
          <span className="text-right font-bold">{buildCustomerReceiptCustomerName(customer)}</span>
        </div>
        <div className="mt-0.5 flex items-start justify-between gap-3">
          <span className="shrink-0">ที่อยู่</span>
          <span className="text-right">{customerAddress}</span>
        </div>
        <div className="mt-0.5 flex items-start justify-between gap-3">
          <span className="shrink-0">โทร</span>
          <span className="text-right">
            {customer?.user?.loginId || customer?.phone || customer?.phoneNumber || '-'}
          </span>
        </div>
        <div className="mt-0.5 flex items-start justify-between gap-3">
          <span className="shrink-0">เลขผู้เสียภาษี</span>
          <span className="text-right">{customer?.taxId || customer?.taxNo || '-'}</span>
        </div>
      </div>

      <div className="mt-2 space-y-2 text-[12px] leading-snug">
        {lineItems.map((item, index) => (
          <div key={item.key || index} className="break-inside-avoid">
            <div className="flex items-start gap-1 font-bold">
              <span className="shrink-0">{index + 1}.</span>
              <span>{item.productName}</span>
            </div>
            {item.productModel ? (
              <div className="pl-4 text-[10px] text-slate-600">รุ่น {item.productModel}</div>
            ) : null}
            <div className="flex justify-between gap-2 pl-4 text-[11px]">
              <span>
                {item.quantity} {item.unit}
              </span>
              <span>{formatCustomerReceiptCurrency(item.amount)} บาท</span>
            </div>
            <div className="flex justify-between gap-2 pl-4 text-[10px] text-slate-600">
              <span>อ้างอิง {item.saleCode}</span>
              <span>@ {formatCustomerReceiptCurrency(item.unitPrice)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="space-y-0.5 text-[11px] leading-snug">
        <div className="flex justify-between gap-3">
          <span>มูลค่าก่อนภาษี</span>
          <span>{formatCustomerReceiptCurrency(beforeVat)} บาท</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>ภาษีมูลค่าเพิ่ม {vatRate}%</span>
          <span>{formatCustomerReceiptCurrency(vatAmount)} บาท</span>
        </div>
      </div>

      <div className="mt-1 flex items-end justify-between gap-3 border-t border-black pt-1">
        <span className="text-[13px] font-black">รวมสุทธิ</span>
        <span className="text-[19px] font-black">{formatCustomerReceiptCurrency(total)} บาท</span>
      </div>

      <div className="mt-7 text-center text-[11px] leading-snug">
        <div className="mx-auto w-[52mm] border-t border-dashed border-black pt-1">
          เจ้าหน้าที่ผู้รับชำระเงิน
        </div>
        <div className="mt-3">ขอบคุณที่ใช้บริการ</div>
      </div>
    </div>
  )
}

export default React.memo(CustomerReceiptShortPrintLayout)
