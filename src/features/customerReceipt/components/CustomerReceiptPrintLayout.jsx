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

const CustomerReceiptPrintLayout = ({ receipt }) => {
  const customer = receipt?.customer || null
  const branch = receipt?.branch || null
  const allocations = Array.isArray(receipt?.allocations) ? receipt.allocations : []
  const lineItems = buildCustomerReceiptLineItems(allocations)
  const { total, vatRate, vatAmount, beforeVat } = getCustomerReceiptVatSummary(receipt)
  const emptyRowCount = Math.max(20 - lineItems.length, 0)

  return (
    <div
      className="customer-receipt-full-root mx-auto flex min-h-[297mm] w-[210mm] flex-col overflow-hidden bg-white px-5 pb-4 pt-4 text-black"
      style={{ fontFamily: "'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif" }}
    >
      <div className="mb-2 flex items-start justify-between gap-4 border-b border-black pb-2">
        <div className="leading-tight">
          <h2 className="text-[18px] font-black">{branch?.name || branch?.branchName || '-'}</h2>
          <p className="mt-0.5 text-[13px]">{buildCustomerReceiptBranchAddress(branch)}</p>
          <p className="text-[13px]">โทร {branch?.phone || '-'}</p>
          <p className="text-[13px] font-bold">เลขประจำตัวผู้เสียภาษี {branch?.taxId || '-'}</p>
        </div>
        <div className="rounded border border-black px-3 py-1 text-center text-[12px] font-bold leading-tight">
          ต้นฉบับลูกค้า
          <br />
          CUSTOMER ORIGINAL
        </div>
      </div>

      <div className="mb-4 mt-2 text-center leading-tight">
        <h1 className="text-[24px] font-black underline">ใบเสร็จรับเงินลูกหนี้</h1>
        <div className="text-[12px] tracking-wide">CUSTOMER RECEIPT</div>
      </div>

      <div className="mb-3 grid grid-cols-[2.7fr_1.5fr] gap-4 text-[13px] leading-snug">
        <div className="rounded border border-black p-2.5">
          <p><span className="font-bold">ลูกค้า:</span> {buildCustomerReceiptCustomerName(customer)}</p>
          <p><span className="font-bold">ที่อยู่:</span> {buildCustomerReceiptCustomerAddress(customer)}</p>
          <p><span className="font-bold">โทร:</span> {customer?.user?.loginId || customer?.phone || customer?.phoneNumber || '-'}</p>
          <p><span className="font-bold">เลขประจำตัวผู้เสียภาษี:</span> {customer?.taxId || customer?.taxNo || '-'}</p>
        </div>
        <div className="rounded border border-black p-2.5">
          <p><span className="font-bold">วันที่:</span> {formatCustomerReceiptDate(receipt?.receivedAt)}</p>
          <p><span className="font-bold">เลขที่:</span> {receipt?.code || '-'}</p>
          <p><span className="font-bold">วิธีรับชำระ:</span> {receipt?.paymentMethod || '-'}</p>
        </div>
      </div>

      <table className="mb-2 w-full table-fixed border-collapse text-[12px] leading-snug">
        <thead>
          <tr>
            <th className="h-[28px] w-[7%] border border-black px-1 text-center">ลำดับ</th>
            <th className="h-[28px] w-[18%] border border-black px-2 text-left">เลขที่บิล</th>
            <th className="h-[28px] w-[35%] border border-black px-2 text-left">รายละเอียด</th>
            <th className="h-[28px] w-[10%] border border-black px-1 text-center">จำนวน</th>
            <th className="h-[28px] w-[8%] border border-black px-1 text-center">หน่วย</th>
            <th className="h-[28px] w-[11%] border border-black px-2 text-right">ราคาต่อหน่วย</th>
            <th className="h-[28px] w-[11%] border border-black px-2 text-right">จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, index) => (
            <tr key={item.key || index}>
              <td className="h-[28px] border border-black px-1 text-center">{index + 1}</td>
              <td className="h-[28px] border border-black px-2">{item.saleCode}</td>
              <td className="h-[28px] border border-black px-2 font-bold">
                {item.productName}
                {item.productModel ? <span className="ml-1 font-normal">รุ่น {item.productModel}</span> : null}
              </td>
              <td className="h-[28px] border border-black px-1 text-center">{item.quantity}</td>
              <td className="h-[28px] border border-black px-1 text-center">{item.unit}</td>
              <td className="h-[28px] border border-black px-2 text-right">{formatCustomerReceiptCurrency(item.unitPrice)}</td>
              <td className="h-[28px] border border-black px-2 text-right font-bold">{formatCustomerReceiptCurrency(item.amount)}</td>
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

      <div className="mt-auto grid grid-cols-2 gap-4 border-t border-dashed border-slate-300 pt-3 text-[13px]">
        <div className="flex items-center justify-center rounded bg-slate-50 p-3 text-center">
          <div>
            <div className="text-[12px] font-bold text-slate-600">ยอดรับชำระสุทธิ</div>
            <div className="mt-1 text-[19px] font-black">{formatCustomerReceiptCurrency(total)} บาท</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between border-b border-slate-200 py-0.5">
            <span>มูลค่าก่อนภาษี</span>
            <span>{formatCustomerReceiptCurrency(beforeVat)} บาท</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 py-0.5">
            <span>ภาษีมูลค่าเพิ่ม {vatRate}%</span>
            <span>{formatCustomerReceiptCurrency(vatAmount)} บาท</span>
          </div>
          <div className="flex justify-between border-b border-black bg-slate-50 px-1 py-1 text-[15px] font-black">
            <span>รวมทั้งสิ้น</span>
            <span>{formatCustomerReceiptCurrency(total)} บาท</span>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-4 text-center text-[12px]">
        <div className="mx-auto w-[42%] border-t border-dashed border-black pt-1.5 font-bold">
          เจ้าหน้าที่ผู้รับชำระเงิน
        </div>
      </div>
    </div>
  )
}

export default React.memo(CustomerReceiptPrintLayout)
