


// src/features/customerReceipt/components/CustomerReceiptPrintLayout.jsx

import React from 'react';

const formatDate = (value) => {
  if (!value) return '-';

  try {
    return new Date(value).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Bangkok',
    });
  } catch {
    return '-';
  }
};

const formatCurrency = (val) => (Number(val) || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const round2 = (n) => Number((Number(n || 0)).toFixed(2));

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
    let out = '';
    let n2 = num;
    let first = true;
    while (n2 > 0) {
      const chunk = n2 % 1000000;
      if (chunk) {
        const chunkText = readUnderMillion(chunk);
        out = first ? chunkText + out : chunkText + 'ล้าน' + out;
      }
      n2 = Math.floor(n2 / 1000000);
      first = false;
    }
    return out;
  };

  const sign = fixed < 0 ? 'ลบ' : '';
  const bahtTextPart = `${sign}${readNumber(baht)}บาท`;
  const satangTextPart = satang === 0 ? 'ถ้วน' : `${readNumber(satang)}สตางค์`;
  return bahtTextPart + satangTextPart;
};



const buildCustomerName = (customer) => {
  if (!customer) return '-';
  return customer.companyName || customer.name || '-';
};

const buildCustomerAddress = (customer) => {
  if (!customer) return '-';

  const parts = [
    customer.customerAddress,
    customer.address,
    customer.addressDetail,
    customer.subdistrictName,
    customer.districtName,
    customer.provinceName,
    customer.postcode,
  ].filter(Boolean);

  return parts.length ? parts.join(' ') : '-';
};

const buildReceiptLineItems = (allocations = []) => {
  const lines = [];

  allocations.forEach((allocation, allocationIndex) => {
    const saleItems = Array.isArray(allocation?.sale?.saleItems)
      ? allocation.sale.saleItems
      : [];

    if (saleItems.length > 0) {
      saleItems.forEach((saleItem, saleItemIndex) => {
        const quantity = Number(
          saleItem?.quantity ?? saleItem?.qty ?? saleItem?.count ?? saleItem?.itemQty ?? 1
        );

        const unitPrice = Number(
          saleItem?.unitPriceIncVat ??
            saleItem?.unitPrice ??
            saleItem?.price ??
            saleItem?.sellingPrice ??
            saleItem?.salePrice ??
            0
        );

        const amount = Number(
          saleItem?.amount ??
            saleItem?.totalAmount ??
            saleItem?.total ??
            saleItem?.lineTotal ??
            saleItem?.subtotal ??
            unitPrice * quantity
        );

        const productName =
          saleItem?.productName ||
          saleItem?.name ||
          saleItem?.description ||
          saleItem?.title ||
          saleItem?.itemName ||
          saleItem?.stockItem?.product?.name ||
          saleItem?.product?.name ||
          '-';

        const productModel =
          saleItem?.productModel ||
          saleItem?.model ||
          saleItem?.stockItem?.product?.productModel ||
          saleItem?.product?.productModel ||
          '';

        const unit =
          saleItem?.unit ||
          saleItem?.unitName ||
          saleItem?.stockItem?.product?.unit?.name ||
          saleItem?.product?.unit?.name ||
          saleItem?.unitObj?.name ||
          '-';

        lines.push({
          key: `${allocation?.id || allocationIndex}-${saleItem?.id || saleItemIndex}`,
          productName,
          productModel,
          quantity,
          unit,
          unitPrice,
          amount,
        });
      });
      return;
    }

    lines.push({
      key: `${allocation?.id || allocationIndex}-fallback`,
      productName: `ชำระตามบิล ${allocation?.sale?.code || allocation?.saleCode || '-'}`,
      productModel: '',
      quantity: 1,
      unit: '-',
      unitPrice: Number(allocation?.amount || 0),
      amount: Number(allocation?.amount || 0),
    });
  });

  return lines;
};

const CustomerReceiptPrintLayout = ({ receipt }) => {
  const customer = receipt?.customer || null;
  const branch = receipt?.branch || null;
  const allocations = Array.isArray(receipt?.allocations) ? receipt.allocations : [];
  const firstSale = allocations?.[0]?.sale || null;
  const lineItems = buildReceiptLineItems(allocations);

  const total = round2(Number(receipt?.totalAmount || 0));
  const vatRate = Number.isFinite(Number(firstSale?.vatRate)) ? Number(firstSale.vatRate) : 7;
  const vatAmount = Number.isFinite(Number(firstSale?.vat))
    ? round2(Number(firstSale.vat))
    : round2((total * vatRate) / (100 + vatRate));
  const beforeVat = round2(total - vatAmount);

  const maxRowCount = 20;
  const emptyRowCount = Math.max(maxRowCount - lineItems.length, 0);

  return (
    <>
      <style>{`
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
          .print-a4 {
            width: 210mm !important;
            min-height: 297mm !important;
            height: auto !important;
          }
          .no-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          table {
            page-break-inside: auto;
          }
          tr, td, th {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      <div
        className="w-full overflow-hidden mx-auto text-sm border border-gray-600 px-4 pt-4 pb-2 flex flex-col rounded-md print-a4"
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: 'auto',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div className="flex justify-between items-start border-b pb-2 mb-2 gap-3 no-break">
          <div>
            <h2 className="font-bold text-sm">{branch?.name || branch?.branchName || '-'}</h2>
            <p>ที่อยู่: {branch?.address || '-'}</p>
            <p>โทร: {branch?.phone || '-'}</p>
            <p>เลขประจำตัวผู้เสียภาษี: {branch?.taxId || '-'}</p>
          </div>

          <div className="text-right">
            <p className="border border-gray-600 px-2 py-1 font-bold rounded-md leading-tight text-xs">
              ต้นฉบับลูกค้า
              <br />
              CUSTOMER ORIGINAL
            </p>
          </div>
        </div>

        <h3 className="text-center font-bold underline text-lg leading-tight mb-1">
          ใบเสร็จรับเงิน / ใบกำกับภาษี
        </h3>
        <p className="text-center font-bold text-base mb-4 leading-tight">
          TAX INVOICE ORIGINAL / DELIVERY ORDER
        </p>

        <div className="grid grid-cols-[2.8fr_1.7fr] gap-4 text-sm mb-4 no-break">
          <div className="border border-black p-2 rounded-lg space-y-1 leading-tight">
            <p>ลูกค้า: {buildCustomerName(customer)}</p>
            <p>ที่อยู่: {buildCustomerAddress(customer)}</p>
            <p>โทร: {customer?.phone || customer?.phoneNumber || '-'}</p>
            <p>เลขประจำตัวผู้เสียภาษี: {customer?.taxId || customer?.taxNo || '-'}</p>
          </div>

          <div className="border border-black p-2 rounded-lg space-y-1 leading-tight">
            <p>วันที่: {formatDate(firstSale?.soldAt || firstSale?.createdAt || receipt?.receivedAt)}</p>
            <p>เลขที่: {firstSale?.code || receipt?.code || '-'}</p>
            <p>เงื่อนไขการชำระเงิน: -</p>
          </div>
        </div>

        <table className="w-full text-xs mb-2 border border-black">
          <thead>
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
            {lineItems.map((item, index) => (
              <tr key={item.key || index}>
                <td className="border border-black px-1 text-center h-[28px] align-top">{index + 1}</td>
                <td className="border border-black px-1 h-[28px] align-top">
                  {item.productName}
                </td>
                <td className="border border-black px-1 text-center h-[28px] align-top">{item.quantity}</td>
                <td className="border border-black px-1 text-center h-[28px] align-top">{item.unit || '-'}</td>
                <td className="border border-black px-1 text-right h-[28px] align-top">{formatCurrency(item.unitPrice)}</td>
                <td className="border border-black px-1 text-right h-[28px] align-top">{formatCurrency(item.amount)}</td>
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

        <div className="grid grid-cols-2 gap-4 text-xs mt-auto pt-4 no-break" style={{ minHeight: '120px' }}>
          <div className="leading-tight flex flex-col items-center justify-start text-center pt-3">
            <p className="font-bold">จำนวนเงินเป็นตัวอักษร</p>
            <p className="italic text-base font-semibold">({bahtText(total)})</p>
          </div>

          <div>
            <p className="flex justify-between border-b border-black py-1">
              <span>รวมเงิน</span>
              <span>{formatCurrency(beforeVat)} ฿</span>
            </p>
            <p className="flex justify-between border-b border-black py-1">
              <span>ภาษีมูลค่าเพิ่ม {vatRate}%</span>
              <span>{formatCurrency(vatAmount)} ฿</span>
            </p>
            <p className="flex justify-between border-b border-black font-extrabold text-base py-1">
              <span>จำนวนเงินรวมทั้งสิ้น</span>
              <span>{formatCurrency(total)} ฿</span>
            </p>
          </div>
        </div>

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

export default React.memo(CustomerReceiptPrintLayout);

