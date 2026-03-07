
// ===============================
// features/bill/components/BillLayoutFullTax.jsx
// ===============================
import React, { useEffect, useRef, useState } from 'react';

const formatCurrency = (val) => (Number(val) || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// ✅ rounding helper (2 decimals) to prevent float drift on print
const round2 = (n) => Number((Number(n || 0)).toFixed(2));

// ✅ Thai Baht text (production-safe, no external deps)
const bahtText = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 'ศูนย์บาทถ้วน';

  const fixed = round2(n);
  const abs = Math.abs(fixed);
  const baht = Math.floor(abs);
  const satang = Math.round((abs - baht) * 100);

  const digit = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const unit = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

  const readUnderMillion = (num) => {
    if (!num) return '';
    let out = '';
    const s = String(num).padStart(6, '0');
    for (let i = 0; i < 6; i += 1) {
      const d = Number(s[i]);
      const pos = 6 - i - 1;
      if (d === 0) continue;

      if (pos === 1) {
        // tens
        if (d === 1) out += 'สิบ';
        else if (d === 2) out += 'ยี่สิบ';
        else out += `${digit[d]}สิบ`;
      } else if (pos === 0) {
        // ones
        if (d === 1 && num > 1 && Number(s[4]) !== 0) out += 'เอ็ด';
        else out += digit[d];
      } else {
        out += `${digit[d]}${unit[pos]}`;
      }
    }
    return out;
  };

  const readNumber = (num) => {
    if (num === 0) return 'ศูนย์';
    let out = '';
    let n2 = num;
    let first = true;
    while (n2 > 0) {
      const chunk = n2 % 1_000_000;
      if (chunk) {
        const chunkText = readUnderMillion(chunk);
        out = first ? chunkText + out : chunkText + 'ล้าน' + out;
      } else if (!first) {
        // keep ล้าน placeholders only when higher chunks exist (handled by concatenation)
      }
      n2 = Math.floor(n2 / 1_000_000);
      first = false;
    }
    return out;
  };

  const sign = fixed < 0 ? 'ลบ' : '';
  const bahtTextPart = `${sign}${readNumber(baht)}บาท`;
  const satangTextPart = satang === 0 ? 'ถ้วน' : `${readNumber(satang)}สตางค์`;
  return bahtTextPart + satangTextPart;
};

const BillLayoutFullTax = ({ sale, saleItems, payments, config }) => {
  // Hooks must be called unconditionally at the top of the component
  const [hideDate, setHideDate] = useState(Boolean(config?.hideDate));
  const hideDateTouchedRef = useRef(false);

  // ✅ sync initial hideDate from config when data arrives (but don't override user's toggle)
  useEffect(() => {
    if (hideDateTouchedRef.current) return;
    setHideDate(Boolean(config?.hideDate));
  }, [config?.hideDate]);

  if (!sale || !saleItems || !payments || !config) return null;

  // ✅ VAT rate: prefer Sale snapshot, fallback to config, then 7
  const vatRate = Number.isFinite(Number(sale?.vatRate))
    ? Number(sale.vatRate)
    : (Number.isFinite(Number(config?.vatRate)) ? Number(config.vatRate) : 7);

  // ✅ Totals must come from Sale (snapshot at time of sale) — product prices can change later
  // Sale.totalAmount = GROSS (รวม VAT)
  // Sale.vat        = VAT (ถอดจาก gross ไว้แล้ว)
  let total = round2(Number(sale?.totalAmount ?? sale?.total ?? sale?.grandTotal ?? 0) || 0);

  // Prefer stored VAT from DB; if missing, extract from gross using rate
  const vatRaw = sale?.vat ?? sale?.vatAmount;
  let vatAmount = Number.isFinite(Number(vatRaw))
    ? round2(Number(vatRaw))
    : round2(total * vatRate / (100 + vatRate));

  let beforeVat = round2(total - vatAmount);

  // ✅ Guard against rounding drift: lock (beforeVat + vatAmount) === total
  if (round2(beforeVat + vatAmount) !== total) {
    vatAmount = round2(total * vatRate / (100 + vatRate));
    beforeVat = round2(total - vatAmount);
  }

  const maxRowCount = 20;
  const emptyRowCount = Math.max(maxRowCount - saleItems.length, 0);
  const handlePrint = () => {
    try {
      window.focus?.();
      window.print?.();
    } catch {
      // ignore
    }
  };

  const getDisplayCustomerName = (customer) => {
    if (!customer) return '-';
    if (['GOVERNMENT', 'ORGANIZATION'].includes(customer.type)) return customer.companyName || '-';
    return customer.name || '-';
  };

  // ✅ address single source of truth: prefer pre-composed address string from BE
  const getCustomerAddressText = (customer) => {
    if (!customer) return '-';
    return customer.customerAddress || customer.address || '-';
  };

  const getCustomerPhoneText = (customer) => {
    if (!customer) return '-';
    return customer.phone || customer.phoneNumber || '-';
  };

  const getCustomerTaxIdText = (customer) => {
    if (!customer) return '-';
    return customer.taxId || customer.taxNo || '-';
  };

  const renderDate = (iso) => {
    if (hideDate) {
      return <span className="inline-block border-b border-black w-[120px] h-[18px] align-bottom" />;
    }
    if (!iso) return '-';
    if (config?.formatThaiDate) return config.formatThaiDate(iso);
    try {
      return new Date(iso).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Bangkok',
      });
    } catch {
      return String(iso);
    }
  };

  return (
    <>
      <style>{`
        /* ✅ TH Sarabun New (must be available in /public/fonts)
           Recommended files:
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

        /* Print stability for A4 */
        @media print {
          html, body {
            margin: 0;
            padding: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 10mm;
          }

          /* Avoid breaking critical blocks */
          .no-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          table { page-break-inside: auto; }
          tr, td, th { page-break-inside: avoid; break-inside: avoid; }

          /* Keep the page at natural height on print */
          .print-a4 {
            width: 210mm !important;
            min-height: 297mm !important;
            height: auto !important;
          }
        }
      `}</style>
      <div className="w-full max-w-[794px] mx-auto mb-4 text-right print:hidden">
        <label className="inline-flex items-center gap-2 px-5 text-sm">
          <input
            type="checkbox"
            checked={hideDate}
            onChange={(e) => {
              hideDateTouchedRef.current = true;
              setHideDate(e.target.checked);
            }}
            className="w-5 h-5"
          />
          <span className="text-base ml-2">ไม่แสดงวันที่ในเอกสาร</span>
        </label>
        <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-4">
          พิมพ์บิล
        </button>
      </div>

      <div
        className="w-full overflow-hidden mx-auto text-sm border border-gray-600 px-4 pt-4 pb-2 flex flex-col rounded-md print-a4"
        style={{ width: '210mm', minHeight: '297mm', height: 'auto', fontFamily: 'TH Sarabun New, sans-serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-2 mb-2 gap-3 no-break">
          <div className="flex items-start gap-3">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="logo" className="w-16 h-16 object-contain print:mt-1" />
            ) : null}
            <div>
              <h2 className="font-bold text-sm">{config.branchName}</h2>
              <p>ที่อยู่: {config.address}</p>
              <p>โทร: {config.phone}</p>
              <p>เลขประจำตัวผู้เสียภาษี: {config.taxId}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="border border-gray-600 px-2 py-1 font-bold rounded-md leading-tight text-xs">
              ต้นฉบับลูกค้า<br />CUSTOMER ORIGINAL
            </p>
          </div>
        </div>

        <h3 className="text-center font-bold underline text-lg mb-4">
          ใบเสร็จรับเงิน / ใบกำกับภาษี<br />TAX INVOICE ORIGINAL / DELIVERY ORDER
        </h3>

        {/* Customer & Sale Info */}
        <div className="grid grid-cols-[2.8fr_1.7fr] gap-4 text-sm mb-4 no-break">
          <div className="doc-box border border-black p-2 rounded-lg space-y-1 leading-tight">
            <p>ลูกค้า: {getDisplayCustomerName(sale.customer)}</p>
            <p>ที่อยู่: {getCustomerAddressText(sale.customer)}</p>
            <p>โทร: {getCustomerPhoneText(sale.customer)}</p>
            <p>เลขประจำตัวผู้เสียภาษี: {getCustomerTaxIdText(sale.customer)}</p>
          </div>

          <div className="doc-box border border-black p-2 rounded-lg space-y-1">
            <p>วันที่: {renderDate(sale.soldAt || sale.createdAt)}</p>
            <p>เลขที่: {sale.code || sale.saleNo || sale.id}</p>
            <p>เงื่อนไขการชำระเงิน: {sale.paymentTerms || '-'}</p>
            
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-xs mb-2 border border-black">
          <thead className="bg-gray-100">
            <tr className="border-b border-black">
              <th className="border border-black px-1 h-[28px] leading-tight w-[7%]">ลำดับ<br />ITEM</th>
              <th className="border border-black px-1 h-[28px] leading-tight w-[39%]">รายการ<br />DESCRIPTION</th>
              <th className="border border-black px-1 h-[28px] leading-tight w-[8%]">จำนวน<br />QTY</th>
              <th className="border border-black px-1 h-[28px] leading-tight w-[7%]">หน่วย<br />UNIT</th>
              <th className="border border-black px-1 h-[28px] leading-tight w-[19%]">ราคาต่อหน่วย<br />UNIT PRICE</th>
              <th className="border border-black px-1 h-[28px] leading-tight w-[20%]">จำนวนเงิน<br />AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {saleItems.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-black px-1 text-center h-[28px]">{index + 1}</td>
                <td className="border border-black px-1 h-[28px]">
                  {item.productName}
                </td>
                <td className="border border-black px-1 text-center h-[28px]">{item.quantity}</td>
                <td className="border border-black px-1 text-center h-[28px]">{item.unit || '-'}</td>
                <td className="border border-black px-1 text-right h-[28px]">{
                  formatCurrency(
                    (() => {
                      const qty = Number(item?.quantity) || 0;
                      // ✅ Full price (INC VAT) like Delivery Note
                      // ✅ snapshot only (do NOT use current Product price fields)
                      const explicit = item?.unitPriceIncVat ?? item?.unitPrice;
                      if (explicit != null && Number.isFinite(Number(explicit))) return round2(explicit);

                      // fallback: if only EX VAT is present, gross-up using vatRate
                      const ex = item?.unitPriceExVat;
                      if (ex != null && Number.isFinite(Number(ex))) {
                        return round2(Number(ex) * (1 + vatRate / 100));
                      }

                      // last resort: derive from total / qty
                      const totalInc = item?.amount ?? item?.total ?? item?.totalAmount;
                      if (qty > 0 && totalInc != null && Number.isFinite(Number(totalInc))) {
                        return round2(Number(totalInc) / qty);
                      }
                      return 0;
                    })()
                  )
                }</td>
                <td className="border border-black px-1 text-right h-[28px]">{
                  formatCurrency(
                    (() => {
                      const qty = Number(item?.quantity) || 0;
                      const explicitAmount = item?.amount ?? item?.total ?? item?.totalAmount;
                      if (explicitAmount != null && Number.isFinite(Number(explicitAmount))) return round2(explicitAmount);

                      // fallback: compute from snapshot unit price only (do NOT use current Product price fields)
                      const explicitUnit = item?.unitPriceIncVat ?? item?.unitPrice;
                      if (explicitUnit != null && Number.isFinite(Number(explicitUnit))) {
                        return round2(Number(explicitUnit) * qty);
                      }

                      // fallback: gross-up EX VAT total
                      const exTotal = item?.totalExVat;
                      if (exTotal != null && Number.isFinite(Number(exTotal))) {
                        return round2(Number(exTotal) * (1 + vatRate / 100));
                      }
                      return 0;
                    })()
                  )
                }</td>
              </tr>
            ))}
            {[...Array(emptyRowCount)].map((_, idx) => (
              <tr key={`empty-${idx}`}>
                <td className="border border-black px-1 text-center h-[28px]">&nbsp;</td>
                <td className="border border-black px-1 h-[28px]">&nbsp;</td>
                <td className="border border-black px-1 text-center h-[28px]">&nbsp;</td>
                <td className="border border-black px-1 text-center h-[28px]">&nbsp;</td>
                <td className="border border-black px-1 text-right h-[28px]">&nbsp;</td>
                <td className="border border-black px-1 text-right h-[28px]">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 text-xs mt-auto pt-4 no-break" style={{ minHeight: '130px' }}>
          <div className="leading-tight flex flex-col items-center justify-start text-center pt-3">
            <p className="font-bold">จำนวนเงินเป็นตัวอักษร</p>
            <p className="italic text-base font-semibold">({bahtText(total)})</p>
          </div>
          <div>
            <p className="flex justify-between border-t border-black border-b py-1">
              <span>รวมเงิน</span>
              <span>{formatCurrency(beforeVat)} ฿</span>
            </p>
            <p className="flex justify-between border-b border-black py-1">
              <span>ภาษีมูลค่าเพิ่ม {vatRate}%</span>
              <span>{formatCurrency(vatAmount)} ฿</span>
            </p>
            <p className="flex justify-between border-b border-black font-extrabold text-base py-1 bg-gray-100">
              <span>จำนวนเงินรวมทั้งสิ้น</span>
              <span>{formatCurrency(total)} ฿</span>
            </p>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-5 text-sm text-center no-break">
          <div className="w-[48%] mx-auto">
            <div className="border-t border-dashed border-black pt-1 h-[45px] flex flex-col justify-start items-center">
              <span className="mt-1">ผู้รับเงิน / RECEIVED BY</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(BillLayoutFullTax);

