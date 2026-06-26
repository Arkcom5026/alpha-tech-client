// src/features/customerReceipt/components/CustomerReceiptPrintLayout.jsx
// 🏛️ Tenant-Safe Premium Printer Layout Container: (A4 Standard Crystal Clean Alignment)

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
    const saleItems = Array.isArray(allocation?.sale?.saleItems) ? allocation.sale.saleItems : [];
    if (saleItems.length > 0) {
      saleItems.forEach((saleItem, saleItemIndex) => {
        const quantity = Number(saleItem?.quantity ?? saleItem?.qty ?? saleItem?.count ?? saleItem?.itemQty ?? 1);
        const unitPrice = Number(saleItem?.unitPriceIncVat ?? saleItem?.unitPrice ?? saleItem?.price ?? saleItem?.sellingPrice ?? saleItem?.salePrice ?? 0);
        const amount = Number(saleItem?.amount ?? saleItem?.totalAmount ?? saleItem?.total ?? saleItem?.lineTotal ?? saleItem?.subtotal ?? unitPrice * quantity);
        const productName = saleItem?.productName || saleItem?.name || saleItem?.description || saleItem?.title || saleItem?.itemName || saleItem?.stockItem?.product?.name || saleItem?.product?.name || '-';
        const productModel = saleItem?.productModel || saleItem?.model || saleItem?.stockItem?.product?.productModel || saleItem?.product?.productModel || '';
        const unit = saleItem?.unit || saleItem?.unitName || saleItem?.stockItem?.product?.unit?.name || saleItem?.product?.unit?.name || saleItem?.unitObj?.name || '-';

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
      productName: `ชำระตามบิลใบเสร็จเลขที่ ${allocation?.sale?.code || allocation?.saleCode || '-'}`,
      productModel: '',
      quantity: 1,
      unit: 'งวด',
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
  const vatAmount = Number.isFinite(Number(firstSale?.vat)) ? round2(Number(firstSale.vat)) : round2((total * vatRate) / (100 + vatRate));
  const beforeVat = round2(total - vatAmount);

  const maxRowCount = 18;
  const emptyRowCount = Math.max(maxRowCount - lineItems.length, 0);

  return (
    <div className="w-full overflow-hidden mx-auto text-sm border border-gray-600 px-5 pt-4 pb-4 flex flex-col rounded-md print-a4 bg-white"
      style={{ width: '210mm', minHeight: '297mm', height: 'auto', fontFamily: 'Tahoma, Arial, sans-serif' }}>
      
      <div className="flex justify-between items-start border-b pb-2 mb-2 gap-3 no-break">
        <div className="leading-tight">
          <h2 className="font-bold text-[15px]">{branch?.name || branch?.branchName || '-'}</h2>
          <p className="text-xs text-gray-600 mt-0.5">ที่อยู่: {branch?.address || '-'}</p>
          <p className="text-xs text-gray-600">โทร: {branch?.phone || '-'}</p>
          <p className="text-xs font-bold text-gray-950">เลขประจำตัวผู้เสียภาษี: {branch?.taxId || '-'}</p>
        </div>
        <div className="text-right select-none">
          <p className="border border-black px-3 py-1.5 font-bold rounded-md leading-tight text-xs bg-gray-50/50">
            ต้นฉบับลูกค้า<br />CUSTOMER ORIGINAL
          </p>
        </div>
      </div>

      <h3 className="text-center font-bold underline text-[20px] leading-tight mb-4 mt-2">
        ใบเสร็จรับเงิน / ใบกำกับภาษี (ลูกหนี้)<br />
        <span className="text-xs no-underline font-medium text-gray-500 tracking-wider">TAX INVOICE ORIGINAL / RECEIPTS CREDIT CONTROL</span>
      </h3>

      <div className="grid grid-cols-[2.8fr_1.7fr] gap-4 text-xs mb-3 no-break">
        <div className="border border-black p-2.5 rounded-lg space-y-1 leading-snug">
          <p><span className="text-gray-500 font-medium">ลูกค้า/สังกัดหน่วยงาน:</span> <span className="font-bold text-gray-950">{buildCustomerName(customer)}</span></p>
          <p><span className="text-gray-500 font-medium">ที่อยู่ประทับตราส่งเอกสาร:</span> <span className="font-medium text-gray-800">{buildCustomerAddress(customer)}</span></p>
          <p><span className="text-gray-500 font-medium">เบอร์โทรติดต่อ:</span> <span className="font-mono font-bold">{customer?.phone || customer?.phoneNumber || '-'}</span></p>
          <p><span className="text-gray-500 font-medium">เลขประจำตัวผู้เสียภาษี:</span> <span className="font-mono font-black">{customer?.taxId || customer?.taxNo || '-'}</span></p>
        </div>

        <div className="border border-black p-2.5 rounded-lg space-y-1 leading-snug font-mono text-xs">
          <p><span className="text-gray-500 font-sans font-medium">วันที่ประทับตรา:</span> <span className="font-sans font-bold">{formatDate(receipt?.receivedAt)}</span></p>
          <p><span className="text-gray-500 font-sans font-medium">เลขที่เอกสารการเงิน:</span> <span className="font-black text-gray-950">{receipt?.code || '-'}</span></p>
          <p><span className="text-gray-500 font-sans font-medium">อ้างอิงวิธีรับชำระ:</span> <span className="font-sans font-bold text-blue-700">{receipt?.paymentMethod || '-'}</span></p>
        </div>
      </div>

      <table className="w-full text-xs mb-2 border border-black table-fixed">
        <thead className="bg-gray-50 select-none">
          <tr className="border-b border-black text-[11px]">
            <th className="border border-black px-1 h-[26px] text-center w-[8%]">ลำดับ</th>
            <th className="border border-black px-2 h-[26px] text-left w-[46%]">รายละเอียดรายการตัดหนี้</th>
            <th className="border border-black px-1 h-[26px] text-center w-[10%]">จำนวน</th>
            <th className="border border-black px-1 h-[26px] text-center w-[8%]">หน่วย</th>
            <th className="border border-black px-2 h-[26px] text-right w-[14%]">ราคาต่อหน่วย</th>
            <th className="border border-black px-2 h-[26px] text-right w-[14%]">จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody className="text-[11px] leading-relaxed">
          {lineItems.map((item, index) => (
            <tr key={item.key || index} className="align-middle">
              <td className="border border-black px-1 py-1 text-center h-[26px] tabular-nums text-gray-400">{index + 1}</td>
              <td className="border border-black px-2 py-1 h-[26px] font-bold text-gray-900 truncate" title={item.productName}>{item.productName}</td>
              <td className="border border-black px-1 py-1 text-center h-[26px] font-semibold">{item.quantity}</td>
              <td className="border border-black px-1 py-1 text-center h-[26px] text-gray-500">{item.unit || '-'}</td>
              <td className="border border-black px-2 py-1 text-right h-[26px] font-mono">{formatCurrency(item.unitPrice)}</td>
              <td className="border border-black px-2 py-1 text-right h-[26px] font-mono font-bold text-gray-950">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
          {[...Array(emptyRowCount)].map((_, idx) => (
            <tr key={`empty-${idx}`}>
              <td className="border border-black px-1 h-[26px]">&nbsp;</td>
              <td className="border border-black px-2 h-[26px]">&nbsp;</td>
              <td className="border border-black px-1 h-[26px]">&nbsp;</td>
              <td className="border border-black px-1 h-[26px]">&nbsp;</td>
              <td className="border border-black px-2 h-[26px]">&nbsp;</td>
              <td className="border border-black px-2 h-[26px]">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-4 text-xs mt-auto pt-3 border-t border-dashed border-gray-300 no-break">
        <div className="leading-tight flex flex-col items-center justify-center text-center p-2 rounded-xl bg-gray-50 select-none">
          <p className="font-bold text-gray-500 text-[11px]">จำนวนเงินรวมสุทธิเป็นตัวอักษร</p>
          <p className="italic text-sm font-black text-slate-900 mt-1">({bahtText(total)})</p>
        </div>

        <div className="space-y-1 font-semibold text-gray-700">
          <p className="flex justify-between border-b border-gray-100 py-0.5">
            <span>รวมเงินมูลค่าก่อนภาษี (Net)</span>
            <span className="font-mono">{formatCurrency(beforeVat)} ฿</span>
          </p>
          <p className="flex justify-between border-b border-gray-100 py-0.5 text-rose-600">
            <span>ภาษีมูลค่าเพิ่ม Vat {vatRate}%</span>
            <span className="font-mono">{formatCurrency(vatAmount)} ฿</span>
          </p>
          <p className="flex justify-between border-b border-black font-black text-sm py-1 text-gray-950 bg-gray-50/70 px-1 rounded">
            <span>จำนวนเงินรวมทั้งสิ้น (Vat Incl.)</span>
            <span className="font-mono text-base text-blue-700">฿{formatCurrency(total)}</span>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center no-break border-t border-gray-100 pt-4 select-none">
        <div className="w-[40%] mx-auto">
          <div className="border-t border-dashed border-black pt-1.5 h-[40px] flex flex-col justify-start items-center">
            <span className="text-xs font-black text-gray-700 tracking-wider">เจ้าหน้าที่ผู้รับชำระเงิน / AUTHORIZED SIGNATURE</span>
            <span className="text-[9px] text-gray-400 font-mono mt-1">Premium POS Ledger Settle Scribe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CustomerReceiptPrintLayout);