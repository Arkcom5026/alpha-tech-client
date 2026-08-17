import { buildDeliveryNoteBranchConfig } from '@/features/deliveryNote/print/workspace/policies/deliveryNotePrintPolicy';

export const CONSOLIDATED_DOCUMENT_SOURCE_TYPE = 'CONSOLIDATED_DELIVERY';
export const SALE_DOCUMENT_SOURCE_TYPE = 'SALE';

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

const resolveVatRate = (branch) => {
  const candidate = Number(branch?.receiptConfig?.vatRate ?? branch?.vatRate ?? 7);
  return Number.isFinite(candidate) && candidate >= 0 ? candidate : 7;
};

export const isConsolidatedDocumentSource = (value) => (
  String(value || '').trim().toUpperCase() === CONSOLIDATED_DOCUMENT_SOURCE_TYPE
);

export const buildConsolidatedSaleDocument = (data) => {
  if (!data?.document?.id) return null;

  const totalAmount = round2(data.document.totalAmount);
  const branch = data.branch || {};
  const vatRate = resolveVatRate(branch);
  const vat = vatRate > 0 ? round2((totalAmount * vatRate) / (100 + vatRate)) : 0;

  return {
    id: `consolidated-${data.document.id}`,
    documentSourceType: CONSOLIDATED_DOCUMENT_SOURCE_TYPE,
    documentSourceId: Number(data.document.id),
    code: data.document.number,
    officialDocumentNumber: data.document.number,
    createdAt: data.document.issuedAt,
    soldAt: data.document.issuedAt,
    totalAmount,
    vat,
    vatRate,
    paid: true,
    paidAmount: totalAmount,
    statusPayment: 'PAID',
    note: data.document.note || '',
    customer: data.customer || null,
    employee: data.createdBy || null,
    branch,
    saleLines: (Array.isArray(data.lines) ? data.lines : []).map((line) => ({
      id: line.id,
      lineType: 'CONSOLIDATED',
      description: line.description,
      documentPrefix: line.documentPrefix || '',
      documentDescription: line.documentDescription || '',
      documentSuffix: line.documentSuffix || '',
      quantity: Number(line.quantity || 0),
      unit: 'ชิ้น',
      unitPrice: Number(line.documentUnitPrice || 0),
      lineAmount: Number(line.lineAmount || 0),
      amount: Number(line.lineAmount || 0),
      sourceDocumentNo: line.sourceDocumentNo,
      sourceSaleCode: line.sourceSaleCode,
    })),
  };
};

export const buildConsolidatedBillProjection = (data) => {
  const sale = buildConsolidatedSaleDocument(data);
  if (!sale) return null;

  const vatRate = resolveVatRate(sale.branch);
  const saleItems = sale.saleLines.map((line) => {
    const quantity = Math.max(Number(line.quantity || 0), 0);
    const amount = round2(line.lineAmount);
    const unitInclVat = quantity > 0 ? amount / quantity : amount;
    const unitExVat = vatRate > 0 ? unitInclVat / (1 + vatRate / 100) : unitInclVat;
    const totalExVat = vatRate > 0 ? amount / (1 + vatRate / 100) : amount;
    const rawDescription = line.documentDescription || '';
    const displayDescription = rawDescription || line.description || 'สินค้า';

    return {
      id: `consolidated-line-${line.id}`,
      documentLineKey: `consolidated-line-${line.id}`,
      documentSourceLineId: Number(line.id),
      saleItemIds: [],
      simpleItemIds: [],
      documentPrefix: line.documentPrefix || '',
      documentDescriptionRaw: rawDescription,
      documentDescription: displayDescription,
      documentSuffix: line.documentSuffix || '',
      hasDocumentLine: Boolean(line.documentPrefix || rawDescription || line.documentSuffix),
      productName: line.description || 'สินค้า',
      productModel: '-',
      quantity,
      unit: line.unit || 'ชิ้น',
      amount,
      unitPriceExVat: round2(unitExVat),
      totalExVat: round2(totalExVat),
      sourceDocumentNo: line.sourceDocumentNo,
      sourceSaleCode: line.sourceSaleCode,
    };
  });

  const total = round2(saleItems.reduce((sum, item) => sum + Number(item.amount || 0), 0));
  const beforeVat = round2(saleItems.reduce((sum, item) => sum + Number(item.totalExVat || 0), 0));
  const vatAmount = round2(total - beforeVat);
  const documentHeaderConfig = buildDeliveryNoteBranchConfig(sale);
  const config = {
    ...documentHeaderConfig,
    vatRate,
    totals: { total, beforeVat, vatAmount },
  };
  const payment = {
    id: `consolidated-payment-${sale.documentSourceId}`,
    saleId: sale.id,
    paymentMethod: 'CUSTOMER_MONEY',
    method: 'CUSTOMER_MONEY',
    amount: total,
    note: sale.note || '',
    receivedAt: sale.createdAt,
    sale,
  };

  return { sale, payment, saleItems, config };
};
