



// src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx

import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import useSalesStore from '@/features/sales/store/salesStore';
import DeliveryNoteForm from '../components/DeliveryNoteForm';

const PrintDeliveryNotePage = () => {
  const { saleId } = useParams();
  const location = useLocation();

  const saleStore = useSalesStore();
  const { getSaleByIdAction, currentSale, setCurrentSale } = saleStore;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hideDate, setHideDate] = useState(false);

  // ✅ Avoid unstable deps from location.state object
  const navSale = useMemo(() => location.state?.sale || null, [location.key]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!saleId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {        // ✅ Prefer navigation state (fast path)
        // But for printing docs, we still hydrate from BE when branch/tax fields are missing.
        if (navSale && String(navSale.id) === String(saleId)) {
          setCurrentSale(navSale);

          const navBranch = navSale?.branch || null;
          const hasTaxId = Boolean(navBranch?.taxId || navSale?.branchTaxId);
          const hasBranchBasics = Boolean(navBranch?.address || navBranch?.phone || navBranch?.name || navBranch?.companyName);
          const needHydrate = !hasTaxId || !hasBranchBasics;

          if (!needHydrate) {
            if (isMounted) setIsLoading(false);
            return;
          }
          // continue to BE fetch (hydrate)
        }

        // ✅ Fallback: fetch from backend
        await getSaleByIdAction(saleId);
      } catch (err) {
                // ✅ No console.* in production path
        try {
          if (import.meta?.env?.DEV) {
            // eslint-disable-next-line no-console
            console.error('[PrintDeliveryNotePage] fetch sale error', err);
          }
        } catch (_) {
          // ignore
        }
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


  if (isLoading) {
    return <div className="p-4 text-center text-gray-600">กำลังโหลดข้อมูลใบส่งของ...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  if (!currentSale || String(currentSale.id) !== String(saleId)) {
    return <div className="p-4 text-center text-red-600">ไม่พบข้อมูลใบส่งของ หรือข้อมูลไม่ถูกต้อง</div>;
  }

  // ✅ Delivery Note (หน้างานจริง): รวมสินค้า 1 รายการต่อ 1 บรรทัด โดย group ตาม productId
  // - สินค้าเดียวกันในบิลเดียวกันต้องรวม qty (ตาม business rule)
  // - discount รวมเป็นยอดรวมของสินค้านั้น (sum ต่อชิ้น) เพื่อความปลอดภัยของยอดเงิน
  // - ไม่แสดง barcode/serial ในระดับ grouped (Delivery Note เน้นจำนวน ไม่เน้น trace รายชิ้น)
  const preparedSaleItems = (() => {
    const src = Array.isArray(currentSale.items) ? currentSale.items : [];
    const grouped = new Map();

    for (const item of src) {
      const product = item?.stockItem?.product;
      const productIdRaw = product?.id ?? null;
      const productId = productIdRaw == null ? null : String(productIdRaw);
      const key = productId ?? `unknown-${item?.id ?? Math.random()}`;

      const unitPrice = Number(item?.basePrice ?? 0) || 0;
      const discountEach = Number(item?.discount ?? 0) || 0;

      if (!grouped.has(key)) {
        grouped.set(key, {
          // key สำหรับ render row (deterministic)
          id: productId ? `product-${productId}` : `unknown-${item?.id ?? ''}`,
          productId: productIdRaw,
          // เก็บ stockItemId แค่ตัวแรกเพื่อความเข้ากันได้กับโค้ดเดิม (ไม่ได้ใช้เป็นหลัก)
          stockItemId: item?.stockItemId ?? item?.stockItem?.id ?? null,
          productName: product?.name || 'ไม่พบชื่อสินค้า',
          productModel: product?.model || '-',
          price: unitPrice,
          quantity: 0,
          unit: product?.unit?.name || product?.template?.unit?.name || '-',
          discount: 0,
          barcode: '-',
          serialNumber: '-',
        });
      }

      const agg = grouped.get(key);
      agg.quantity += 1;
      agg.discount += discountEach;

      // ✅ Guard (minimal): ถ้าราคาไม่เท่ากันในสินค้าเดียวกัน ให้คงราคาแรกไว้ตามกติกาหน้างาน
      // (ถือเป็น data anomaly มากกว่าจะทำให้เอกสารแตกบรรทัด)
      if (agg.price !== unitPrice && unitPrice !== 0) {
        // keep first price
      }
    }

    return Array.from(grouped.values());
  })();

    const branch = currentSale.branch || {};
  const preparedConfig = {
    // ✅ Prefer legal entity name when available
    branchName: branch.companyName || branch.name || '-',
    address: branch.address || '-',
    phone: branch.phone || '-',
    // ✅ Support normalized fallback from store
    taxId: branch.taxId || currentSale.branchTaxId || '-',
  };

  return (
    <div className="p-4 space-y-4">
      <DeliveryNoteForm
        sale={currentSale}
        hideDate={hideDate}
        setHideDate={setHideDate}
        saleItems={preparedSaleItems}
        config={preparedConfig}      />
    </div>
  );
};

export default PrintDeliveryNotePage;






