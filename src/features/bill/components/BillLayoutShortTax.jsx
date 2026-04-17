




// src/features/bill/components/BillLayoutShortTax.jsx
// ✅ Standard Document System Applied:
// - Unified font: Tahoma, Arial
// - Unified spacing rhythm
// - Unified customer phone source (user.loginId)
// - Unified number formatting (tabular-nums)
// - Consistent section spacing across documents


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

// ✅ unit price resolver (SNAPSHOT ONLY)
// ❗ ห้ามใช้ราคาจาก Product/current fields (เช่น item.price, sellPrice) เพราะราคาเปลี่ยนย้อนหลังได้
// เราจะยึดจาก SaleItem snapshot เท่านั้น:
// - unitPriceIncVat / unitPrice (preferred)
// - derive from amount/qty (last resort)
const getUnitPrice = (item) => {
  if (!item) return 0;

  // ✅ snapshot candidates (INC-VAT)
  const candidates = [
    item.unitPriceIncVat,
    item.unitPrice, // assume INC-VAT snapshot in this system
    item.lineUnitPrice,
  ];

  for (const v of candidates) {
    const num = n(v);
    if (num > 0) return num;
  }

  // ✅ last resort: derive from line amount / qty (also snapshot)
  const qty = n(item?.quantity);
  const amount = n(item?.amount ?? item?.total ?? item?.totalAmount);
  if (qty > 0 && amount > 0) return round2(amount / qty);

  return 0;
};

// ✅ line total (snapshot-first)
// - Prefer item.amount (snapshot) if present
// - Otherwise compute from unit * qty using satang math
const getLineTotalSatang = (item) => {
  const amount = n(item?.amount ?? item?.total ?? item?.totalAmount);
  if (amount > 0) return Math.round(amount * 100);

  const qty = n(item?.quantity);
  const unit = getUnitPrice(item);
  const unitSatang = Math.round(unit * 100);
  return unitSatang * qty;
}

const BillLayoutShortTax = ({ sale, saleItems, payments, config, hideContactName }) => {
  const receiptTitle = 'ใบกำกับภาษีอย่างย่อ / ใบเสร็จรับเงิน';

  const getAdaptiveTitleStyle = (text) => {
    const len = String(text || '').trim().length;

    if (len >= 34) {
      return {
        fontSize: '12.5px',
        letterSpacing: '0px',
        padding: '8px 4px 7px',
      };
    }

    if (len >= 28) {
      return {
        fontSize: '13px',
        letterSpacing: '0.05px',
        padding: '8px 5px 7px',
      };
    }

    return {
      fontSize: '14px',
      letterSpacing: '0.2px',
      padding: '8px 6px 7px',
    };
  };

  const getAdaptiveTotalStyle = (label, amountText) => {
    const len = `${label || ''}${amountText || ''}`.trim().length;

    if (len >= 26) {
      return {
        fontSize: '16px',
        letterSpacing: '0px',
        gap: '8px',
      };
    }

    if (len >= 22) {
      return {
        fontSize: '17px',
        letterSpacing: '0.05px',
        gap: '10px',
      };
    }

    return {
      fontSize: '18px',
      letterSpacing: '0.1px',
      gap: '12px',
    };
  };
  const getCustomerPhoneText = (customer) => {
    if (!customer) return '-';
    return customer.user?.loginId || customer.phone || customer.phoneNumber || '-';
  };
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

  // ✅ Total/VAT (Production Lock: Sale snapshot is source of truth)
// - totalAmount = GROSS (รวม VAT)
// - vat        = VAT amount (ถ้ามีใน DB ใช้ตรง ๆ)
// - beforeVat  = totalAmount - vat
// ❗ ห้ามเอายอดรวมมาคำนวณจาก SaleItem (กันราคาเปลี่ยนย้อนหลัง + กัน VAT ซ้ำ)
const vatRate = Number.isFinite(Number(sale?.vatRate))
  ? Number(sale.vatRate)
  : (typeof config?.vatRate === 'number' ? config.vatRate : 7);

const saleTotalCandidateBaht =
  n(sale?.totalAmount) ||
  n(sale?.total) ||
  n(sale?.grandTotal) ||
  n(sale?.totalPremium);

const total = round2(saleTotalCandidateBaht);

// ✅ VAT: prefer stored; fallback ถอดจาก gross ตาม rate
const vatStored = sale?.vat != null ? round2(n(sale.vat)) : null;
const vatAmount = vatStored != null ? vatStored : round2((total * vatRate) / (100 + vatRate));

const beforeVat = round2(total - vatAmount);

  const totalLabel = 'จำนวนเงินรวมทั้งสิ้น';
  const totalAmountText = `${formatCurrency(total)} ฿`;
  const adaptiveTotalStyle = getAdaptiveTotalStyle(totalLabel, totalAmountText);

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
        width: '76mm',
        minHeight: 'auto',
        fontFamily: 'Tahoma, Arial, sans-serif',
        fontSize: config?.thermalFontSize || '13px',
        lineHeight: 1.3,
        /* backup padding (กันเคส browser บางตัว ignore @page margin) */
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
            /* ✅ 80mm thermal with safe zone */
            size: 80mm auto;
            /* Premium safe margins (ลดเสี่ยงตัวอักษรกินขอบ/โดนตัด) */
            margin: 3mm 3mm 3mm 3mm;
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

        /* ✅ Inner safe padding (keeps text away from edges even when root is 76mm) */
        .receipt-inner {
          width: 100%;
          /* Premium safe zone inside content */
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

        /* ✅ Micro rhythm */
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
      `}</style>

      <div className="text-right print:hidden mb-2">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded text-sm"
        >
          พิมพ์บิล
        </button>
      </div>

      <div className="receipt-inner">
        {/* Header (thermal-friendly) */}
      <div className="text-center no-break tight">
        {config.logoUrl && <img src={config.logoUrl} alt="logo" className="h-10 mx-auto mb-1" />}
        <div
          className="font-bold"
          style={{
            fontSize: '18px',
            letterSpacing: '0.35px',
            marginBottom: 3,
          }}
        >
          {config.branchName}
        </div>
        {config.address && <div className="small wrap">{config.address}</div>}
        <div className="small mono muted" style={{ letterSpacing: '0.05px' }}>
          {config.phone ? `โทร. ${config.phone}` : ''}
        </div>
        {config.taxId && (
          <div className="small mono muted">เลขผู้เสียภาษี {config.taxId}</div>
        )}
      </div>

      <div className="hr" />

      <div className="no-break tight section-pad" style={{ paddingLeft: 1, paddingRight: 1, marginBottom: 6 }}>
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
        </div>

        <div className="hr-solid" />

        <div>
          {saleItems.map((item) => {
            const qty = n(item?.quantity);
            const unit = getUnitPrice(item);
            const lineTotal = getLineTotalSatang(item) / 100;
            const unitDisplay = unit > 0 ? unit : qty > 0 && lineTotal > 0 ? round2(lineTotal / qty) : 0;

            return (
              <div key={item.id} className="tight" style={{ padding: '5px 0' }}>
                <div className="row">
                  <div className="left wrap">
                    <div className="wrap">{item.productName || '-'}</div>
                  </div>
                  <div className="right mono" style={{ minWidth: 36, textAlign: 'right' }}>{qty || ''}</div>
                  <div className="right mono" style={{ minWidth: 78, textAlign: 'right', letterSpacing: '0.05px', fontWeight: 500 }}>{formatCurrency(lineTotal)}</div>
                </div>
              </div>
            );
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

        {/* Footer code lines (7-11-ish) */}
        <div className="hr" />
        <div className="mono xs" style={{ letterSpacing: '1.6px' }}>
          {config?.footerCode || sale.code}
        </div>
        <div className="mono xs" style={{ marginTop: 2 }}>
          {config?.footerCode2 || (sale?.id ? `TXN-${sale.id}` : '')}
        </div>
      </div>
      </div>
    </div>
  )
}

// ✅ memo ป้องกัน re-render ตอนเปิด print window
export default React.memo(BillLayoutShortTax)









