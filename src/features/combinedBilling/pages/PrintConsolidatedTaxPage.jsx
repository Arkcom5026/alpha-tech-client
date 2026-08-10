import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useBranchStore } from '@/features/branch/store/branchStore';
import BillLayoutShortTax from '@/features/bill/components/BillLayoutShortTax';
import BillLayoutFullTax from '@/features/bill/components/BillLayoutFullTax';
import { getConsolidatedTaxPrintable } from '../api/combinedBillingApi';

const PrintConsolidatedTaxPage = () => {
  const { taxDocumentId } = useParams(); const [query] = useSearchParams();
  const selectedBranchId = useBranchStore((state) => Number(state.selectedBranchId || state.currentBranch?.id || 0));
  const branchId = Number(query.get('branchId') || selectedBranchId); const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { getConsolidatedTaxPrintable({ branchId, taxDocumentId }).then(setData).catch((e) => setError(e.response?.data?.message || e.message)); }, [branchId, taxDocumentId]);
  const view = useMemo(() => !data ? null : ({
    sale: { id: `tax-${data.document.id}`, code: data.document.number, createdAt: data.document.issuedAt, soldAt: data.document.issuedAt, totalAmount: data.document.totalAmount, vat: data.document.taxAmount, customer: { name: data.recipient?.legalName || data.sale?.customerName, companyName: data.recipient?.legalName || data.sale?.customerName, taxId: data.recipient?.taxId || data.sale?.customerTaxId, address: data.recipient?.registeredAddress }, branch: { companyName: data.issuer?.legalName, address: data.issuer?.registeredAddress, phone: data.issuer?.phone, taxId: data.issuer?.taxId } },
    items: data.lines.map((line) => ({ id: line.id, productName: line.description, documentDescription: line.description, quantity: line.quantity, unit: 'ชิ้น', unitPrice: line.unitAmount, amount: line.lineAmount })),
    payment: { id: `tax-payment-${data.document.id}`, method: 'TRANSFER', amount: data.document.totalAmount },
    config: { branchName: data.issuer?.legalName || '-', address: data.issuer?.registeredAddress || '-', phone: data.issuer?.phone || '-', taxId: data.issuer?.taxId || '-', vatRate: 7 },
  }), [data]);
  if (error) return <main className="p-6 text-red-700">{error}</main>;
  if (!view) return <main className="p-6">กำลังเตรียมเอกสาร...</main>;
  if (data.document.type === 'SHORT_TAX_INVOICE') return <div className="bill-print-root mx-auto w-[80mm] bg-white p-4 print:p-0"><BillLayoutShortTax sale={view.sale} saleItems={view.items} payments={[view.payment]} config={view.config} hideContactName /></div>;
  return <div className="w-full min-h-screen bg-white py-8 px-4 print:p-0"><div className="bill-print-root mx-auto max-w-[210mm] bg-white print:p-0"><BillLayoutFullTax sale={view.sale} saleItems={view.items} payments={[view.payment]} config={view.config} /></div></div>;
};
export default PrintConsolidatedTaxPage;
