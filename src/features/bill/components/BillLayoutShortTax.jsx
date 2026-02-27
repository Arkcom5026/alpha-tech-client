
// src/features/bill/components/BillLayoutShortTax.jsx

import React from 'react';


const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100
const formatCurrency = (val) =>
  (Number(val) || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const BillLayoutShortTax = ({ sale, saleItems, payments, config, hideContactName }) => {
  if (!sale || !saleItems || !payments || !config) return null

  // ✅ คิดเงินแบบหน่วยสตางค์ให้แม่นยำ
  const totalSatang = saleItems.reduce((sum, item) => {
    const price = Math.round((Number(item.price) || 0) * 100)
    const qty = Number(item.quantity) || 0
    return sum + price * qty
  }, 0)

  const total = totalSatang / 100
  const vatRate = typeof config.vatRate === 'number' ? config.vatRate : 7

  const beforeVat = round2(total / (1 + vatRate / 100))
  const vatAmount = round2(total - beforeVat)

  // ✅ กันเคสวันที่เป็น undefined และลด re-render JSX
  const dateText = sale?.createdAt
    ? new Date(sale.createdAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Bangkok',
      })
    : '-'

  const handlePrint = () => window.print()

  return (
    <div
      className="w-[80mm] min-h-[280mm] pt-6 pb-6 mx-auto text-base leading-relaxed"
      style={{ fontFamily: 'TH Sarabun New, sans-serif' }}
    >
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>

      <div className="text-right print:hidden mb-4">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded text-sm"
        >
          พิมพ์บิล
        </button>
      </div>

      {/* Header */}
      <div className="text-center border-b border-gray-300 pb-3 mb-4">
        {config.logoUrl && <img src={config.logoUrl} alt="logo" className="h-10 mx-auto mb-2" />}
        <h2 className="font-bold text-base leading-snug">{config.branchName}</h2>
        <p className="text-sm whitespace-pre-line leading-tight">{config.address}</p>
        {config.phone && <p className="text-sm">โทร. {config.phone}</p>}
        {config.taxId && <p className="text-sm">เลขผู้เสียภาษี {config.taxId}</p>}
      </div>

      <div className="text-sm mb-4 space-y-1">
        <p className="font-bold">ใบกำกับภาษีอย่างย่อ / ใบเสร็จรับเงิน</p>
        <p>เลขที่: {sale.code}</p>
        {!config.hideDate && (
          <p>วันที่: {dateText}</p>
        )}
        <p>พนักงานขาย: {sale.employee?.name || '-'}</p>
        <p>หน่วยงาน: {sale.customer?.companyName || '-'}</p>
        {!hideContactName && <p>ลูกค้า: {sale.customer?.name || '-'}</p>}
      </div>

      <table className="w-full text-sm border-t border-b border-gray-300 mb-4">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1">สินค้า</th>
            <th className="text-right py-1">จำนวน</th>
            <th className="text-right py-1">ราคา</th>
          </tr>
        </thead>
        <tbody>
          {saleItems.map((item) => (
            <tr key={item.id} className="border-b border-dashed">
              <td className="py-1">
                {item.productName}
                {item.productModel && (
                  <span className="text-xs text-gray-800"> ({item.productModel})</span>
                )}
              </td>
              <td className="text-right py-1">{item.quantity}</td>
              <td className="text-right py-1">{formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))} ฿</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-sm text-right space-y-1">
        <p>รวมก่อน VAT: {formatCurrency(beforeVat)} ฿</p>
        <p>VAT {vatRate}%: {formatCurrency(vatAmount)} ฿</p>
        <p className="font-bold text-base">รวมทั้งสิ้น: {formatCurrency(total)} ฿</p>
        <p className="text-center mt-3 text-sm border-t border-dashed pt-2">VAT INCLUDED</p>
      </div>

      <div className="mt-6 text-sm space-y-1">
        {sale.note && <p>หมายเหตุ: {sale.note}</p>}
      </div>
    </div>
  )
}

// ✅ memo ป้องกัน re-render ตอนเปิด print window
export default React.memo(BillLayoutShortTax)



