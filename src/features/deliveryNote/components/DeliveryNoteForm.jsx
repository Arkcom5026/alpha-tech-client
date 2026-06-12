// src/features/deliveryNote/components/DeliveryNoteForm.jsx

// ✅ DeliveryNoteForm ปรับโครงสร้างให้ตรงกับ BillLayoutFullTax 100%
import React from 'react';
import { buildCustomerFullAddress } from '@features/customer/utils/customerAddressFormatter';

const DeliveryNoteForm = ({
  sale,
  saleItems,
  config,
  hideDate,
  setHideDate,

  // ✅ Document Workspace / Document Line Editor
  editableDocumentLines = false,
  editingLineKey = null,
  lineDrafts = {},
  savingLineKey = null,
  onToggleDocumentLineEdit,
  onChangeDocumentLineDraft,
  onSaveDocumentLine,
}) => {
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
  const calcLine = (item) => {
    const qty = toNumber(item?.quantity);
    const discount = toNumber(item?.discount);

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

    const incUnitRaw = item?.priceIncVat ?? item?.unitPriceIncVat ?? item?.unitPrice ?? item?.sellPrice;
    if (incUnitRaw != null) {
      const unitInc = round2(Math.max(toNumber(incUnitRaw) - discount, 0));
      const total = round2(unitInc * qty);
      const vatAmount = round2(total > 0 ? (total * vatRate) / (100 + vatRate) : 0);
      const beforeVat = round2(total - vatAmount);

      return { qty, unitInc, beforeVat, vatAmount, total };
    }

    const unitInc = round2(Math.max(toNumber(item?.price) - discount, 0));
    const total = round2(unitInc * qty);
    const vatAmount = round2(total > 0 ? (total * vatRate) / (100 + vatRate) : 0);
    const beforeVat = round2(total - vatAmount);

    return { qty, unitInc, beforeVat, vatAmount, total };
  };

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

  const computedGross = round2(computedTotals.total);

  const saleTotalMaybe = Number.isFinite(Number(sale?.totalAmount)) ? round2(Number(sale.totalAmount)) : null;
  const gross = saleTotalMaybe != null && saleTotalMaybe > 0
    ? saleTotalMaybe
    : computedGross;

  const vatAmount = round2(gross > 0 ? (gross * vatRate) / (100 + vatRate) : 0);
  const beforeVat = round2(gross - vatAmount);
  const total = gross;

  const MAX_ROWS_LAST_PAGE = 18;
  const MAX_ROWS_NORMAL_PAGE = 24;

  const paginateItems = (items) => {
    const src = Array.isArray(items) ? items : [];
    const pages = [];

    if (src.length <= MAX_ROWS_LAST_PAGE) {
      pages.push({ items: src, isLast: true });
      return pages;
    }

    let i = 0;
    while (src.length - i > MAX_ROWS_LAST_PAGE) {
      pages.push({ items: src.slice(i, i + MAX_ROWS_NORMAL_PAGE), isLast: false });
      i += MAX_ROWS_NORMAL_PAGE;
    }
    pages.push({ items: src.slice(i), isLast: true });
    return pages;
  };

  const pages = paginateItems(saleItems);

  const pageOffsets = (() => {
    const out = [];
    let acc = 0;
    for (const p of pages) {
      out.push(acc);
      acc += Array.isArray(p?.items) ? p.items.length : 0;
    }
    return out;
  })();

  const handlePrint = () => {
    const originalTitle = document.title;

    try {
      document.title = ' ';
      window.print();
    } finally {
      window.setTimeout(() => {
        document.title = originalTitle;
      }, 500);
    }
  };

  const getDisplayCustomerName = (customer) => {
    if (!customer) return '-';
    if (['GOVERNMENT', 'ORGANIZATION'].includes(customer.type)) return customer.companyName || '-';
    return customer.name || '-';
  };

  const normalizeDocumentLinePart = (value) => {
    if (typeof value !== 'string') return '';
    return value.trim();
  };

  const buildDocumentLineText = (item) => {
    const parts = [
      item?.documentPrefix,
      item?.documentDescription,
      item?.documentSuffix,
    ]
      .map(normalizeDocumentLinePart)
      .filter(Boolean);

    return parts.length > 0 ? parts.join(' ') : item?.productName || '-';
  };

  const getLineKey = (item) => item?.documentLineKey || item?.id || item?.stockItemId || null;

  const renderDocumentLineEditorRow = (item, pageIndex, index) => {
    if (!editableDocumentLines) return null;

    const lineKey = getLineKey(item);
    if (!lineKey || editingLineKey !== lineKey) return null;

    const draft = {
      documentPrefix: item?.documentPrefix || '',
      documentDescription: item?.documentDescription || item?.productName || '',
      documentSuffix: item?.documentSuffix || '',
      ...(lineDrafts?.[lineKey] || {}),
    };

    const isSaving = savingLineKey === lineKey;

    return (
      <tr key={`editor-${lineKey}-${pageIndex}-${index}`} className="print:hidden bg-slate-50">
        <td colSpan={editableDocumentLines ? 7 : 6} className="border border-black px-3 py-2">
          <div className="max-w-[520px] ml-auto mr-0 space-y-2">
            <input
              value={draft.documentPrefix}
              onChange={(e) => onChangeDocumentLineDraft?.(item, 'documentPrefix', e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />

            <input
              value={draft.documentDescription}
              onChange={(e) => onChangeDocumentLineDraft?.(item, 'documentDescription', e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />

            <input
              value={draft.documentSuffix}
              onChange={(e) => onChangeDocumentLineDraft?.(item, 'documentSuffix', e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />

            <div className="text-right">
              <button
                type="button"
                onClick={() => onSaveDocumentLine?.(item)}
                disabled={isSaving}
                className="px-3 py-1 rounded bg-teal-600 text-white text-xs hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      <style>{`
        @media print {
          html, body { margin: 0; padding: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4; margin: 0; }

          .dn-print-page {
            box-sizing: border-box;
            width: 210mm !important;
            min-height: 297mm !important;
            height: auto !important;
            padding: 6mm !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }

          .dn-no-break { page-break-inside: avoid; break-inside: avoid; }
          table { page-break-inside: auto; }
          tr, td, th { page-break-inside: avoid; break-inside: avoid; }

          .dn-summary { min-height: 90px !important; padding-top: 4px !important; }

          .dn-signatures {
            position: absolute !important;
            left: 6mm !important;
            right: 6mm !important;
            bottom: 3mm !important;
            padding-top: 0 !important;
          }
          .dn-signatures p { min-height: 60px !important; }
        }

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
            className="w-full overflow-hidden mx-auto text-sm border border-gray-600 px-5 pt-4 pb-3 flex flex-col rounded-md relative print:overflow-visible dn-print-page"
            style={{
              width: '210mm',
              minHeight: '297mm',
              fontFamily: 'Tahoma, Arial, sans-serif',
              pageBreakAfter: isLast ? 'auto' : 'always',
              breakAfter: isLast ? 'auto' : 'page',
            }}
          >
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

            <div className="grid grid-cols-[2.8fr_1.7fr] gap-4 text-sm mb-4 dn-no-break">
              <div className="border border-black p-3 rounded-lg space-y-1.5">
                <p>ลูกค้า: {getDisplayCustomerName(sale.customer)}</p>
                <p>ที่อยู่: {buildCustomerFullAddress(sale.customer)}</p>
                <p>โทร: {sale.customer?.user?.loginId || sale.customer?.phone || '-'}</p>
                <p>เลขประจำตัวผู้เสียภาษี: {sale.customer?.taxId || '-'}</p>
              </div>

              <div className="border border-black p-3 rounded-lg space-y-1.5">
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

            <table className="w-full text-xs mb-3 border border-black table-fixed">
              <thead className="bg-gray-100">
                <tr className="border-b border-black">
                  <th className="border border-black px-2 h-[24px] w-[7%]">ลำดับ<br />ITEM</th>
                  <th className="border border-black px-2 h-[24px] w-[47%]">รายการ<br />DESCRIPTION</th>
                  <th className="border border-black px-2 h-[24px] w-[8%]">จำนวน<br />QTY</th>
                  <th className="border border-black px-2 h-[24px] w-[8%]">หน่วย<br />UNIT</th>
                  <th className="border border-black px-2 h-[24px] w-[15%] text-right">ราคาต่อหน่วย<br />UNIT PRICE</th>
                  <th className="border border-black px-2 h-[24px] w-[15%] text-right">จำนวนเงิน<br />AMOUNT</th>
                  {editableDocumentLines ? (
                    <th className="border border-black px-1 h-[24px] w-[5%] print:hidden">&nbsp;</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item, index) => {
                  const ln = calcLine(item);
                  const runningIndex = (pageOffsets[pageIndex] ?? 0) + index;
                  const lineKey = getLineKey(item);
                  const isEditing = editableDocumentLines && editingLineKey === lineKey;
                  const hasDocumentLine = Boolean(item?.hasDocumentLine);

                  return (
                    <React.Fragment key={item.id ?? item.stockItemId ?? `row-${pageIndex}-${index}`}>
                      <tr className={`align-top ${isEditing ? 'bg-slate-50 print:bg-white' : ''}`}>
                        <td className="border border-black px-1 py-1 text-center align-top min-h-[24px]">{runningIndex + 1}</td>
                        <td
                          className="border border-black px-2 py-1 whitespace-normal break-words align-top leading-relaxed"
                        >
                          {buildDocumentLineText(item)}
                        </td>
                        <td className="border border-black px-1 py-1 text-center align-top min-h-[24px]">{ln.qty}</td>
                        <td className="border border-black px-1 py-1 text-center align-top min-h-[24px]">{item.unit || '-'}</td>
                        <td className="border border-black px-2 py-1 text-right align-top tabular-nums">{formatCurrency(ln.unitInc)}</td>
                        <td className="border border-black px-2 py-1 text-right align-top tabular-nums font-medium">{formatCurrency(ln.total)}</td>
                        {editableDocumentLines ? (
                          <td className="border border-black px-1 py-1 text-center align-top print:hidden">
                            <button
                              type="button"
                              onClick={() => onToggleDocumentLineEdit?.(item)}
                              className={`inline-flex items-center justify-center w-7 h-7 rounded border text-xs ${isEditing || hasDocumentLine
                                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                                  : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
                                }`}
                              aria-label="แก้ข้อความเอกสารของรายการนี้"
                            >
                              {hasDocumentLine ? '✓' : '☑'}
                            </button>
                          </td>
                        ) : null}
                      </tr>

                      {renderDocumentLineEditorRow(item, pageIndex, index)}
                    </React.Fragment>
                  );
                })}

                {[...Array(emptyRowCount)].map((_, idx) => (
                  <tr key={`empty-${pageIndex}-${idx}`}>
                    <td className="border border-black px-1 text-center h-[24px]">&nbsp;</td>
                    <td className="border border-black px-2 h-[24px]">&nbsp;</td>
                    <td className="border border-black px-1 text-center h-[24px]">&nbsp;</td>
                    <td className="border border-black px-1 text-center h-[24px]">&nbsp;</td>
                    <td className="border border-black px-1 text-right h-[24px]">&nbsp;</td>
                    <td className="border border-black px-1 text-right h-[24px]">&nbsp;</td>
                    {editableDocumentLines ? (
                      <td className="border border-black px-1 text-center h-[24px] print:hidden">&nbsp;</td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>

            {isLast ? (
              <>
                <div className="grid grid-cols-2 gap-5 text-xs pt-3 dn-summary dn-no-break" style={{ minHeight: '60px' }}>
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
                    <p className="flex justify-between border-b border-black font-extrabold text-base py-1 bg-gray-100 tabular-nums">
                      <span>จำนวนเงินรวมทั้งสิ้น</span>
                      <span>{formatCurrency(total)} ฿</span>
                    </p>
                  </div>
                </div>

                <div className="h-[70px]"></div>

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
              <div className="mt-auto" />
            )}

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
