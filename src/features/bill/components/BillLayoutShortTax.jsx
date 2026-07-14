// src/features/bill/components/BillLayoutShortTax.jsx

import React from 'react'
import { buildReceiptItems } from '@/features/bill/utils/receiptGrouping'

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100

const formatCurrency = (val) =>
  (Number(val) || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const buildBranchFullAddress = (branch, fallbackAddress = '-') => {
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

  const fallback = typeof fallbackAddress === 'string' ? fallbackAddress.trim() : ''
  return fallback || '-'
}

const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

const getUnitPrice = (item) => {
  if (!item) return 0

  const candidates = [
    item.unitPriceIncVat,
    item.unitPrice,
    item.lineUnitPrice,
  ]

  for (const v of candidates) {
    const num = n(v)
    if (num > 0) return num
  }

  const qty = n(item?.quantity)
  const amount = n(item?.amount ?? item?.total ?? item?.totalAmount)
  if (qty > 0 && amount > 0) return round2(amount / qty)

  return 0
}

const getLineTotalSatang = (item) => {
  const amount = n(item?.amount ?? item?.total ?? item?.totalAmount)
  if (amount > 0) return Math.round(amount * 100)

  const qty = n(item?.quantity)
  const unit = getUnitPrice(item)
  const unitSatang = Math.round(unit * 100)
  return unitSatang * qty
}

const buildDocumentLineText = (item) => {
  const prefix = String(item?.documentPrefix || '').trim()
  const description = String(item?.documentDescription || item?.productName || '').trim()
  const suffix = String(item?.documentSuffix || '').trim()

  return [prefix, description, suffix].filter(Boolean).join(' ') || '-'
}

const getLineKey = (item) => item?.documentLineKey || item?.id || null



const BillLayoutShortTax = ({
  sale,
  saleItems,
  payments,
  config,
  hideContactName,

  editableDocumentLines = false,
  editingLineKey = null,
  lineDrafts = {},
  savingLineKey = null,
  onToggleDocumentLineEdit,
  onChangeDocumentLineDraft,
  onSaveDocumentLine,
}) => {
  const receiptTitle = 'ใบกำกับภาษีอย่างย่อ / ใบเสร็จรับเงิน'

  const getAdaptiveTitleStyle = (text) => {
    const len = String(text || '').trim().length

    if (len >= 34) return { fontSize: '12.5px', letterSpacing: '0px', padding: '8px 4px 7px' }
    if (len >= 28) return { fontSize: '13px', letterSpacing: '0.05px', padding: '8px 5px 7px' }

    return { fontSize: '14px', letterSpacing: '0.2px', padding: '8px 6px 7px' }
  }

  const getAdaptiveTotalStyle = (label, amountText) => {
    const len = `${label || ''}${amountText || ''}`.trim().length

    if (len >= 26) return { fontSize: '16px', letterSpacing: '0px', gap: '8px' }
    if (len >= 22) return { fontSize: '17px', letterSpacing: '0.05px', gap: '10px' }

    return { fontSize: '18px', letterSpacing: '0.1px', gap: '12px' }
  }

  const getAdaptiveBranchNameStyle = (text) => {
    const len = String(text || '').trim().replace(/\s+/g, ' ').length

    if (len >= 46) {
      return {
        fontSize: '12.6px',
        lineHeight: 1.18,
        letterSpacing: '-0.45px',
        transform: 'scaleX(0.94)',
        transformOrigin: 'center',
      }
    }

    if (len >= 40) {
      return {
        fontSize: '13.2px',
        lineHeight: 1.18,
        letterSpacing: '-0.35px',
        transform: 'scaleX(0.96)',
        transformOrigin: 'center',
      }
    }

    if (len >= 34) {
      return {
        fontSize: '14px',
        lineHeight: 1.18,
        letterSpacing: '-0.2px',
      }
    }

    if (len >= 28) {
      return {
        fontSize: '15px',
        lineHeight: 1.18,
        letterSpacing: '-0.05px',
      }
    }

    return {
      fontSize: '16px',
      lineHeight: 1.18,
      letterSpacing: '0.1px',
    }
  }

  const getCustomerPhoneText = (customer) => {
    if (!customer) return '-'
    return customer.user?.loginId || customer.phone || customer.phoneNumber || '-'
  }

  const normalizedPayments = Array.isArray(payments)
    ? payments
        .map((p) => {
          const raw = (p?.method || p?.paymentMethod || p?.type || '').toString().trim()
          const method = raw ? raw.toUpperCase() : ''
          const amt = n(p?.amount || p?.paidAmount || p?.value)
          return { p, method, amt }
        })
        .filter((x) => x.amt > 0.0001 && x.method && x.method !== '-' && x.method !== 'N/A')
    : []

  const labelOf = (m) => {
    if (m === 'CASH') return 'เงินสด'
    if (m === 'TRANSFER' || m === 'BANK_TRANSFER') return 'โอน'
    if (m === 'CARD' || m === 'CREDIT_CARD') return 'บัตร'
    return m
  }

  const renderDocumentLineEditorPanel = (item) => {
    if (!editableDocumentLines || !item) return null

    const lineKey = getLineKey(item)
    if (!lineKey || editingLineKey !== lineKey) return null

    const isSaving = savingLineKey === lineKey

    const draft = {
      documentPrefix: item?.documentPrefix || '',
      documentDescriptionRaw: item?.documentDescriptionRaw || '',
      documentSuffix: item?.documentSuffix || '',
      ...(lineDrafts?.[lineKey] || {}),
    }

    const readonlyDescription =
      item?.documentDescription ||
      item?.productName ||
      item?.documentDescriptionRaw ||
      '-'

    return (
      <div className="print:hidden" style={{ marginTop: 6, paddingLeft: 0 }}>
        <div
          className="rounded border border-slate-200 bg-slate-50"
          style={{
            padding: 6,
          }}
        >
          <div className="space-y-1">
            <input
              value={draft.documentPrefix}
              onChange={(e) => onChangeDocumentLineDraft?.(item, 'documentPrefix', e.target.value)}
              placeholder="ข้อความก่อนสินค้า"
              className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />

            <div className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
              {readonlyDescription}
            </div>

            <input
              value={draft.documentSuffix}
              onChange={(e) => onChangeDocumentLineDraft?.(item, 'documentSuffix', e.target.value)}
              placeholder="ข้อความท้ายสินค้า"
              className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />

            <div className="text-right">
              <button
                type="button"
                onClick={() => onSaveDocumentLine?.(item)}
                disabled={isSaving}
                className="rounded bg-teal-600 px-3 py-1 text-xs text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderDocumentLineButton = (item) => {
    if (!editableDocumentLines || !item) return null

    const lineKey = getLineKey(item)
    if (!lineKey) return null

    const isEditing = editingLineKey === lineKey
    const hasDocumentLine = Boolean(item?.hasDocumentLine)

    return (
      <button
        type="button"
        onClick={() => onToggleDocumentLineEdit?.(item)}
        title={hasDocumentLine ? 'รายการนี้มีข้อความเอกสารแล้ว' : 'เพิ่มข้อความเอกสาร'}
        aria-label={hasDocumentLine ? 'รายการนี้มีข้อความเอกสารแล้ว' : 'เพิ่มข้อความเอกสาร'}
        className={`print:hidden inline-flex h-5 w-5 items-center justify-center rounded border text-[11px] leading-none ${
          isEditing || hasDocumentLine
            ? 'border-teal-500 bg-teal-50 text-teal-700'
            : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
        }`}
      >
        {hasDocumentLine ? '✓' : '☑'}
      </button>
    )
  }

  const paidTotal = round2(normalizedPayments.reduce((s, x) => s + n(x.amt), 0))

  const displaySaleItems = React.useMemo(
    () => buildReceiptItems(saleItems || []),
    [saleItems]
  )

  if (!sale || !saleItems || !payments || !config) return null

  // ✅ Branch address truth: prefer structured Sale.branch relation, then config fallback.
  const branchAddress = buildBranchFullAddress(sale?.branch, config?.address)

  const vatRate = Number.isFinite(Number(sale?.vatRate))
    ? Number(sale.vatRate)
    : typeof config?.vatRate === 'number'
      ? config.vatRate
      : 7

  const saleTotalCandidateBaht =
    n(sale?.totalAmount) ||
    n(sale?.total) ||
    n(sale?.grandTotal) ||
    n(sale?.totalPremium)

  const total = round2(saleTotalCandidateBaht)
  const vatStored = sale?.vat != null ? round2(n(sale.vat)) : null
  const vatAmount = vatStored != null ? vatStored : round2((total * vatRate) / (100 + vatRate))
  const beforeVat = round2(total - vatAmount)

  const totalLabel = 'จำนวนเงินรวมทั้งสิ้น'
  const totalAmountText = `${formatCurrency(total)} ฿`
  const adaptiveTotalStyle = getAdaptiveTotalStyle(totalLabel, totalAmountText)

  const itemLines = Array.isArray(displaySaleItems) ? displaySaleItems.length : 0
  const qtyTotal = Array.isArray(displaySaleItems) ? displaySaleItems.reduce((s, it) => s + n(it?.quantity), 0) : 0

  const change = round2(paidTotal - total)
  const shouldShowChange = paidTotal > 0 && change > 0.005

  const dateText = sale?.createdAt
    ? new Date(sale.createdAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Bangkok',
      })
    : '-'

  return (
    <div
      className="mx-auto receipt-root"
      style={{
        width: '76mm',
        minHeight: 'auto',
        fontFamily: 'Tahoma, Arial, sans-serif',
        fontSize: config?.thermalFontSize || '13px',
        lineHeight: 1.3,
        padding: '10px 1.5mm',
      }}
    >
      <style>{`
        * { box-sizing: border-box; }

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
            size: 80mm auto;
            margin: 3mm 3mm 3mm 3mm;
          }

          .no-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          table { page-break-inside: auto; }
          tr, td, th { page-break-inside: avoid; break-inside: avoid; }
        }

        .receipt-root {
          color: #000;
          width: 76mm;
          max-width: 76mm;
          margin: 0 auto;
        }

        @media print {
          .receipt-root {
            margin: 0 auto !important;
            width: 76mm !important;
            max-width: 76mm !important;
          }
        }

        .receipt-inner {
          width: 100%;
          padding-left: 2.8mm;
          padding-right: 2.8mm;
        }

        .mono {
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum" 1;
        }
        .hr {
          border-top: 1px dotted #cfcfcf;
          margin: 7px 0;
        }
        .hr-solid {
          border-top: 0.75px solid #111;
          margin: 7px 0;
        }
        .tight {
          line-height: 1.14;
        }
        .small {
          font-size: 12px;
          line-height: 1.3;
        }
        .xs {
          font-size: 11px;
          line-height: 1.25;
        }
        .label {
          opacity: 0.86;
        }
        .muted {
          opacity: 0.78;
        }
        .row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
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
        .section-pad {
          padding-top: 3px;
          padding-bottom: 3px;
        }
        .title-band {
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .receipt-product-line {
          padding: 4px 0;
        }
        .receipt-product-name {
          font-size: 12px;
          line-height: 1.15;
          letter-spacing: -0.05px;
        }
        .receipt-product-number {
          font-size: 12px;
          line-height: 1.15;
        }
      `}</style>

      <div className="receipt-inner">
        <div className="text-center no-break tight">
          {config.logoUrl && <img src={config.logoUrl} alt="logo" className="h-10 mx-auto mb-1" />}
          <div
            className="font-bold"
            style={{
              ...getAdaptiveBranchNameStyle(config.branchName),
              marginBottom: 3,
              maxWidth: '100%',
              whiteSpace: 'nowrap',
              overflow: 'visible',
            }}
          >
            {config.branchName}
          </div>
          {branchAddress !== '-' && <div className="small wrap">{branchAddress}</div>}
          <div className="small mono muted" style={{ letterSpacing: '0.05px' }}>
            {config.phone ? `โทร. ${config.phone}` : ''}
          </div>
          {config.taxId && <div className="small mono muted">เลขผู้เสียภาษี {config.taxId}</div>}
        </div>

        <div className="hr" />

        <div className="no-break tight section-pad" style={{ paddingLeft: 1, paddingRight: 1, marginBottom: 6 }}>
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

          <div className="hr-solid" style={{ margin: '5px 0' }} />

          <div className="text-center font-bold title-band" style={getAdaptiveTitleStyle(receiptTitle)}>
            {receiptTitle}
          </div>
          <div className="row small mono" style={{ marginTop: 3 }}>
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
          <div className="row small mono">
            <div className="left label">โทร:</div>
            <div className="right clip">{getCustomerPhoneText(sale.customer)}</div>
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
          <div className="row xs mono" style={{ marginBottom: 5 }}>
            <div className="left label">สินค้า</div>
            <div className="right label" style={{ minWidth: 36, textAlign: 'right' }}>จำนวน</div>
            <div className="right label" style={{ minWidth: 78, textAlign: 'right', letterSpacing: '0.05px' }}>ราคา</div>
            {editableDocumentLines ? (
              <div className="right label print:hidden" style={{ width: 22, textAlign: 'right' }}>&nbsp;</div>
            ) : null}
          </div>

          <div className="hr-solid" />

          <div>
            {displaySaleItems.map((item) => {
              const qty = n(item?.quantity)
              const lineTotal = getLineTotalSatang(item) / 100

              return (
                <div key={getLineKey(item) || item.id} className="tight receipt-product-line">
                  <div className="row">
                    <div className="left wrap">
                      <div className="wrap receipt-product-name">{buildDocumentLineText(item)}</div>
                    </div>

                    <div className="right mono receipt-product-number" style={{ minWidth: 36, textAlign: 'right' }}>
                      {qty || ''}
                    </div>
                    <div
                      className="right mono receipt-product-number"
                      style={{
                        minWidth: 78,
                        textAlign: 'right',
                        letterSpacing: '0.05px',
                        fontWeight: 500,
                      }}
                    >
                      {formatCurrency(lineTotal)}
                    </div>

                    {editableDocumentLines ? (
                      <div
                        className="right print:hidden"
                        style={{
                          width: 22,
                          textAlign: 'right',
                        }}
                      >
                        {renderDocumentLineButton(item)}
                      </div>
                    ) : null}
                  </div>

                  {renderDocumentLineEditorPanel(item)}
                </div>
              )
            })}
          </div>

          <div className="hr-solid" />
        </div>

        <div className="no-break" style={{ marginTop: 5 }}>
          <div className="row mono">
            <div className="left label">รวมเงิน</div>
            <div className="right">{formatCurrency(beforeVat)} ฿</div>
          </div>
          <div className="row mono">
            <div className="left label">ภาษีมูลค่าเพิ่ม {vatRate}%</div>
            <div className="right">{formatCurrency(vatAmount)} ฿</div>
          </div>

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

          {shouldShowChange && (
            <div className="row mono">
              <div className="left label">เงินทอน</div>
              <div className="right">{formatCurrency(change)} ฿</div>
            </div>
          )}

          <div className="hr" />
          <div
            className="row mono"
            style={{
              fontWeight: 800,
              fontSize: adaptiveTotalStyle.fontSize,
              letterSpacing: adaptiveTotalStyle.letterSpacing,
              marginTop: 8,
              alignItems: 'baseline',
              gap: adaptiveTotalStyle.gap,
              whiteSpace: 'nowrap',
            }}
          >
            <div className="left clip">{totalLabel}</div>
            <div className="right">{totalAmountText}</div>
          </div>
          <div className="text-center xs" style={{ marginTop: 5 }}>(ราคารวมภาษีมูลค่าเพิ่มแล้ว)</div>
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

          <div className="hr" />
          <div className="mono xs" style={{ letterSpacing: '1.6px' }}>
            {config?.footerCode || sale.code}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(BillLayoutShortTax)
