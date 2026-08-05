import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  loadSaleDocument,
  useSaleDocumentLineEditor,
} from '@/features/sales/documents/workspace';
import DeliveryNoteForm from '../components/DeliveryNoteForm';
import DeliveryNoteDocumentState from '../components/workspace/DeliveryNoteDocumentState';

const normalizeDocumentText = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const resolveSaleItemProductName = (item) => {
  const product = item?.product || item?.stockItem?.product || item?.productSnapshot || null;
  return product?.name || item?.productName || item?.name || 'ไม่พบชื่อสินค้า';
};

const buildSaleDocumentLineDescription = (item) => {
  const documentDescription = normalizeDocumentText(item?.documentDescription);
  return documentDescription || resolveSaleItemProductName(item);
};

const buildSaleDocumentLine = (item) => ({
  documentPrefix: normalizeDocumentText(item?.documentPrefix),
  documentDescriptionRaw: normalizeDocumentText(item?.documentDescription),
  documentDescription: buildSaleDocumentLineDescription(item),
  documentSuffix: normalizeDocumentText(item?.documentSuffix),
});

const buildPrintableProductName = (documentLine) =>
  [documentLine?.documentPrefix, documentLine?.documentDescription, documentLine?.documentSuffix]
    .map((value) => normalizeDocumentText(value))
    .filter(Boolean)
    .join('\n');

const buildBranchFullAddress = (branch = {}) => {
  const subdistrict = branch?.subdistrict || null;
  const district = subdistrict?.district || null;
  const province = district?.province || null;

  const fullAddress = [
    branch?.address,
    subdistrict?.nameTh ? `ต.${subdistrict.nameTh}` : null,
    district?.nameTh ? `อ.${district.nameTh}` : null,
    province?.nameTh ? `จ.${province.nameTh}` : null,
    subdistrict?.postcode,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullAddress || '-';
};

const PrintDeliveryNotePage = () => {
  const { saleId } = useParams();
  const [currentSale, setCurrentSale] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [hideDate, setHideDate] = useState(false);

  const reloadSaleDocument = useCallback(async () => {
    if (!saleId) {
      setCurrentSale(null);
      return null;
    }
    const sale = await loadSaleDocument({ saleId });
    setCurrentSale(sale || null);
    return sale || null;
  }, [saleId]);

  const {
    editingLineKey,
    lineDrafts,
    savingLineKey,
    error: editorError,
    actions: documentLineActions,
  } = useSaleDocumentLineEditor({ saleId, reload: reloadSaleDocument });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!saleId) {
        if (isMounted) {
          setCurrentSale(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setPageError('');
      documentLineActions.clearError();
      setCurrentSale(null);

      try {
        const sale = await loadSaleDocument({ saleId });
        if (isMounted) setCurrentSale(sale || null);
      } catch (error) {
        if (isMounted) {
          setPageError(
            error?.response?.data?.error ||
              error?.response?.data?.message ||
              error?.message ||
              'ไม่สามารถโหลดข้อมูลใบส่งสินค้าได้'
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [saleId]);

  const preparedSaleItems = useMemo(() => {
    if (!currentSale) return [];

    const source = Array.isArray(currentSale.saleLines) && currentSale.saleLines.length > 0
      ? currentSale.saleLines
      : [
          ...(Array.isArray(currentSale.items) ? currentSale.items : []),
          ...(Array.isArray(currentSale.simpleItems) ? currentSale.simpleItems : []),
        ];

    const grouped = new Map();

    for (const [sourceIndex, item] of source.entries()) {
      const product = item?.product || item?.stockItem?.product || item?.productSnapshot || null;
      const productIdRaw = product?.id ?? item?.productId ?? item?.stockItem?.productId ?? null;
      const productId = productIdRaw == null ? null : String(productIdRaw);
      const documentLine = buildSaleDocumentLine({ ...item, product });
      const key = [
        productId ? `product-${productId}` : `unknown-${item?.id ?? sourceIndex}`,
        `prefix-${documentLine.documentPrefix}`,
        `description-${documentLine.documentDescription}`,
        `suffix-${documentLine.documentSuffix}`,
      ].join('|');
      const isSnItem = Boolean(item?.stockItemId || item?.stockItem?.id);
      const unitPrice = isSnItem
        ? Number(item?.price ?? item?.unitPrice ?? item?.basePrice ?? 0) || 0
        : Number(item?.unitPrice ?? item?.price ?? item?.basePrice ?? item?.sellPrice ?? 0) || 0;
      const quantity = isSnItem ? 1 : Math.max(1, Number(item?.quantity ?? item?.qty ?? 1) || 1);
      const discountEach = isSnItem ? 0 : Number(item?.discount ?? item?.discountAmount ?? 0) || 0;

      if (!grouped.has(key)) {
        const stableId = productId ? `product-${productId}-${grouped.size}` : `unknown-${item?.id ?? sourceIndex}`;
        grouped.set(key, {
          id: stableId,
          documentLineKey: key,
          productId: productIdRaw,
          stockItemId: item?.stockItemId ?? item?.stockItem?.id ?? null,
          saleItemIds: isSnItem && item?.id ? [Number(item.id)] : [],
          simpleItemIds: !isSnItem && item?.id ? [Number(item.id)] : [],
          documentPrefix: documentLine.documentPrefix,
          documentDescriptionRaw: documentLine.documentDescriptionRaw,
          documentDescription: documentLine.documentDescription,
          documentSuffix: documentLine.documentSuffix,
          hasDocumentLine: Boolean(documentLine.documentPrefix || documentLine.documentSuffix),
          productName: buildPrintableProductName(documentLine),
          productModel: product?.model || item?.productModel || '-',
          price: unitPrice,
          quantity: 0,
          unit: product?.unit?.name || item?.unit || 'ชิ้น',
          discount: 0,
          barcode: '-',
          serialNumber: '-',
        });
      } else {
        const aggregate = grouped.get(key);
        if (isSnItem && item?.id) aggregate.saleItemIds.push(Number(item.id));
        if (!isSnItem && item?.id) aggregate.simpleItemIds.push(Number(item.id));
      }

      const aggregate = grouped.get(key);
      aggregate.quantity += quantity;
      aggregate.discount += discountEach;
    }

    return Array.from(grouped.values());
  }, [currentSale]);

  const error = pageError || editorError;

  if (isLoading) {
    return <DeliveryNoteDocumentState status="loading" message="ระบบกำลังโหลดข้อมูลและจัดเตรียมเอกสารสำหรับพิมพ์" />;
  }

  if (error) {
    return <DeliveryNoteDocumentState status="error" message={error} />;
  }

  if (!currentSale) {
    return <DeliveryNoteDocumentState status="empty" message="ไม่พบรายการขายที่ใช้สร้างใบส่งสินค้านี้" />;
  }

  const branch = currentSale.branch || {};
  const preparedConfig = {
    branchName: branch.companyName || branch.name || '-',
    address: buildBranchFullAddress(branch),
    phone: branch.phone || '-',
    taxId: branch.taxId || currentSale.branchTaxId || '-',
  };

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-5 text-black print:bg-white print:p-0 md:px-6 md:py-8">
      <section className="mx-auto max-w-[210mm] rounded-2xl bg-white p-3 shadow-sm print:rounded-none print:p-0 print:shadow-none md:p-5">
        <DeliveryNoteForm
          sale={currentSale}
          hideDate={hideDate}
          setHideDate={setHideDate}
          saleItems={preparedSaleItems}
          config={preparedConfig}
          editableDocumentLines
          editingLineKey={editingLineKey}
          lineDrafts={lineDrafts}
          savingLineKey={savingLineKey}
          onToggleDocumentLineEdit={documentLineActions.toggle}
          onChangeDocumentLineDraft={documentLineActions.change}
          onSaveDocumentLine={documentLineActions.save}
        />
      </section>
    </main>
  );
};

export default PrintDeliveryNotePage;
