




// src/features/deliveryNote/components/DeliveryNoteForm.jsx

// ✅ DeliveryNoteForm ปรับโครงสร้างให้ตรงกับ BillLayoutFullTax 100%
import React from 'react';

const DeliveryNoteForm = ({ sale, saleItems, config, hideDate, setHideDate }) => {
  if (!sale || !saleItems || !config) {
    return <div className="p-4 text-center text-gray-600">ไม่พบข้อมูลใบส่งของ</div>;
  }

  const formatThaiDate = (dateString) => {
    if (!dateString) return '-';
    const thMonths = ['', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543;
    return `${day} ${thMonths[month]} ${year}`;
  };

    const formatCurrency = (val) => {
    const num = Number.parseFloat(val ?? 0);
    if (!Number.isFinite(num)) return '0.00';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const vatRate = Number.isFinite(Number(sale.vatRate)) ? Number(sale.vatRate) : 7;

  // ✅ numeric helpers (production-safe)
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const round2 = (n) => Number((toNumber(n)).toFixed(2));

  // ✅ Line calculator (VAT-INCLUDED standard)
  // - หน้างาน/ระบบนี้ถือว่า “ราคาขาย” เป็น INC-VAT (Gross) เป็นหลัก
  // - หลีกเลี่ยงการ gross-up จาก EX-VAT เพื่อตัดปัญหา VAT ซ้ำ
  // - ถ้ามี split (base+vat) จาก BE ให้ใช้เป็น truth ได้เลย
  const calcLine = (item) => {
    const qty = toNumber(item?.quantity);
    const discount = toNumber(item?.discount);

    // Prefer explicit EX/VAT splits (most reliable)
    const baseUnitRaw = item?.basePrice ?? item?.unitPriceExVat ?? item?.priceExVat;
    const vatUnitRaw = item?.vatAmount ?? item?.vatPerUnit;

    if (baseUnitRaw != null && vatUnitRaw != null) {
      const baseUnit = Math.max(toNumber(baseUnitRaw) - discount, 0);
      const vatUnit = toNumber(vatUnitRaw);
      const unitInc = round2(baseUnit + vatUnit);
      const beforeVat = round2(baseUnit * qty);
      const vatAmount = round2(vatUnit * qty);
      const total = round2(beforeVat + vatAmount);
      return { qty, unitInc, beforeVat, vatAmount, total };
    }

    // If we only have an explicit INC-VAT price, use it directly (VAT-included)
    const incUnitRaw = item?.priceIncVat ?? item?.unitPriceIncVat ?? item?.unitPrice ?? item?.sellPrice;
    if (incUnitRaw != null) {
      const unitInc = round2(Math.max(toNumber(incUnitRaw) - discount, 0));
      const total = round2(unitInc * qty);

      // ✅ Extract VAT from gross (supports future VAT change: 7% → 10% etc.)
      const vatAmount = round2(total > 0 ? (total * vatRate) / (100 + vatRate) : 0);
      const beforeVat = round2(total - vatAmount);

      return { qty, unitInc, beforeVat, vatAmount, total };
    }

    // Fallback (VAT-included): treat item.price as INC-VAT (Gross)
    // (กันเคส field name ต่างกัน / legacy payload)
    const unitInc = round2(Math.max(toNumber(item?.price) - discount, 0));
    const total = round2(unitInc * qty);

    const vatAmount = round2(total > 0 ? (total * vatRate) / (100 + vatRate) : 0);
    const beforeVat = round2(total - vatAmount);

    return { qty, unitInc, beforeVat, vatAmount, total };
  };

  // ✅ Totals (no VAT double-count)
  const computedTotals = saleItems.reduce(
    (acc, item) => {
      const ln = calcLine(item);
      acc.beforeVat += ln.beforeVat;
      acc.vatAmount += ln.vatAmount;
      acc.total += ln.total;
      return acc;
    },
    { beforeVat: 0, vatAmount: 0, total: 0 }
  );

  // ✅ Totals (VAT-INC pricing): ราคาต่อหน่วยในตารางเป็น "รวม VAT แล้ว" (Gross)
  // ดังนั้น:
  // - รวมทั้งสิ้น (Gross) = ผลรวมบรรทัดทั้งหมด
  // - VAT = ถอด VAT จาก Gross ด้วยสูตร vat = gross * r / (100 + r)
  // - รวมเงิน (ก่อน VAT) = gross - vat
  //
  // หมายเหตุ: ถ้า BE ส่ง totalAmount/vat มา อาจเป็นคนละนิยาม (INC/EX) ตามจุดใช้งาน
  // สำหรับเอกสารนี้ให้ยึดตาม “ราคาที่แสดงในบรรทัด” เป็น source of truth เพื่อไม่ให้ VAT ซ้ำ/เพี้ยน
  const computedGross = round2(computedTotals.total);

  // ถ้ามี totalAmount จาก BE และมันใกล้เคียงกับ computedGross ให้ใช้เป็น gross (กัน drift จากการปัดเศษ)
  const saleTotalMaybe = Number.isFinite(Number(sale?.totalAmount)) ? round2(Number(sale.totalAmount)) : null;
  const gross = saleTotalMaybe != null && Math.abs(saleTotalMaybe - computedGross) <= 0.05
    ? saleTotalMaybe
    : computedGross;

  const vatAmount = round2(gross > 0 ? (gross * vatRate) / (100 + vatRate) : 0);
  const beforeVat = round2(gross - vatAmount);
  const total = gross;
  // ✅ Pagination (Production-grade)
  // เป้าหมาย:
  // - เอกสารไม่ล้น A4 แน่นอน
  // - รองรับหลายหน้าอัตโนมัติ
  // - Summary + Signature อยู่เฉพาะ “หน้าสุดท้าย” เท่านั้น
  // - มีเลขหน้า X/Y
  //
  // แนวคิด:
  // - หน้าสุดท้ายต้องเผื่อพื้นที่ให้ Summary + Signature → จำกัดแถวต่ำกว่า
  // - หน้ากลาง ๆ ไม่มี Summary/Signature → ใส่แถวได้มากกว่า
  // หมายเหตุ: ปัญหาล้นหน้าไม่ได้เกิดจากจำนวนแถวอย่างเดียว
  // แต่เกิดจาก layout ความสูงรวม (header + table + footer)
  // ดังนั้น pagination จะใช้ค่าปลอดภัย
  const MAX_ROWS_LAST_PAGE = 20;
  const MAX_ROWS_NORMAL_PAGE = 24;

  const paginateItems = (items) => {
    const src = Array.isArray(items) ? items : [];
    const pages = [];

    // ถ้ารายการ <= last-page capacity → 1 หน้า (พร้อม footer)
    if (src.length <= MAX_ROWS_LAST_PAGE) {
      pages.push({ items: src, isLast: true });
      return pages;
    }

    // ถ้าเกิน → ตัดหน้าแบบ “กันล้นแน่นอน”
    // - ปาดด้วย NORMAL_PAGE จนกว่า remainder จะ <= LAST_PAGE
    let i = 0;
    while (src.length - i > MAX_ROWS_LAST_PAGE) {
      pages.push({ items: src.slice(i, i + MAX_ROWS_NORMAL_PAGE), isLast: false });
      i += MAX_ROWS_NORMAL_PAGE;
    }
    pages.push({ items: src.slice(i), isLast: true });
    return pages;
  };

  const pages = paginateItems(saleItems);

  // ✅ Running index across pages (avoid relying on MAX_ROWS_* which can change)
  const pageOffsets = (() => {
    const out = [];
    let acc = 0;
    for (const p of pages) {
      out.push(acc);
      acc += Array.isArray(p?.items) ? p.items.length : 0;
    }
    return out;
  })();

  const handlePrint = () => window.print();

  const getDisplayCustomerName = (customer) => {
    if (!customer) return '-';
    if (['GOVERNMENT', 'ORGANIZATION'].includes(customer.type)) return customer.companyName || '-';
    return customer.name || '-';
  };

  return (
    <>
      <style>{`
        /* ✅ Delivery Note print guardrails (A4-safe) */
        @media print {
          html, body { margin: 0; padding: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4; margin: 10mm; }

          /* Reduce outer box so it never exceeds printable area (account for printer margins) */
          .dn-print-page {
            box-sizing: border-box;
            width: 190mm !important;
            min-height: 277mm !important; /* 297mm - (10mm top + 10mm bottom) */
            height: auto !important;
            padding: 6mm !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }

          /* Keep critical blocks together when possible */
          .dn-no-break { page-break-inside: avoid; break-inside: avoid; }
          table { page-break-inside: auto; }
          tr, td, th { page-break-inside: avoid; break-inside: avoid; }

          /* Footer density (last page) */
          .dn-summary { min-height: 110px !important; padding-top: 6px !important; }

          /* ✅ Signatures must hug the bottom edge (ERP-grade) */
          .dn-signatures {
            position: absolute !important;
            left: 6mm !important;
            right: 6mm !important;
            bottom: 3mm !important; /* แนบขอบล่างมากที่สุดโดยยังปลอดภัยต่อ printer margin */
            padding-top: 0 !important;
          }
          .dn-signatures p { min-height: 60px !important; }
        }

        /* Screen preview: keep signatures pinned near bottom too */
        .dn-signatures {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 10px;
        }
      `}</style>
      <div className="w-full max-w-[794px] mx-auto mb-4 text-right print:hidden">
        <label className="inline-flex items-center gap-2 px-5 text-sm">
          <input
            type="checkbox"
            checked={hideDate}
            onChange={(e) => setHideDate(e.target.checked)}
            className="w-5 h-5"
          />
          <span className="text-base ml-2">ไม่แสดงวันที่ในเอกสาร</span>
        </label>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-4"
        >
          พิมพ์ใบส่งของ
        </button>
      </div>

      {pages.map((pg, pageIndex) => {
        const isLast = Boolean(pg?.isLast);
        const pageItems = Array.isArray(pg?.items) ? pg.items : [];

        const rowCap = isLast ? MAX_ROWS_LAST_PAGE : MAX_ROWS_NORMAL_PAGE;
        const emptyRowCount = Math.max(rowCap - pageItems.length, 0);

        return (
          <div
            key={`dn-page-${pageIndex + 1}`}
            className="w-full overflow-hidden mx-auto text-sm border border-gray-600 px-4 pt-4 pb-2 flex flex-col rounded-md relative print:overflow-visible dn-print-page"
            style={{
              width: '190mm',
              // ❗ อย่าบังคับ height = 297mm เพราะ browser print margin + scaling
              // จะทำให้เนื้อหาถูกดันเกิน A4
              // ใช้ minHeight แทนเพื่อให้ layout ยืดหยุ่นตาม printer
              minHeight: '277mm',
              fontFamily: 'TH Sarabun New, sans-serif',
              pageBreakAfter: isLast ? 'auto' : 'always',
              breakAfter: isLast ? 'auto' : 'page',
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2 mb-2 dn-no-break">
              <div>
                <h2 className="font-bold text-sm">{config.branchName}</h2>
                <p>ที่อยู่: {config.address}</p>
                <p>โทร: {config.phone}</p>
                <p>เลขประจำตัวผู้เสียภาษี: {config.taxId}</p>
              </div>
              <div className="text-right">
                <p className="border border-gray-400 px-2 py-1 font-bold rounded-md text-xs">
                  ต้นฉบับลูกค้า<br />CUSTOMER ORIGINAL
                </p>
              </div>
            </div>

            <h3 className="text-center font-bold underline text-lg mb-4 dn-no-break">
              ใบส่งของ<br />DELIVERY NOTE
            </h3>

            {/* Customer & Sale Info */}
            <div className="grid grid-cols-[2.8fr_1.7fr] gap-4 text-sm mb-4 dn-no-break">
              <div className="border border-black p-2 rounded-lg space-y-1">
                <p>ลูกค้า: {getDisplayCustomerName(sale.customer)}</p>
                <p>ที่อยู่: {sale.customer?.address || '-'}</p>
                <p>โทร: {sale.customer?.phone || '-'}</p>
                <p>เลขประจำตัวผู้เสียภาษี: {sale.customer?.taxId || '-'}</p>
              </div>

              <div className="border border-black p-2 rounded-lg space-y-1">
                <p>
                  วันที่:{' '}
                  {hideDate ? (
                    <span className="inline-block border-b border-black w-[120px] h-[18px] align-bottom" />
                  ) : (
                    formatThaiDate(sale.soldAt)
                  )}
                </p>

                <p>เลขที่: {sale.code}</p>
                <p>เงื่อนไขการชำระเงิน: {sale.paymentTerms || '-'}</p>
                <p>วันที่ครบกำหนด: {sale.dueDate ? formatThaiDate(sale.dueDate) : '-'}</p>
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-xs mb-2 border border-black">
              <thead className="bg-gray-100">
                <tr className="border-b border-black">
                  <th className="border border-black px-1 h-[24px]">ลำดับ<br />ITEM</th>
                  <th className="border border-black px-1 h-[24px]">รายการ<br />DESCRIPTION</th>
                  <th className="border border-black px-1 h-[24px]">จำนวน<br />QTY</th>
                  <th className="border border-black px-1 h-[24px]">หน่วย<br />UNIT</th>
                  <th className="border border-black px-1 h-[24px]">ราคาต่อหน่วย<br />UNIT PRICE</th>
                  <th className="border border-black px-1 h-[24px]">จำนวนเงิน<br />AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item, index) => {
                  const ln = calcLine(item);
                  const runningIndex = (pageOffsets[pageIndex] ?? 0) + index; // display continuity
                  return (
                    <tr key={item.id ?? item.stockItemId ?? `row-${pageIndex}-${index}`}>
                      <td className="border border-black px-1 text-center h-[24px]">{runningIndex + 1}</td>
                      <td className="border border-black px-1 h-[24px]">{item.productName}</td>
                      <td className="border border-black px-1 text-center h-[24px]">{ln.qty}</td>
                      <td className="border border-black px-1 text-center h-[24px]">{item.unit || '-'}</td>
                      <td className="border border-black px-1 text-right h-[24px]">{formatCurrency(ln.unitInc)}</td>
                      <td className="border border-black px-1 text-right h-[24px]">{formatCurrency(ln.total)}</td>
                    </tr>
                  );
                })}
                {[...Array(emptyRowCount)].map((_, idx) => (
                  <tr key={`empty-${pageIndex}-${idx}`}>
                    <td className="border border-black px-1 text-center h-[24px]">&nbsp;</td>
                    <td className="border border-black px-1 h-[24px]">&nbsp;</td>
                    <td className="border border-black px-1 text-center h-[24px]">&nbsp;</td>
                    <td className="border border-black px-1 text-center h-[24px]">&nbsp;</td>
                    <td className="border border-black px-1 text-right h-[24px]">&nbsp;</td>
                    <td className="border border-black px-1 text-right h-[24px]">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary + Signatures: ONLY last page */}
            {isLast ? (
              <>
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 text-xs pt-3 dn-summary dn-no-break  " style={{ minHeight: '70px' }}>
                  <div>
                    <ul className="list-decimal ml-4">
                      <li>
                        สินค้าตามรายการข้างต้น แม้จะได้ส่งมอบแก่ผู้ซื้อแล้ว ก็ยังเป็นทรัพย์สินของผู้ขาย
                        จนกว่าผู้ซื้อจะได้ชำระเงินเสร็จเรียบร้อยแล้ว
                      </li>
                      <li>เครื่องคอมพิวเตอร์ทุกเครื่อง ทางผู้ขายไม่ได้ติดตั้งซอฟแวร์</li>
                      <li>
                        ทางร้านขอสงวนสิทธิ์ในการนำใบส่งของฉบับนี้ยื่นการในนาม<br />
                        {config.branchName}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="flex justify-between border-t border-black border-b py-1">
                      <span>รวมเงิน</span>
                      <span>{formatCurrency(beforeVat)} ฿</span>
                    </p>
                    <p className="flex justify-between border-b border-black py-1">
                      <span>ภาษีมูลค่าเพิ่ม / VAT</span>
                      <span>{formatCurrency(vatAmount)} ฿</span>
                    </p>
                    <p className="flex justify-between border-b border-black font-extrabold text-base py-1 bg-gray-100">
                      <span>จำนวนเงินรวมทั้งสิ้น</span>
                      <span>{formatCurrency(total)} ฿</span>
                    </p>
                  </div>
                </div>

                <div className="h-[80px]"></div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-4 text-sm text-center pt-2 pb-0 dn-signatures dn-no-break">
                  <div>
                    <p className="border-t border-black pt-2 pb-6 min-h-[80px]">ผู้รับของ / RECEIVED BY</p>
                  </div>
                  <div>
                    <p className="border-t border-black pt-2 pb-6 min-h-[80px]">ผู้ส่งของ / DELIVERED BY</p>
                  </div>
                  <div>
                    <p className="border-t border-black pt-2 pb-6 min-h-[80px]">ผู้อนุมัติ / AUTHORIZED BY</p>
                  </div>
                </div>
              </>
            ) : (
              // spacer กัน layout กระโดด (ให้ความสูงหน้าดูนิ่ง)
              <div className="mt-auto" />
            )}

            {/* Page number */}
            <div className="absolute bottom-2 right-4 text-xs text-gray-400">
              {pageIndex + 1}/{pages.length}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default DeliveryNoteForm;






