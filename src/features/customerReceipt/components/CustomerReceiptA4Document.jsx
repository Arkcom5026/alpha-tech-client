import React, { useMemo } from 'react'
import { buildCustomerFullAddress } from '@/features/customer/utils/customerAddressFormatter'

const LAST_PAGE_ROWS = 20
const NORMAL_PAGE_ROWS = 24
const FONT = '"TH Sarabun New", "Sarabun", Tahoma, Arial, sans-serif'
const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const round2 = (value) => Number(Number(value || 0).toFixed(2))

const paginate = (items = []) => {
  if (items.length <= LAST_PAGE_ROWS) return [{ items, isLast: true }]
  const pages = []
  let index = 0
  while (items.length - index > LAST_PAGE_ROWS) {
    pages.push({ items: items.slice(index, index + NORMAL_PAGE_ROWS), isLast: false })
    index += NORMAL_PAGE_ROWS
  }
  pages.push({ items: items.slice(index), isLast: true })
  return pages
}

const bahtText = (value) => {
  const amount = Math.max(0, Math.round((Number(value || 0) + Number.EPSILON) * 100))
  const baht = Math.trunc(amount / 100)
  const satang = amount % 100
  const digits = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
  const places = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน']
  const readGroup = (number) => {
    if (!number) return 'ศูนย์'
    const chars = String(number).split('').map(Number)
    return chars.map((digit, idx) => {
      if (!digit) return ''
      const place = chars.length - idx - 1
      if (place === 1) return digit === 1 ? 'สิบ' : digit === 2 ? 'ยี่สิบ' : `${digits[digit]}สิบ`
      if (place === 0 && digit === 1 && chars.length > 1) return 'เอ็ด'
      return `${digits[digit]}${places[place] || ''}`
    }).join('')
  }
  const readInteger = (number) => {
    if (number < 1_000_000) return readGroup(number)
    const millions = Math.trunc(number / 1_000_000)
    const rest = number % 1_000_000
    return `${readInteger(millions)}ล้าน${rest ? readGroup(rest) : ''}`
  }
  return `${readInteger(baht)}บาท${satang ? `${readInteger(satang)}สตางค์` : 'ถ้วน'}`
}

const CustomerReceiptA4Document = ({ sale, saleItems = [], config = {}, presentationFooter = null }) => {
  const pages = useMemo(() => paginate(Array.isArray(saleItems) ? saleItems : []), [saleItems])
  const total = round2(sale?.totalAmount)
  const vatRate = Number.isFinite(Number(sale?.vatRate)) ? Number(sale.vatRate) : Number(config?.vatRate || 7)
  const vatAmount = Number.isFinite(Number(sale?.vat)) ? round2(sale.vat) : round2(total * vatRate / (100 + vatRate))
  const beforeVat = round2(total - vatAmount)
  const customer = sale?.customer || {}
  const customerName = ['ORGANIZATION', 'GOVERNMENT'].includes(customer.type) ? customer.companyName || customer.name || '-' : customer.name || '-'
  const customerAddress = buildCustomerFullAddress(customer) || customer.address || '-'
  const dateText = sale?.soldAt ? new Date(sale.soldAt).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', year: 'numeric' }) : '-'
  let runningIndex = 0

  return <>
    <style>{`
      @page { size: A4; margin: 4mm; }
      .customer-receipt-a4-page { box-sizing:border-box; width:210mm; height:296mm; min-height:296mm; font-family:${FONT}; }
      .customer-receipt-a4-page table { font-size:13px; line-height:1.15; }
      .customer-receipt-a4-page th:nth-child(1), .customer-receipt-a4-page td:nth-child(1) { width:7%; }
      .customer-receipt-a4-page th:nth-child(2), .customer-receipt-a4-page td:nth-child(2) { width:49%; }
      .customer-receipt-a4-page th:nth-child(3), .customer-receipt-a4-page td:nth-child(3), .customer-receipt-a4-page th:nth-child(4), .customer-receipt-a4-page td:nth-child(4) { width:8%; }
      .customer-receipt-a4-page th:nth-child(5), .customer-receipt-a4-page td:nth-child(5), .customer-receipt-a4-page th:nth-child(6), .customer-receipt-a4-page td:nth-child(6) { width:14%; }
      @media print {
        .customer-receipt-a4-page { width:201mm!important; height:288mm!important; min-height:288mm!important; margin:0 auto!important; padding:5mm!important; border:0.3mm solid #444!important; border-radius:2.5mm!important; box-shadow:none!important; overflow:hidden!important; font-family:${FONT}!important; }
        .customer-receipt-a4-page + .customer-receipt-a4-page { break-before:page; page-break-before:always; }
      }
    `}</style>
    {pages.map((page, pageIndex) => {
      const rowCap = page.isLast ? LAST_PAGE_ROWS : NORMAL_PAGE_ROWS
      const emptyRows = Math.max(rowCap - page.items.length, 0)
      return <section key={`customer-receipt-a4-${pageIndex}`} className="customer-receipt-a4-page relative mx-auto mb-6 overflow-hidden rounded-[2.5mm] border border-gray-600 bg-white p-[6mm] text-black shadow-sm print:mb-0">
        <div role="banner" className="mb-2 flex items-start justify-between gap-3 border-b pb-2">
          <div className="flex items-start gap-3">
            {config.logoUrl ? <img src={config.logoUrl} alt="logo" className="h-16 w-16 object-contain" /> : null}
            <div><h2 className="text-[16px] font-bold leading-tight">{config.branchName || '-'}</h2><p>ที่อยู่: {config.address || '-'}</p><p>โทร: {config.phone || '-'}</p><p>เลขประจำตัวผู้เสียภาษี: {config.taxId || '-'}</p></div>
          </div>
          <p className="rounded-md border border-gray-400 px-3 py-2 text-right text-[13px] font-bold leading-tight">ต้นฉบับลูกค้า<br />CUSTOMER ORIGINAL</p>
        </div>
        <h3 className="mb-3 text-center text-[20px] font-bold leading-tight underline">ใบเสร็จรับเงิน / ใบกำกับภาษี<br />TAX INVOICE ORIGINAL / RECEIPT</h3>
        <div className="mb-3 grid grid-cols-[2.8fr_1.7fr] gap-4 text-[15px]"><div className="rounded-lg border border-black p-3 leading-tight"><p>ลูกค้า: {customerName}</p><p>ที่อยู่: {customerAddress}</p><p>โทร: {customer?.user?.loginId || customer?.phone || '-'}</p><p>เลขประจำตัวผู้เสียภาษี: {customer?.taxId || '-'}</p></div><div className="rounded-lg border border-black p-3"><p>วันที่: {dateText}</p><p>เลขที่: {sale?.code || sale?.id || '-'}</p><p>ช่องทางชำระ: {sale?.paymentMethod || sale?.paymentTerms || '-'}</p></div></div>
        <table className="w-full table-fixed border border-black"><thead className="bg-gray-100"><tr><th className="h-[24px] border border-black px-1">ลำดับ<br/>ITEM</th><th className="h-[24px] border border-black px-2">รายการ<br/>DESCRIPTION</th><th className="h-[24px] border border-black px-1">จำนวน<br/>QTY</th><th className="h-[24px] border border-black px-1">หน่วย<br/>UNIT</th><th className="h-[24px] border border-black px-2 text-right">ราคาต่อหน่วย<br/>UNIT PRICE</th><th className="h-[24px] border border-black px-2 text-right">จำนวนเงิน<br/>AMOUNT</th></tr></thead><tbody>
          {page.items.map((item) => { runningIndex += 1; const qty = Number(item.quantity || 0); const amount = round2(item.amount ?? item.totalAmount ?? 0); const unit = qty > 0 ? round2(amount / qty) : round2(item.unitPrice || 0); return <tr key={item.id || runningIndex}><td className="h-[24px] border border-black px-1 text-center align-top">{runningIndex}</td><td className="h-[24px] border border-black px-2 align-top">{item.documentDescription || item.productName || '-'}</td><td className="h-[24px] border border-black px-1 text-center align-top">{qty}</td><td className="h-[24px] border border-black px-1 text-center align-top">{item.unit || '-'}</td><td className="h-[24px] border border-black px-2 text-right align-top">{money(unit)}</td><td className="h-[24px] border border-black px-2 text-right align-top">{money(amount)}</td></tr> })}
          {Array.from({ length: emptyRows }).map((_, idx) => <tr key={`empty-${idx}`}><td className="h-[24px] border border-black">&nbsp;</td><td className="h-[24px] border border-black">&nbsp;</td><td className="h-[24px] border border-black">&nbsp;</td><td className="h-[24px] border border-black">&nbsp;</td><td className="h-[24px] border border-black">&nbsp;</td><td className="h-[24px] border border-black">&nbsp;</td></tr>)}
        </tbody></table>
        {page.isLast ? <><div className="absolute bottom-[31mm] left-[6mm] right-[6mm] grid grid-cols-2 gap-5 text-[13px]"><div className="pt-3 text-center leading-tight"><p className="font-bold">จำนวนเงินเป็นตัวอักษร</p><p className="text-[18px] font-semibold italic">({bahtText(total)})</p>{presentationFooter ? <div className="mt-1">{presentationFooter}</div> : null}</div><div><p className="flex justify-between border-y border-black py-1 text-[14px]"><span>รวมเงิน</span><span>{money(beforeVat)} ฿</span></p><p className="flex justify-between border-b border-black py-1 text-[14px]"><span>ภาษีมูลค่าเพิ่ม {vatRate}%</span><span>{money(vatAmount)} ฿</span></p><p className="flex justify-between border-b border-black bg-gray-100 py-1 text-[18px] font-extrabold"><span>จำนวนเงินรวมทั้งสิ้น</span><span>{money(total)} ฿</span></p></div></div><div className="absolute bottom-[5mm] left-[6mm] right-[6mm] grid grid-cols-2 gap-12 text-center text-[15px]"><div className="flex h-[20mm] flex-col justify-end"><div className="border-t border-dashed border-black pt-1">ผู้ชำระเงิน / PAID BY</div></div><div className="flex h-[20mm] flex-col justify-end"><div className="border-t border-dashed border-black pt-1">ผู้รับชำระเงิน / RECEIVED BY</div></div></div></> : null}
      </section>
    })}
  </>
}

export default React.memo(CustomerReceiptA4Document)
