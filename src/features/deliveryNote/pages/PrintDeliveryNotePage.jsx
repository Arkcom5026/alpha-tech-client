// src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx
// 🏛️ Premium Next-Gen POS Delivery Note Workspace: (Server Authority Edition)

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  loadSaleDocument,
  useSaleDocumentLineEditor,
} from '@/features/sales/documents/workspace';
import DeliveryNoteForm from '../components/DeliveryNoteForm';

const normalizeDocumentText = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const resolveSaleItemProductName = (item) => {
  const product =
    item?.product ||
    item?.stockItem?.product ||
    item?.productSnapshot ||
    null;

  return (
    product?.name ||
    item?.productName ||
    item?.name ||
    'ไม่พบชื่อสินค้า'
  );
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
  [
    documentLine?.documentPrefix,
    documentLine?.documentDescription,
    documentLine?.documentSuffix,
  ]
    .map((x) => normalizeDocumentText(x))
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
  } = useSaleDocumentLineEditor({
    saleId,
    reload: reloadSaleDocument,
  });

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
      } catch (err) {
        if (isMounted) {
          setPageError(
            err?.response?.data?.error ||
              err?.response?.data?.message ||
              err?.message ||
              'ไม่สามารถโหลดข้อมูลใบส่งของได้'
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

    // `saleLines` is the preferred server document projection. Keep the legacy
    // fallback for older responses and merge serialised and SIMPLE line stores.
    const src = Array.isArray(currentSale.saleLines) && currentSale.saleLines.length > 0
      ? currentSale.saleLines
      : [
          ...(Array.isArray(currentSale.items) ? currentSale.items : []),
          ...(Array.isArray(currentSale.simpleItems) ? currentSale.simpleItems : []),
        ];

    const grouped = new Map();

    for (const [sourceIndex, item] of src.entries()) {
      const product = item?.product || item?.stockItem?.product || item?.productSnapshot || null;
      const productIdRaw = product?.id ?? item?.productId ?? item?.stockItem?.productId ?? null;
      const productId = productIdRaw == null ? null : String(productIdRaw);

      const documentLine = buildSaleDocumentLine({
        ...item,
        product,
      });

      const key = [
        productId ? `product-${productId}` : `unknown-${item?.id ?? sourceIndex}`,
        `prefix-${documentLine.documentPrefix}`,
        `description-${documentLine.documentDescription}`,
        `suffix-${documentLine.documentSuffix}`,
      ].join('|');

      const isSnItem = Boolean(item?.stockItemId || item?.stockItem?.id);

      const unitPrice = isSnItem
        ? (Number(item?.price ?? item?.unitPrice ?? item?.basePrice ?? 0) || 0)
        : (Number(item?.unitPrice ?? item?.price ?? item?.basePrice ?? item?.sellPrice ?? 0) || 0);

      const quantity = isSnItem
        ? 1
        : Math.max(1, Number(item?.quantity ?? item?.qty ?? 1) || 1);

      const discountEach = isSnItem
        ? 0
        : (Number(item?.discount ?? item?.discountAmount ?? 0) || 0);

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
    return <div className="p-8 text-center text-zinc-400 font-bold bg-slate-900 min-h-screen">⏳ กำลังสตรีมโครงสร้างใบส่งของ A4...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-rose-400 font-black bg-slate-900 min-h-screen">⚠️ {error}</div>;
  }

  if (!currentSale) {
    return <div className="p-8 text-center text-zinc-400 font-bold bg-slate-900 min-h-screen">❌ ไม่พบชุดข้อมูลโครงสร้างของใบขายรายการนี้</div>;
  }

  const branch = currentSale.branch || {};
  const preparedConfig = {
    branchName: branch.companyName || branch.name || '-',
    address: buildBranchFullAddress(branch),
    phone: branch.phone || '-',
    taxId: branch.taxId || currentSale.branchTaxId || '-',
  };

  return (
    <div className="w-full min-h-screen bg-white text-black dark:bg-white dark:text-black py-8 px-4 print:p-0 print:bg-white animate-fadeIn">
      <div className="mx-auto max-w-[210mm] bg-white text-black dark:bg-white dark:text-black p-2 print:p-0">
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
      </div>
    </div>
  );
};

export default PrintDeliveryNotePage;
