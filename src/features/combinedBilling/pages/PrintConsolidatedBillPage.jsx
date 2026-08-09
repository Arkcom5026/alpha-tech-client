import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BillLayoutShortTax from '@/features/bill/components/BillLayoutShortTax';
import BillLayoutFullTax from '@/features/bill/components/BillLayoutFullTax';
import { buildDeliveryNoteBranchConfig } from '@/features/deliveryNote/print/workspace/policies/deliveryNotePrintPolicy';
import { getConsolidatedDeliveryPrintable } from '../api/combinedBillingApi';

const PrintConsolidatedBillPage = () => {
  const { documentId } = useParams(); const [query] = useSearchParams();
  const kind = String(query.get('kind') || 'SHORT').toUpperCase();
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { getConsolidatedDeliveryPrintable(documentId).then(setData).catch((e) => setError(e.response?.data?.message || e.message)); }, [documentId]);
  const view = useMemo(() => {
    if (!data) return null;
    const total = Number(data.document.totalAmount || 0); const vat = Number((total * 7 / 107).toFixed(2));
    const sale = { id: `consolidated-${data.document.id}`, code: data.document.number, createdAt: data.document.issuedAt, soldAt: data.document.issuedAt, totalAmount: total, vat, note: data.document.note, customer: data.customer, employee: data.createdBy, branch: data.branch };
    return { sale, items: data.lines.map((line) => ({ id: line.id, productName: line.description, documentDescription: line.description, quantity: line.quantity, unit: 'ชิ้น', unitPrice: line.documentUnitPrice, amount: line.lineAmount })), payment: { id: `consolidated-payment-${data.document.id}`, method: 'CUSTOMER_MONEY', amount: total }, config: { ...buildDeliveryNoteBranchConfig(sale), vatRate: 7 } };
  }, [data]);
  if (error) return <main className="p-6 text-red-700">{error}</main>;
  if (!view) return <main className="p-6">กำลังเตรียมบิล...</main>;
  if (kind === 'FULL') return <div className="w-full min-h-screen bg-white py-8 px-4 print:p-0"><div className="bill-print-root mx-auto max-w-[210mm] bg-white print:p-0"><BillLayoutFullTax sale={view.sale} saleItems={view.items} payments={[view.payment]} config={view.config} /></div></div>;
  return <div className="bill-print-root mx-auto w-[80mm] bg-white p-4 print:p-0"><BillLayoutShortTax sale={view.sale} saleItems={view.items} payments={[view.payment]} config={view.config} hideContactName /></div>;
};
export default PrintConsolidatedBillPage;
