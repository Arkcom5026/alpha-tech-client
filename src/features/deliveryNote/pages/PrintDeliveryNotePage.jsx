// src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx
// 🏛️ Premium Next-Gen POS Delivery Note Workspace: (Force Re-Hydration Core Version)

import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import useSalesStore from '@/features/sales/store/salesStore';
import DeliveryNoteForm from '../components/DeliveryNoteForm';

const normalizeDocumentText = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const nullableDocumentText = (value) => {
  const normalized = normalizeDocumentText(value);
  return normalized || null;
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
  const location = useLocation();

  const saleStore = useSalesStore();
  const {
    getSaleByIdAction,
    updateSaleDocumentLinesAction,
    currentSale,
    setCurrentSale,
  } = saleStore;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hideDate, setHideDate] = useState(false);

  const [editingLineKey, setEditingLineKey] = useState(null);
  const [lineDrafts, setLineDrafts] = useState({});
  const [savingLineKey, setSavingLineKey] = useState(null);

  const navSale = useMemo(() => location.state?.sale || null, [location.key]);

  // 🟢 [DYNAMIC RESET CONTROL]: บังคับล้างสถานะใบขายเก่าในคลัง Store ทุกครั้งที่กดเปลี่ยนเลข saleId ป้องกันอาการจอนิ่ง
  useEffect(() => {
    if (saleId && typeof setCurrentSale === 'function') {
      setCurrentSale(null);
    }
  }, [saleId, setCurrentSale]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!saleId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        if (navSale && String(navSale.id) === String(saleId)) {
          setCurrentSale(navSale);

          const navBranch = navSale?.branch || null;
          const hasTaxId = Boolean(navBranch?.taxId || navSale?.branchTaxId);
          const hasBranchBasics = Boolean(
            navBranch?.address ||
            navBranch?.phone ||
            navBranch?.name ||
            navBranch?.companyName
          );

          const navHasItems =
            (Array.isArray(navSale?.items) && navSale.items.length > 0) ||
            (Array.isArray(navSale?.simpleItems) && navSale.simpleItems.length > 0);

          const needHydrate = !hasTaxId || !hasBranchBasics || !navHasItems;

          if (!needHydrate) {
            if (isMounted) setIsLoading(false);
            return;
          }
        }

        if (typeof getSaleByIdAction === 'function') {
          await getSaleByIdAction(saleId);
        }
      } catch (err) {
        if (isMounted) setError('ไม่สามารถโหลดข้อมูลใบส่งของได้');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [saleId, navSale, getSaleByIdAction, setCurrentSale]);

  const preparedSaleItems = useMemo(() => {
    if (!currentSale) return [];

    const src = Array.isArray(currentSale.simpleItems) && currentSale.simpleItems.length > 0
      ? currentSale.simpleItems
      : Array.isArray(currentSale.items)
        ? currentSale.items
        : [];

    const grouped = new Map();

    for (const item of src) {
      const product = item?.product || item?.stockItem?.product || item?.productSnapshot || null;
      const productIdRaw = product?.id ?? item?.productId ?? item?.stockItem?.productId ?? null;
      const productId = productIdRaw == null ? null : String(productIdRaw);

      const documentLine = buildSaleDocumentLine({
        ...item,
        product,
      });

      const key = [
        productId ? `product-${productId}` : `unknown-${item?.id ?? Math.random()}`,
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
        const stableId = productId ? `product-${productId}-${grouped.size}` : `unknown-${item?.id ?? grouped.size}`;

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
        const agg = grouped.get(key);
        if (isSnItem && item?.id) agg.saleItemIds.push(Number(item.id));
        if (!isSnItem && item?.id) agg.simpleItemIds.push(Number(item.id));
      }

      const agg = grouped.get(key);
      agg.quantity += quantity;
      agg.discount += discountEach;
    }

    return Array.from(grouped.values());
  }, [currentSale]);

  const handleToggleDocumentLineEdit = (item) => {
    const key = item?.documentLineKey || item?.id;
    if (!key) return;

    setEditingLineKey((current) => {
      if (current === key) return null;

      setLineDrafts((prev) => ({
        ...prev,
        [key]: {
          documentPrefix: item?.documentPrefix || '',
          documentDescriptionRaw: item?.documentDescriptionRaw || '',
          documentSuffix: item?.documentSuffix || '',
        },
      }));

      return key;
    });
  };

  const handleChangeDocumentLineDraft = (item, field, value) => {
    const key = item?.documentLineKey || item?.id;
    if (!key) return;

    setLineDrafts((prev) => ({
      ...prev,
      [key]: {
        documentPrefix: item?.documentPrefix || '',
        documentDescriptionRaw: item?.documentDescriptionRaw || '',
        documentSuffix: item?.documentSuffix || '',
        ...(prev?.[key] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveDocumentLine = async (item) => {
    const key = item?.documentLineKey || item?.id;
    if (!key || !saleId) return;

    if (typeof updateSaleDocumentLinesAction !== 'function') {
      setError('ไม่พบ action สำหรับบันทึกข้อความก่อน/หลังสินค้า');
      return;
    }

    const draft = {
      documentPrefix: item?.documentPrefix || '',
      documentDescriptionRaw: item?.documentDescriptionRaw || '',
      documentSuffix: item?.documentSuffix || '',
      ...(lineDrafts?.[key] || {}),
    };

    const saleItemIds = Array.isArray(item?.saleItemIds) ? item.saleItemIds : [];
    const simpleItemIds = Array.isArray(item?.simpleItemIds) ? item.simpleItemIds : [];

    const makePayloadLine = (id) => ({
      id,
      documentPrefix: nullableDocumentText(draft.documentPrefix),
      documentDescription: nullableDocumentText(draft.documentDescriptionRaw),
      documentSuffix: nullableDocumentText(draft.documentSuffix),
    });

    setSavingLineKey(key)
    setError('');

    try {
      const result = await updateSaleDocumentLinesAction(
        saleId,
        {
          items: saleItemIds.map(makePayloadLine),
          simpleItems: simpleItemIds.map(makePayloadLine),
        },
        { refresh: true }
      );

      if (!result?.ok) {
        setError(result?.error || 'บันทึกข้อความก่อน/หลังสินค้าไม่สำเร็จ');
        return;
      }

      setEditingLineKey(null);
      setLineDrafts((prev) => {
        const next = { ...(prev || {}) };
        delete next[key];
        return next;
      });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'บันทึกข้อความก่อน/หลังสินค้าไม่สำเร็จ';
      setError(msg);
    } finally {
      setSavingLineKey(null);
    }
  };

  // 🟢 FIXED: ปรับเปลี่ยนข้อความแจ้งสถานะโหลดข้อมูล ไม่ให้จมหายในเลเยอร์โหมดมืด
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
    // 🟢 FIXED: สลักคลาส CSS ตัดสิทธิ์ควบคุมความมืด ปรับพื้นที่หน้ากระดาษพิมพ์ A4 ตรงกลางให้เป็นสีขาว ตัวอักษรสีดำสนิท 100%
    // เติมคลาส bg-white text-black dark:bg-white dark:text-black ครอบคลุมพิกัดแผ่นฟอร์ม DeliveryNoteForm ทั้งผืน
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
          onToggleDocumentLineEdit={handleToggleDocumentLineEdit}
          onChangeDocumentLineDraft={handleChangeDocumentLineDraft}
          onSaveDocumentLine={handleSaveDocumentLine}
        />
      </div>
    </div>
  );
};

export default PrintDeliveryNotePage;