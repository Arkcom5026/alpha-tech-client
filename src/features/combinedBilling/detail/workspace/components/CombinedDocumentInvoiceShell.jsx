import React from 'react';
import {
  combinedBillingTypographyPx,
  resolveCombinedBillingFooter,
  resolveCombinedBillingHeader,
} from '../../../presentation/combinedBillingPresentation';
import CombinedBillingPresentationFooter from './CombinedBillingPresentationFooter';

const formatDate = (value) => value ? new Date(value).toLocaleDateString('th-TH') : '-';
const formatMoney = (value) => Number(value || 0).toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const CombinedDocumentInvoiceShell = ({ documentDetail, customer }) => {
  const header = resolveCombinedBillingHeader(documentDetail);
  const footer = resolveCombinedBillingFooter(documentDetail);
  const footerFontSize = combinedBillingTypographyPx(documentDetail, 'footer', 'md');

  return (
    <div className="combined-billing-a4-page mx-auto max-w-4xl bg-white p-8 shadow-lg font-sarabun">
      <header className="flex justify-between items-start gap-5 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold">ใบแจ้งหนี้ / INVOICE</h1>
          <p className="text-gray-600">สำหรับเอกสารรวมบิลเลขที่: {documentDetail.code}</p>
        </div>
        <div className="flex max-w-[55%] items-start justify-end gap-3 text-right">
          <div>
            {header.branchName ? <p className="font-bold text-lg">{header.branchName}</p> : null}
            {header.address ? <p className="text-sm">{header.address}</p> : null}
            {header.phone ? <p className="text-sm">โทร: {header.phone}</p> : null}
            {header.taxId ? <p className="text-sm">เลขประจำตัวผู้เสียภาษี: {header.taxId}</p> : null}
            {header.headerNote ? <p className="mt-1 text-xs text-gray-500">{header.headerNote}</p> : null}
          </div>
          {header.logoUrl ? <img src={header.logoUrl} alt="logo" className="h-16 w-16 shrink-0 object-contain" /> : null}
        </div>
      </header>

      <section className="flex justify-between mt-6">
        <div>
          <p className="font-bold text-gray-700">ลูกค้า:</p>
          <p>{customer?.name || customer?.companyName || 'N/A'}</p>
          <p className="text-sm">{customer?.address || customer?.addressDetail || ''}</p>
          <p className="text-sm">เลขประจำตัวผู้เสียภาษี: {customer?.taxId || 'N/A'}</p>
        </div>
        <div className="text-right">
          <p><span className="font-bold">เลขที่เอกสาร:</span> {documentDetail.code}</p>
          <p><span className="font-bold">วันที่:</span> {formatDate(documentDetail.issueDate)}</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold mb-2">สรุปรายการใบส่งของที่รวมในเอกสารนี้</h2>
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-sm font-semibold">เลขที่ใบส่งของ</th>
              <th className="p-2 text-sm font-semibold">วันที่ส่ง</th>
              <th className="p-2 text-sm font-semibold">เลขที่อ้างอิง (PO)</th>
              <th className="p-2 text-sm font-semibold text-right">ยอดรวม (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {(documentDetail.sales || []).map((sale) => (
              <tr key={sale.id} className="border-b">
                <td className="p-2">{sale.code}</td>
                <td className="p-2">{formatDate(sale.soldAt)}</td>
                <td className="p-2">{sale.officialDocumentNumber || '-'}</td>
                <td className="p-2 text-right font-mono">{formatMoney(sale.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="mt-8 pt-6 border-t flex justify-end">
        <div className="w-1/3">
          <div className="flex justify-between">
            <span className="font-bold">ยอดรวมทั้งสิ้น</span>
            <span className="font-bold font-mono">{formatMoney(documentDetail.totalAmount)}</span>
          </div>
        </div>
      </footer>

      <CombinedBillingPresentationFooter content={footer} fontSizePx={footerFontSize} />

      <div className="mt-16 text-center text-sm text-gray-500">
        <p>ผู้จัดทำ: {documentDetail.createdByUser?.name || documentDetail.employee?.name || 'N/A'}</p>
      </div>
    </div>
  );
};

export default CombinedDocumentInvoiceShell;
