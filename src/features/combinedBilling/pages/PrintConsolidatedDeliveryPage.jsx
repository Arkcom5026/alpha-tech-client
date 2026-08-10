import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import DeliveryNoteDocumentState from '@/features/deliveryNote/components/workspace/DeliveryNoteDocumentState';
import DeliveryNotePrintShell from '@/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell';
import { buildDeliveryNoteBranchConfig, prepareDeliveryNoteSaleItems } from '@/features/deliveryNote/print/workspace/policies/deliveryNotePrintPolicy';
import { getConsolidatedDeliveryPrintable } from '../api/combinedBillingApi';

const PrintConsolidatedDeliveryPage = () => {
  const { documentId } = useParams();
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { getConsolidatedDeliveryPrintable(documentId).then(setData).catch((e) => setError(e.response?.data?.message || e.message)); }, [documentId]);
  const sale = useMemo(() => !data ? null : ({
    id: `consolidated-${data.document.id}`, code: data.document.number, soldAt: data.document.issuedAt, createdAt: data.document.issuedAt,
    totalAmount: data.document.totalAmount, note: data.document.note, customer: data.customer, employee: data.createdBy, branch: data.branch,
    saleLines: data.lines.map((line) => ({ id: `consolidated-line-${line.id}`, description: line.description, quantity: line.quantity, unit: 'ชิ้น', lineAmount: line.lineAmount, unitAmount: line.documentUnitPrice, productName: line.description })),
  }), [data]);
  const saleItems = useMemo(() => prepareDeliveryNoteSaleItems(sale), [sale]);
  const config = useMemo(() => buildDeliveryNoteBranchConfig(sale), [sale]);
  if (error) return <DeliveryNoteDocumentState status="error" message={error} />;
  if (!data || !sale) return <DeliveryNoteDocumentState status="loading" message="กำลังเตรียมใบส่งของรวม" />;
  return <DeliveryNotePrintShell sale={sale} saleItems={saleItems} config={config} hideDate={false} setHideDate={() => {}} editableDocumentLines={false} />;
};
export default PrintConsolidatedDeliveryPage;
