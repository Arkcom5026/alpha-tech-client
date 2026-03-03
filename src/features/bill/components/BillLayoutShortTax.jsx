




// src/features/bill/components/BillLayoutShortTax.jsx

import React from 'react';


const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100
const formatCurrency = (val) =>
  (Number(val) || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

// ✅ number safe
const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

// ✅ unit price resolver (fallback หลายชื่อ กัน field mismatch)
const getUnitPrice = (item) => {
  if (!item) return 0

  // รองรับชื่อ field ที่พบบ่อยใน POS
  const candidates = [
    item.price, // เดิม
    item.unitPrice,
    item.sellPrice,
    item.unitPriceIncVat,
    item.unitPriceExVat,
    item.sellingPrice,
    item.salePrice,
    item.lineUnitPrice,
  ]

  for (const v of candidates) {
    const num = n(v)
    if (num > 0) return num
  }

  return 0
}

// ✅ line total (หน่วยสตางค์) ให้แม่น และกัน float drift
const getLineTotalSatang = (item) => {
  const qty = n(item?.quantity)
  const unit = getUnitPrice(item)
  const unitSatang = Math.round(unit * 100)
  return unitSatang * qty
}

const BillLayoutShortTax = ({ sale, saleItems, payments, config, hideContactName }) => {
  // ✅ normalize payments once (avoid JSX IIFE + keep parser happy)
  const normalizedPayments = Array.isArray(payments)
    ? payments
        .map((p) => {
          const raw = (p?.method || p?.paymentMethod || p?.type || '').toString().trim();
          const method = raw ? raw.toUpperCase() : '';
          const amt = n(p?.amount || p?.paidAmount || p?.value);
          return { p, method, amt };
        })
        .filter((x) => x.amt > 0.0001 && x.method && x.method !== '-' && x.method !== 'N/A')
    : [];

  const labelOf = (m) => {
    if (m === 'CASH') return 'เงินสด';
    if (m === 'TRANSFER' || m === 'BANK_TRANSFER') return 'โอน';
    if (m === 'CARD' || m === 'CREDIT_CARD') return 'บัตร';
    return m;
  };

  const paidTotal = round2(normalizedPayments.reduce((s, x) => s + n(x.amt), 0));
  if (!sale || !saleItems || !payments || !config) return null

  // ✅ Total: prefer from sale (source of truth) ถ้ามี แล้วค่อย fallback ไปคำนวณจากรายการ
  const computedTotalSatang = saleItems.reduce((sum, item) => sum + getLineTotalSatang(item), 0)

  const saleTotalCandidateBaht =
    n(sale?.totalAmount) ||
    n(sale?.total) ||
    n(sale?.grandTotal) ||
    n(sale?.totalPremium)

  const saleTotalCandidateSatang = Math.round(saleTotalCandidateBaht * 100)
  const totalSatang = saleTotalCandidateSatang > 0 ? saleTotalCandidateSatang : computedTotalSatang

  const total = totalSatang / 100
  const vatRate = typeof config.vatRate === 'number' ? config.vatRate : 7

  const beforeVat = round2(total / (1 + vatRate / 100))
  const vatAmount = round2(total - beforeVat)

  // ✅ 7-11-ish meta: counts + change
  const itemLines = Array.isArray(saleItems) ? saleItems.length : 0
  const qtyTotal = Array.isArray(saleItems) ? saleItems.reduce((s, it) => s + n(it?.quantity), 0) : 0

  const change = round2(paidTotal - total)
  const shouldShowChange = paidTotal > 0 && change > 0.005

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
      className="mx-auto receipt-root"
      style={{
        width: '80mm',
        minHeight: 'auto',
        fontFamily: 'THSarabunNew, TH Sarabun New, sans-serif',
        fontSize: config?.thermalFontSize || '13px',
        lineHeight: 1.18,
        padding: '6px 8px 8px',
      }}
    >
      <style>{`
        /* ✅ TH Sarabun New (served from /public/fonts)
           Files:
           - /fonts/THSarabunNew.ttf
           - /fonts/THSarabunNew-Bold.ttf
           - /fonts/THSarabunNew-Italic.ttf
           - /fonts/THSarabunNew-BoldItalic.ttf
        */
        @font-face {
          font-family: 'THSarabunNew';
          src: url('/fonts/THSarabunNew.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'THSarabunNew';
          src: url('/fonts/THSarabunNew-Bold.ttf') format('truetype');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'THSarabunNew';
          src: url('/fonts/THSarabunNew-Italic.ttf') format('truetype');
          font-weight: 400;
          font-style: italic;
          font-display: swap;
        }
        @font-face {
          font-family: 'THSarabunNew';
          src: url('/fonts/THSarabunNew-BoldItalic.ttf') format('truetype');
          font-weight: 700;
          font-style: italic;
          font-display: swap;
        }

        @media print {
          html, body {
            margin: 0;
            padding: 0;
            width: 80mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            width: 80mm;
          }
          @page {
            /* ✅ allow dynamic paper size via config.paperSize (e.g. '80mm', '58mm', 'A4') */
            size: 80mm auto;
            margin: 0;
          }

          /* Avoid breaking critical blocks / rows */
          .no-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          table { page-break-inside: auto; }
          tr, td, th { page-break-inside: avoid; break-inside: avoid; }
        }

        /* ✅ Thermal receipt utilities */
        .receipt-root {
          color: #000;
          width: 80mm;
          max-width: 80mm;
        }
        @media print {
          .receipt-root {
            margin: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
          }
        }
        .mono {
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum" 1;
        }
        .hr {
          border-top: 1px dashed #999;
          margin: 5px 0;
        }
        .hr-solid {
          border-top: 1px solid #999;
          margin: 5px 0;
        }
        .tight {
          line-height: 1.15;
        }
        .small {
          font-size: 12px;
        }
        .xs {
          font-size: 11px;
        }
        .label {
          opacity: 0.95;
        }
        .row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 4px;
        }
        .row > .left {
          flex: 1;
          min-width: 0;
        }
        .row > .right {
          flex: 0 0 auto;
          text-align: right;
          white-space: nowrap;
        }
        .clip {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .wrap {
          white-space: normal;
          word-break: break-word;
        }
      `}</style>

      <div className="text-right print:hidden mb-2">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded text-sm"
        >
          พิมพ์บิล
        </button>
      </div>

      {/* Header (thermal-friendly) */}
      <div className="text-center no-break tight">
        {config.logoUrl && <img src={config.logoUrl} alt="logo" className="h-10 mx-auto mb-1" />}
        <div className="font-bold" style={{ fontSize: '16px' }}>{config.branchName}</div>
        {config.address && <div className="small wrap">{config.address}</div>}
        <div className="small mono">
          {config.phone ? `โทร. ${config.phone}` : ''}
          {config.phone && config.taxId ? '  •  ' : ''}
          {config.taxId ? `เลขผู้เสียภาษี ${config.taxId}` : ''}
        </div>
      </div>

      <div className="hr" />

      <div className="no-break tight" style={{ marginBottom: 6 }}>
        {/* POS meta (7-11-ish) */}
        <div className="row xs mono" style={{ marginTop: 2 }}>
          <div className="left label">แคชเชียร์</div>
          <div className="right clip">{sale.employee?.name || config?.cashierName || '-'}</div>
        </div>
        <div className="row xs mono">
          <div className="left label">เครื่อง</div>
          <div className="right">{config?.terminalId || config?.posId || '-'}</div>
        </div>
        <div className="row xs mono">
          <div className="left label">รายการ/ชิ้น</div>
          <div className="right">{itemLines}/{qtyTotal}</div>
        </div>

        <div className="hr-solid" style={{ margin: '6px 0' }} />

        <div className="text-center font-bold">ใบกำกับภาษีอย่างย่อ / ใบเสร็จรับเงิน</div>
        <div className="row small mono" style={{ marginTop: 4 }}>
          <div className="left label">เลขที่</div>
          <div className="right">{sale.code}</div>
        </div>
        {!config.hideDate && (
          <div className="row small mono">
            <div className="left label">วันที่</div>
            <div className="right">{dateText}</div>
          </div>
        )}
        <div className="row small">
          <div className="left label">พนักงานขาย</div>
          <div className="right clip">{sale.employee?.name || '-'}</div>
        </div>
        <div className="row small">
          <div className="left label">หน่วยงาน</div>
          <div className="right clip">{sale.customer?.companyName || '-'}</div>
        </div>
        {!hideContactName && (
          <div className="row small">
            <div className="left label">ลูกค้า</div>
            <div className="right clip">{sale.customer?.name || '-'}</div>
          </div>
        )}
      </div>

      <div className="hr" />
      <div className="no-break">
        <div className="row xs mono" style={{ marginBottom: 4 }}>
          <div className="left label">สินค้า</div>
          <div className="right label">จำนวน</div>
          <div className="right label" style={{ minWidth: 72 }}>ราคา</div>
        </div>

        <div className="hr-solid" />

        <div>
          {saleItems.map((item) => {
            const qty = n(item?.quantity);
            const unit = getUnitPrice(item);
            const lineTotal = getLineTotalSatang(item) / 100;
            return (
              <div key={item.id} className="tight" style={{ padding: '3px 0' }}>
                <div className="row">
                  <div className="left wrap">
                    <div className="wrap">{item.productName || '-'}</div>
                    {(item.productModel || unit > 0) && (
                      <div className="xs mono" style={{ opacity: 0.95 }}>
                        {item.productModel ? `${item.productModel}` : ''}
                        {item.productModel && unit > 0 ? ' • ' : ''}
                        {unit > 0 ? `${qty} x ${formatCurrency(unit)}` : ''}
                      </div>
                    )}
                  </div>
                  <div className="right mono" style={{ minWidth: 36 }}>{qty || ''}</div>
                  <div className="right mono" style={{ minWidth: 72 }}>{formatCurrency(lineTotal)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hr-solid" />
      </div>

      <div className="no-break" style={{ marginTop: 6 }}>
        <div className="row mono">
          <div className="left label">รวมเงิน</div>
          <div className="right">{formatCurrency(beforeVat)} ฿</div>
        </div>
        <div className="row mono">
          <div className="left label">ภาษีมูลค่าเพิ่ม {vatRate}%</div>
          <div className="right">{formatCurrency(vatAmount)} ฿</div>
        </div>

        {/* Payment breakdown (7-11 style) */}
        {normalizedPayments.length > 0 && (
          <>
            <div className="hr" />
            {normalizedPayments.map(({ p, method, amt }, idx) => (
              <div key={p?.id ?? `${method}-${idx}`} className="row mono">
                <div className="left label">{labelOf(method)}</div>
                <div className="right">{formatCurrency(amt)} ฿</div>
              </div>
            ))}
          </>
        )}

        {/* Change (optional) */}
        {shouldShowChange && (
          <div className="row mono">
            <div className="left label">เงินทอน</div>
            <div className="right">{formatCurrency(change)} ฿</div>
          </div>
        )}

        <div className="hr" />
        <div className="row mono" style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '0.3px' }}>
          <div className="left">จำนวนเงินรวมทั้งสิ้น</div>
          <div className="right">{formatCurrency(total)} ฿</div>
        </div>
        <div className="text-center xs" style={{ marginTop: 6 }}>(ราคารวมภาษีมูลค่าเพิ่มแล้ว)</div>
      </div>

      <div className="hr" />

      <div className="mt-2 small no-break tight">
        {sale.note && <div className="wrap">หมายเหตุ: {sale.note}</div>}
        {config?.receiptFooter && <div className="wrap" style={{ marginTop: 4 }}>{config.receiptFooter}</div>}
      </div>

      <div className="hr" />

      <div className="text-center small no-break tight">
        <div>ขอบคุณที่ใช้บริการ</div>
        <div className="xs" style={{ marginTop: 2 }}>
          {config?.returnPolicyShort || 'กรุณาตรวจสอบสินค้าให้เรียบร้อยก่อนออกจากร้าน'}
        </div>

        {/* Footer code lines (7-11-ish) */}
        <div className="hr" />
        <div className="mono xs" style={{ letterSpacing: '1.2px' }}>
          {config?.footerCode || sale.code}
        </div>
        <div className="mono xs" style={{ marginTop: 2 }}>
          {config?.footerCode2 || (sale?.id ? `TXN-${sale.id}` : '')}
        </div>
      </div>
    </div>
  )
}

// ✅ memo ป้องกัน re-render ตอนเปิด print window
export default React.memo(BillLayoutShortTax)








