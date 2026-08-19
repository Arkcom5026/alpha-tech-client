import React, { useEffect, useMemo, useRef, useState } from 'react';
import { buildCustomerFullAddress } from '@features/customer/utils/customerAddressFormatter';
import StatutoryTaxPresentationFooter from '@/features/printing/presentation/StatutoryTaxPresentationFooter';
import { buildReceiptItems } from '../utils/receiptGrouping';

const MAX_ROWS_LAST_PAGE = 20;
const MAX_ROWS_NORMAL_PAGE = 24;
const MAX_ROWS_LAST_PAGE_WITH_PRESENTATION_FOOTER = 17;
const PHYSICAL_PAGE_HEIGHT_MM = 296;
const PRINT_PAGE_MARGIN_MM = 4;
const PRINT_SHEET_WIDTH_MM = 201;
const PRINT_SHEET_HEIGHT_MM = 288;
const PRESENTATION_FOOTER_HEIGHT_MM = 18;
const DOCUMENT_FONT_FAMILY = '"TH Sarabun New", "Sarabun", Tahoma, Arial, sans-serif';

const round2 = (value) => Number((Number(value || 0)).toFixed(2));
const formatCurrency = (value) => (Number(value) || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');
const buildBranchFullAddress = (branch, fallbackAddress = '-') => {
  const subdistrict = branch?.subdistrict || null;
  const district = subdistrict?.district || null;
  const province = district?.province || null;
  const structured = [
    branch?.address,
    subdistrict?.nameTh ? `ต.${subdistrict.nameTh}` : null,
    district?.nameTh ? `อ.${district.nameTh}` : null,
    province?.nameTh ? `จ.${province.nameTh}` : null,
    subdistrict?.postcode,
  ].filter(Boolean).join(' ').trim();
  return structured || normalizeText(fallbackAddress) || '-';
};

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
      const pos = 5 - i;
      if (d === 0) continue;
      if (pos === 1) {
        if (d === 1) out += 'สิบ';
        else if (d === 2) out += 'ยี่สิบ';
        else out += `${digit[d]}สิบ`;
      } else if (pos === 0) {
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
    let value = num;
    let out = '';
    let first = true;
    while (value > 0) {
      const chunk = value % 1_000_000;
      if (chunk) {
        const chunkText = readUnderMillion(chunk);
        out = first ? chunkText + out : `${chunkText}ล้าน${out}`;
      }
      value = Math.floor(value / 1_000_000);
      first = false;
    }
    return out;
  };

  const sign = fixed < 0 ? 'ลบ' : '';
  return `${sign}${readNumber(baht)}บาท${satang === 0 ? 'ถ้วน' : `${readNumber(satang)}สตางค์`}`;
};

const getLineKey = (item) => item?.documentLineKey || item?.id || null;

const buildDocumentLineText = (item) => {
  const parts = [
    item?.documentPrefix,
    item?.documentDescription || item?.productName,
    item?.documentSuffix,
  ].map(normalizeText).filter(Boolean);
  return parts.length ? parts.join(' ') : '-';
};

const paginateItems = (items) => {
  const src = Array.isArray(items) ? items : [];
  if (src.length <= MAX_ROWS_LAST_PAGE) return [{ items: src, isLast: true }];

  const pages = [];
  let index = 0;
  while (src.length - index > MAX_ROWS_LAST_PAGE) {
    pages.push({ items: src.slice(index, index + MAX_ROWS_NORMAL_PAGE), isLast: false });
    index += MAX_ROWS_NORMAL_PAGE;
  }
  pages.push({ items: src.slice(index), isLast: true });
  return pages;
};

const paginateItemsWithReservedFooter = (items) => {
  const src = Array.isArray(items) ? items : [];
  if (src.length <= MAX_ROWS_LAST_PAGE_WITH_PRESENTATION_FOOTER) {
    return [{ items: src, isLast: true }];
  }

  const pages = [];
  let index = 0;
  while (src.length - index > MAX_ROWS_NORMAL_PAGE + MAX_ROWS_LAST_PAGE_WITH_PRESENTATION_FOOTER) {
    pages.push({ items: src.slice(index, index + MAX_ROWS_NORMAL_PAGE), isLast: false });
    index += MAX_ROWS_NORMAL_PAGE;
  }

  const remaining = src.length - index;
  if (remaining > MAX_ROWS_LAST_PAGE_WITH_PRESENTATION_FOOTER) {
    const penultimateCount = Math.min(
      MAX_ROWS_NORMAL_PAGE,
      Math.max(
        remaining - MAX_ROWS_LAST_PAGE_WITH_PRESENTATION_FOOTER,
        Math.ceil(remaining / 2),
      ),
    );
    pages.push({ items: src.slice(index, index + penultimateCount), isLast: false });
    index += penultimateCount;
  }

  pages.push({ items: src.slice(index), isLast: true });
  return pages;
};

const FullTaxA4Document = ({
  sale,
  saleItems,
  payments,
  config,
  presentationFooter = null,
  editableDocumentLines = false,
  editingLineKey = null,
  lineDrafts = {},
  savingLineKey = null,
  onToggleDocumentLineEdit,
  onChangeDocumentLineDraft,
  onSaveDocumentLine,
}) => {
  const [hideDate, setHideDate] = useState(Boolean(config?.hideDate));
  const hideDateTouchedRef = useRef(false);

  useEffect(() => {
    if (!hideDateTouchedRef.current) setHideDate(Boolean(config?.hideDate));
  }, [config?.hideDate]);

  const displayItems = useMemo(() => buildReceiptItems(saleItems || []), [saleItems]);
  const normalizedPresentationFooter = useMemo(() => ({
    notes: normalizeText(presentationFooter?.notes),
    customFooter: normalizeText(presentationFooter?.customFooter),
  }), [presentationFooter?.notes, presentationFooter?.customFooter]);
  const hasPresentationFooter = Boolean(
    normalizedPresentationFooter.notes || normalizedPresentationFooter.customFooter,
  );
  const pages = useMemo(
    () => (hasPresentationFooter
      ? paginateItemsWithReservedFooter(displayItems)
      : paginateItems(displayItems)),
    [displayItems, hasPresentationFooter],
  );

  if (!sale || !Array.isArray(saleItems) || !payments || !config) return null;

  const branchAddress = buildBranchFullAddress(sale?.branch, config?.address);
  const vatRate = Number.isFinite(Number(sale?.vatRate))
    ? Number(sale.vatRate)
    : (Number.isFinite(Number(config?.vatRate)) ? Number(config.vatRate) : 7);
  const total = round2(Number(sale?.totalAmount ?? sale?.total ?? sale?.grandTotal ?? 0) || 0);
  const vatRaw = sale?.vat ?? sale?.vatAmount;
  const vatAmount = Number.isFinite(Number(vatRaw))
    ? round2(Number(vatRaw))
    : round2(total * vatRate / (100 + vatRate));
  const beforeVat = round2(total - vatAmount);

  const lineAmountIncVat = (item) => {
    const qty = Number(item?.quantity) || 0;
    const explicit = item?.amount ?? item?.total ?? item?.totalAmount;
    if (explicit != null && Number.isFinite(Number(explicit))) return round2(explicit);
    const unit = item?.unitPriceIncVat ?? item?.unitPrice;
    if (unit != null && Number.isFinite(Number(unit))) return round2(Number(unit) * qty);
    const exTotal = item?.totalExVat;
    if (exTotal != null && Number.isFinite(Number(exTotal))) return round2(Number(exTotal) * (1 + vatRate / 100));
    return 0;
  };

  const unitPriceIncVat = (item) => {
    const qty = Number(item?.quantity) || 0;
    const amount = lineAmountIncVat(item);
    if (qty > 0) return round2(amount / qty);
    const explicit = item?.unitPriceIncVat ?? item?.unitPrice;
    if (explicit != null && Number.isFinite(Number(explicit))) return round2(explicit);
    return 0;
  };

  const customerName = (customer) => {
    if (!customer) return '-';
    if (['GOVERNMENT', 'ORGANIZATION'].includes(customer.type)) return customer.companyName || '-';
    return customer.name || '-';
  };

  const customerAddress = (customer) => {
    if (!customer) return '-';
    const formatted = buildCustomerFullAddress(customer);
    return normalizeText(formatted) || customer.customerAddress || customer.address || '-';
  };

  const renderDate = (iso) => {
    if (hideDate) return <span className="inline-block h-[18px] w-[120px] border-b border-black align-bottom" />;
    if (!iso) return '-';
    if (config?.formatThaiDate) return config.formatThaiDate(iso);
    try {
      return new Date(iso).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Bangkok',
      });
    } catch {
      return String(iso);
    }
  };

  const renderEditorRow = (item) => {
    if (!editableDocumentLines) return null;
    const lineKey = getLineKey(item);
    if (!lineKey || editingLineKey !== lineKey) return null;
    const draft = {
      documentPrefix: item?.documentPrefix || '',
      documentDescriptionRaw: item?.documentDescriptionRaw || item?.documentDescription || item?.productName || '',
      documentSuffix: item?.documentSuffix || '',
      ...(lineDrafts?.[lineKey] || {}),
    };
    const isSaving = savingLineKey === lineKey;
    return (
      <tr key={`editor-${lineKey}`} className="bg-slate-50 print:hidden">
        <td colSpan={7} className="border border-black px-3 py-2">
          <div className="mx-auto max-w-[560px] space-y-2">
            <input
              value={draft.documentPrefix}
              onChange={(e) => onChangeDocumentLineDraft?.(item, 'documentPrefix', e.target.value)}
              placeholder="ข้อความก่อนสินค้า"
              className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
            />
            <div className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
              {item?.documentDescription || item?.productName || '-'}
            </div>
            <input
              value={draft.documentSuffix}
              onChange={(e) => onChangeDocumentLineDraft?.(item, 'documentSuffix', e.target.value)}
              placeholder="ข้อความท้ายสินค้า"
              className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
            />
            <div className="text-right">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => onSaveDocumentLine?.(item)}
                className="rounded bg-teal-600 px-3 py-1 text-xs text-white disabled:opacity-60"
              >
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  let runningIndex = 0;

  return (
    <>
      <style>{`
        @page { size: A4; margin: ${PRINT_PAGE_MARGIN_MM}mm; }
        .full-tax-a4-page {
          box-sizing: border-box;
          width: 210mm;
          height: ${PHYSICAL_PAGE_HEIGHT_MM}mm;
          min-height: ${PHYSICAL_PAGE_HEIGHT_MM}mm;
          font-family: ${DOCUMENT_FONT_FAMILY};
        }
        @media print {
          html, body, #root { margin: 0 !important; padding: 0 !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .full-tax-a4-page {
            box-sizing: border-box !important;
            width: ${PRINT_SHEET_WIDTH_MM}mm !important;
            height: ${PRINT_SHEET_HEIGHT_MM}mm !important;
            min-height: ${PRINT_SHEET_HEIGHT_MM}mm !important;
            margin: 0 auto !important;
            padding: 5mm !important;
            border: 0 !important;
            border-radius: 2.5mm !important;
            box-shadow: none !important;
            overflow: hidden !important;
            font-family: ${DOCUMENT_FONT_FAMILY} !important;
          }
          .full-tax-a4-page .full-tax-editor-column {
            display: none !important;
          }
          .full-tax-a4-page + .full-tax-a4-page { break-before: page; page-break-before: always; }
        }
      `}</style>

      <div className="mx-auto mb-4 w-full max-w-[210mm] text-right print:hidden">
        <label className="inline-flex items-center gap-2 px-5 text-sm">
          <input
            type="checkbox"
            checked={hideDate}
            onChange={(e) => {
              hideDateTouchedRef.current = true;
              setHideDate(e.target.checked);
            }}
            className="h-5 w-5"
          />
          <span className="ml-2 text-base">ไม่แสดงวันที่ในเอกสาร</span>
        </label>
        <button
          type="button"
          onClick={() => window.print?.()}
          className="ml-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          พิมพ์บิล
        </button>
      </div>

      {pages.map((page, pageIndex) => {
        const pageItems = page.items || [];
        const rowCap = page.isLast
          ? (hasPresentationFooter ? MAX_ROWS_LAST_PAGE_WITH_PRESENTATION_FOOTER : MAX_ROWS_LAST_PAGE)
          : MAX_ROWS_NORMAL_PAGE;
        const emptyRowCount = Math.max(rowCap - pageItems.length, 0);

        return (
          <section
            key={`full-tax-page-${pageIndex + 1}`}
            className="full-tax-a4-page relative mx-auto mb-6 w-[210mm] overflow-hidden rounded-md border border-gray-600 bg-white p-[6mm] text-black shadow-sm print:mb-0"
            style={{
              minHeight: `${PHYSICAL_PAGE_HEIGHT_MM}mm`,
              height: `${PHYSICAL_PAGE_HEIGHT_MM}mm`,
              fontFamily: DOCUMENT_FONT_FAMILY,
              pageBreakAfter: page.isLast ? 'auto' : 'always',
              breakAfter: page.isLast ? 'auto' : 'page',
            }}
          >
            <div role="banner" className="mb-2 flex items-start justify-between gap-3 border-b pb-2">
              <div className="flex items-start gap-3">
                {config.logoUrl ? <img src={config.logoUrl} alt="logo" className="h-16 w-16 object-contain" /> : null}
                <div>
                  <h2 className="text-[16px] font-bold leading-tight">{config.branchName}</h2>
                  <p>ที่อยู่: {branchAddress}</p>
                  <p>โทร: {config.phone}</p>
                  <p>เลขประจำตัวผู้เสียภาษี: {config.taxId}</p>
                </div>
              </div>
              <p className="rounded-md border border-gray-400 px-3 py-2 text-right text-[13px] font-bold leading-tight">
                ต้นฉบับลูกค้า<br />CUSTOMER ORIGINAL
              </p>
            </div>

            <h3 className="mb-3 text-center text-[20px] font-bold leading-tight underline">
              ใบเสร็จรับเงิน / ใบกำกับภาษี<br />TAX INVOICE ORIGINAL / DELIVERY ORDER
            </h3>

            <div className="mb-3 grid grid-cols-[2.8fr_1.7fr] gap-4 text-[15px]">
              <div className="rounded-lg border border-black p-3 leading-tight">
                <p>ลูกค้า: {customerName(sale.customer)}</p>
                <p>ที่อยู่: {customerAddress(sale.customer)}</p>
                <p>โทร: {sale.customer?.user?.loginId || sale.customer?.phone || sale.customer?.phoneNumber || '-'}</p>
                <p>เลขประจำตัวผู้เสียภาษี: {sale.customer?.taxId || sale.customer?.taxNo || '-'}</p>
              </div>
              <div className="rounded-lg border border-black p-3">
                <p>วันที่: {renderDate(sale.soldAt || sale.createdAt)}</p>
                <p>เลขที่: {sale.code || sale.saleNo || sale.id}</p>
                <p>เงื่อนไขการชำระเงิน: {sale.paymentTerms || '-'}</p>
              </div>
            </div>

            <table className="w-full table-fixed border border-black text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="h-[24px] w-[8%] border border-black px-1">ลำดับ<br />ITEM</th>
                  <th className="h-[24px] w-[30%] border border-black px-2">รายการ<br />DESCRIPTION</th>
                  <th className="h-[24px] w-[10%] border border-black px-1">จำนวน<br />QTY</th>
                  <th className="h-[24px] w-[10%] border border-black px-1">หน่วย<br />UNIT</th>
                  <th className="h-[24px] w-[19%] border border-black px-2 text-right">ราคาต่อหน่วย<br />UNIT PRICE</th>
                  <th className="h-[24px] w-[19%] border border-black px-2 text-right">จำนวนเงิน<br />AMOUNT</th>
                  {editableDocumentLines ? <th className="full-tax-editor-column h-[24px] w-[4%] border border-black px-1">&nbsp;</th> : null}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => {
                  runningIndex += 1;
                  const lineKey = getLineKey(item);
                  const isEditing = editingLineKey === lineKey;
                  const hasDocumentLine = Boolean(item?.hasDocumentLine);
                  return (
                    <React.Fragment key={item.id ?? item.documentLineKey ?? `row-${runningIndex}`}>
                      <tr className={isEditing ? 'bg-slate-50 print:bg-white' : ''}>
                        <td className="h-[24px] border border-black px-1 text-center align-top">{runningIndex}</td>
                        <td className="h-[24px] whitespace-normal break-words border border-black px-2 align-top">{buildDocumentLineText(item)}</td>
                        <td className="h-[24px] border border-black px-1 text-center align-top">{item.quantity}</td>
                        <td className="h-[24px] border border-black px-1 text-center align-top">{item.unit || '-'}</td>
                        <td className="h-[24px] border border-black px-2 text-right align-top tabular-nums">{formatCurrency(unitPriceIncVat(item))}</td>
                        <td className="h-[24px] border border-black px-2 text-right align-top tabular-nums">{formatCurrency(lineAmountIncVat(item))}</td>
                        {editableDocumentLines ? (
                          <td className="full-tax-editor-column border border-black px-1 py-1 text-center align-top">
                            <button
                              type="button"
                              onClick={() => onToggleDocumentLineEdit?.(item)}
                              className={`inline-flex h-6 w-6 items-center justify-center rounded border text-[11px] ${isEditing || hasDocumentLine ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-300 bg-white text-slate-500'}`}
                            >
                              {hasDocumentLine ? '✓' : '☑'}
                            </button>
                          </td>
                        ) : null}
                      </tr>
                      {renderEditorRow(item)}
                    </React.Fragment>
                  );
                })}
                {Array.from({ length: emptyRowCount }).map((_, idx) => (
                  <tr key={`empty-${pageIndex}-${idx}`}>
                    <td className="h-[24px] border border-black">&nbsp;</td>
                    <td className="h-[24px] border border-black">&nbsp;</td>
                    <td className="h-[24px] border border-black">&nbsp;</td>
                    <td className="h-[24px] border border-black">&nbsp;</td>
                    <td className="h-[24px] border border-black">&nbsp;</td>
                    <td className="h-[24px] border border-black">&nbsp;</td>
                    {editableDocumentLines ? <td className="full-tax-editor-column h-[24px] border border-black">&nbsp;</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>

            {page.isLast ? (
              <>
                {hasPresentationFooter ? (
                  <div
                    data-testid="full-tax-presentation-footer-zone"
                    className="absolute bottom-[50mm] left-[6mm] right-[6mm] overflow-hidden border-t border-gray-300 pt-1"
                    style={{ height: `${PRESENTATION_FOOTER_HEIGHT_MM}mm` }}
                  >
                    <StatutoryTaxPresentationFooter
                      notes={normalizedPresentationFooter.notes}
                      customFooter={normalizedPresentationFooter.customFooter}
                    />
                  </div>
                ) : null}

                <div className="absolute bottom-[28mm] left-[6mm] right-[6mm] grid grid-cols-2 gap-5 text-[13px]">
                  <div className="pt-3 text-center leading-tight">
                    <p className="font-bold">จำนวนเงินเป็นตัวอักษร</p>
                    <p className="text-[18px] font-semibold italic">({bahtText(total)})</p>
                  </div>
                  <div>
                    <p className="flex justify-between border-y border-black py-1 text-[14px]"><span>รวมเงิน</span><span>{formatCurrency(beforeVat)} ฿</span></p>
                    <p className="flex justify-between border-b border-black py-1 text-[14px]"><span>ภาษีมูลค่าเพิ่ม {vatRate}%</span><span>{formatCurrency(vatAmount)} ฿</span></p>
                    <p className="flex justify-between border-b border-black bg-gray-100 py-1 text-[18px] font-extrabold"><span>จำนวนเงินรวมทั้งสิ้น</span><span>{formatCurrency(total)} ฿</span></p>
                  </div>
                </div>

                <div className="absolute bottom-[5mm] left-[6mm] right-[6mm] grid grid-cols-2 gap-12 text-center text-[15px]">
                  <div className="flex h-[20mm] flex-col justify-end">
                    <div className="border-t border-dashed border-black pt-1">ผู้ชำระเงิน / PAID BY</div>
                  </div>
                  <div className="flex h-[20mm] flex-col justify-end">
                    <div className="border-t border-dashed border-black pt-1">ผู้รับชำระเงิน / RECEIVED BY</div>
                  </div>
                </div>
              </>
            ) : null}

            <div className="absolute bottom-1 right-[6mm] text-[10px] text-gray-400 print:hidden">{pageIndex + 1}/{pages.length}</div>
          </section>
        );
      })}
    </>
  );
};

export default React.memo(FullTaxA4Document);