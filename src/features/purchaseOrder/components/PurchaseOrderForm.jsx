


// PurchaseOrderForm.jsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import PurchaseOrderSupplierSelector from '@/features/purchaseOrder/components/PurchaseOrderSupplierSelector';
import ProductSearchTable from '@/features/purchaseOrder/components/ProductSearchTable';
import PurchaseOrderTable from '@/features/purchaseOrder/components/PurchaseOrderTable';

// stores
import usePurchaseOrderStore from '@/features/purchaseOrder/store/purchaseOrderStore';
import useProductStore from '@/features/product/store/productStore';
import useSupplierStore from '@/features/supplier/store/supplierStore';


/**
 * PurchaseOrderForm (Create/Edit)
 * - เลือก Supplier + วันที่ + มัดจำ (advance)
 * - ค้นหาสินค้า (CascadingFilterGroup) → เพิ่มเข้าใบสั่งซื้อ → แก้ qty/cost
 * - บันทึก / พิมพ์
 *
 * ข้อกำหนด:
 * - ไม่เรียก API ตรงจาก Component: เรียกผ่าน Store เท่านั้น
 * - อินพุตตัวเลขชิดขวา, placeholder ตามมาตรฐาน
 */
const PurchaseOrderForm = ({
  mode = 'create',
  searchText = '',
  onSearchTextChange = () => {},
}) => {
  // ✅ helper: ตรวจว่าเป็นจำนวนเงินที่มากกว่า 0 (กันบิลล้มเมื่อ BE บังคับ costPrice > 0)
  const isPositiveMoney = (v) => {
    const n = Number.parseFloat(String(v ?? ''));
    return Number.isFinite(n) && n > 0;
  };
  const { id } = useParams();
  const navigate = useNavigate();

  // ────────────────────────────────────────────────────────────────────────────
  // Local state
  // ────────────────────────────────────────────────────────────────────────────
  const [supplier, setSupplier] = useState(null);
  const [creditHint, setCreditHint] = useState(null);
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [note, setNote] = useState('');
  const [products, setProducts] = useState([]); // [{ id, name, quantity, costPrice, ... }]
  const [shouldPrint, setShouldPrint] = useState(true);

  // UI-based alerts (ห้ามใช้ alert/toast)
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ฟิลเตอร์ค้นหา (แนวทางเดียวกับ ListProductPage + QuickReceiveSimpleForm)
  const [filter, setFilter] = useState({
    categoryId: '',
    productTypeId: '',
    productProfileId: '',
    productTemplateId: '', // ใช้คีย์เดียวกับ ListProductPage    // NOTE: Project #1 ใช้ ProductProfile เป็น "แบรนด์/ยี่ห้อ" อยู่แล้ว
    // ถ้ายังไม่มี brandId ในระบบจริง ให้เก็บไว้เป็นเผื่ออนาคต แต่ *ไม่ใช้เป็นเงื่อนไขค้นหา* เพื่อกันความสับสน
    brandId: '',
  });
  const [committedSearchText, setCommittedSearchText] = useState('');

  // ────────────────────────────────────────────────────────────────────────────
  // Stores
  // ────────────────────────────────────────────────────────────────────────────
  const { suppliers: supplierList = [] } = useSupplierStore();

  const {
    purchaseOrder,
    loading,
    fetchPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
  } = usePurchaseOrderStore();

  const {
    fetchProductsAction,
    products: fetchedProducts = [],
    dropdowns = {},
    ensureDropdownsAction,
  } = useProductStore();

  // ✅ Option A: Create PO ไม่รองรับ advance payments (ตัด supplier payment store ออกจากฟอร์มนี้)


  // ────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    try { navigate(-1); } catch { try { navigate('/pos/purchases/orders'); } catch { /* no-op */ } }
  }, [navigate]);

  const handleFilterChange = useCallback((patch) => {
    setFilter((prev) => {
      const updated = { ...prev, ...patch };
      if (patch.categoryId && patch.categoryId !== prev.categoryId) {
        updated.productTypeId = '';
        updated.productProfileId = '';
        updated.productTemplateId = '';
      } else if (patch.productTypeId && patch.productTypeId !== prev.productTypeId) {
        updated.productProfileId = '';
        updated.productTemplateId = '';
      } else if (patch.productProfileId && patch.productProfileId !== prev.productProfileId) {
        updated.productTemplateId = '';
      }
      return updated;
    });
  }, []);

  const addProductToOrder = useCallback((product) => {
    setProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [
        ...prev,
        {
          id: product.id,
          name: product.name || '-',
          model: product.model || '-',
          category: product.category || '-',
          productType: product.productType || '-',
          productProfile: product.productProfile || '-',
          productTemplate: product.productTemplate || '-',
          quantity: product.quantity || 1,
          costPrice: product.costPrice || 0,
        },
      ];
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    // reset message
    setSubmitError('');

    if (isSubmitting) return;
    if (!supplier?.id) {
      setSubmitError('กรุณาเลือก Supplier ก่อนบันทึก');
      return;
    }
    if (!Array.isArray(products) || products.length === 0) {
      setSubmitError('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    // ✅ กันอีกชั้น: ถ้ามีรายการใดราคาทุนเป็น 0/ว่าง → ไม่ให้บันทึก (UI-based)
    const zeroCostProducts = products.filter((p) => !isPositiveMoney(p?.costPrice));
    if (zeroCostProducts.length > 0) {
      const names = zeroCostProducts
        .map((p) => p?.name || '-')
        .slice(0, 5);

      setSubmitError(
        'ไม่สามารถบันทึกได้: กรุณากำหนดราคาทุนให้มากกว่า 0 ก่อน (พบราคาเป็น 0 ใน: ' +
          names.join(', ') +
          (zeroCostProducts.length > 5 ? ' ...' : '') +
          ')'
      );
      return;
    }

    // ✅ Sanitize items ให้เป็น number 100% ป้องกันกรณีเลือกหลายรายการแล้ว BE reject (string/NaN/empty)
    const safeItems = products
      .map((p) => {
        const productId = Number(p.id);
        const quantity = Number.parseInt(String(p.quantity ?? '1'), 10);
        const costPrice = Number.parseFloat(String(p.costPrice ?? '0'));

        return {
          productId,
          quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
          costPrice: Number.isFinite(costPrice) && costPrice > 0 ? costPrice : 0,
        };
      })
      .filter((it) => Number.isFinite(it.productId) && it.productId > 0);

    if (safeItems.length === 0) {
      setSubmitError('ไม่พบรายการสินค้าที่ถูกต้องสำหรับบันทึก');
      return;
    }

    const payload = {
      supplierId: supplier.id,
      date: orderDate,
      note,
      items: safeItems,
    };
    

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && id) {
        const updated = await updatePurchaseOrder(id, payload);
        if (!updated) {
          setSubmitError('บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง');
          return;
        }
        if (shouldPrint) navigate(`/pos/purchases/orders/print/${id}`);
        else navigate('/pos/purchases/orders');
      } else {
        const created = await createPurchaseOrder(payload);

        if (!created?.id) {
          setSubmitError('บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง');
          return;
        }
        if (shouldPrint) navigate(`/pos/purchases/orders/print/${created.id}`);
        else navigate('/pos/purchases/orders');
      }
    } catch (e) {
      console.error('[PO] submit error:', e);
      setSubmitError('เกิดข้อผิดพลาดระหว่างบันทึก กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  }, [supplier, products, orderDate, note, mode, id, shouldPrint, updatePurchaseOrder, createPurchaseOrder, navigate, isSubmitting]);

  // ────────────────────────────────────────────────────────────────────────────
  // Effects
  // ────────────────────────────────────────────────────────────────────────────
  // Ensure dropdowns ready
  useEffect(() => { try { ensureDropdownsAction(); } catch { /* no-op */ } }, [ensureDropdownsAction]);

  // (เสริม) โหลด dropdown ลูกอัตโนมัติตามลำดับชั้น
  useEffect(() => {
    try {
      if (filter.categoryId) {
        ensureDropdownsAction({ level: 'types', categoryId: Number(filter.categoryId) });
      }
      if (filter.productTypeId) {
        ensureDropdownsAction({ level: 'profiles', typeId: Number(filter.productTypeId) });
      }
      if (filter.productProfileId) {
        ensureDropdownsAction({ level: 'templates', profileId: Number(filter.productProfileId) });
      }
    } catch { /* no-op */ }
  }, [filter.categoryId, filter.productTypeId, filter.productProfileId, ensureDropdownsAction]);

  // Load for edit
  useEffect(() => {
    if (mode === 'edit' && id) {
      (async () => { try { await fetchPurchaseOrderById(id); } catch { /* no-op */ } })();
    }
  }, [mode, id, fetchPurchaseOrderById]);

  // Pump store data into local state when editing
  useEffect(() => {
    if (mode === 'edit' && purchaseOrder) {
      setSupplier(purchaseOrder.supplier);
      setOrderDate(purchaseOrder.date?.substring(0, 10) || orderDate);
      setNote(purchaseOrder.note || '');
      const enriched = (purchaseOrder.items || []).map((item) => ({
        id: item.productId,
        name: item.product?.name || '-',
        model: item.product?.model || '-',
        category: item.product?.category || '-',
        productType: item.product?.productType || '-',
        productProfile: item.product?.productProfile || '-',
        productTemplate: item.product?.productTemplate || '-',
        quantity: item.quantity,
        costPrice: item.costPrice,
      }));
      setProducts(enriched);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, purchaseOrder]);

  // When supplier changes → load credit (Option A: ไม่โหลด/ใช้ advance payments ในขั้น Create PO)
  useEffect(() => {
    if (!supplier?.id) {
      setCreditHint(null);
      return;
    }
    const s = supplierList.find((x) => x.id === supplier.id);
    setCreditHint(s ? { used: s.creditBalance || 0, total: s.creditLimit || 0 } : null);
  }, [supplier, supplierList]);

  // Search products when filters or committed text change
  useEffect(() => {
    const hasFilter = filter.categoryId || filter.productTypeId || filter.productProfileId || filter.productTemplateId;
    if (hasFilter || committedSearchText) {
      const params = {
        categoryId: filter.categoryId ? Number(filter.categoryId) : undefined,
        productTypeId: filter.productTypeId ? Number(filter.productTypeId) : undefined,
        productProfileId: filter.productProfileId ? Number(filter.productProfileId) : undefined,
        productTemplateId: filter.productTemplateId ? Number(filter.productTemplateId) : undefined,        searchText: committedSearchText || undefined,
      };
      try { fetchProductsAction(params); } catch { /* no-op */ }
    }
  }, [filter, committedSearchText, fetchProductsAction]);

  // ────────────────────────────────────────────────────────────────────────────
  // Derived
  // ────────────────────────────────────────────────────────────────────────────

  if (loading) return <p className="p-4">กำลังโหลดข้อมูล...</p>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-6"
    >

      {/* Supplier & Date */}
      <div className="flex gap-6 flex-wrap">
        <div className="w-[300px]">
          <Label>เลือก Supplier</Label>
          <PurchaseOrderSupplierSelector value={supplier} onChange={setSupplier} disabled={mode === 'edit'} />
          {creditHint && (
            <p className="text-sm text-muted-foreground mt-1">
              เครดิตโดยประมาณ: ฿{creditHint.total.toLocaleString()} / ใช้ไปแล้ว: ฿{creditHint.used.toLocaleString()}
            </p>
          )}
        </div>
        <div className="w-[300px]">
          <Label>วันที่สั่งซื้อ</Label>
          <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} readOnly={mode === 'edit'} />
        </div>
      </div>

      {/* ✅ Option A: ไม่รองรับการใช้เงินล่วงหน้าในขั้น Create PO */}
      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
        <div className="font-medium">หมายเหตุ</div>
        <div className="mt-1">
          ขั้นสร้างใบสั่งซื้อ (PO) ไม่รองรับการใช้/ผูกเงินล่วงหน้า (advance) — ให้ไปทำในขั้นตอนจ่ายเงิน Supplier ภายหลัง
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-2">
        <Label>ค้นหาสินค้า</Label>
        <CascadingFilterGroup
          value={filter}
          dropdowns={dropdowns}
          showSearch
          searchText={searchText}
          onSearchTextChange={onSearchTextChange}
          onSearchCommit={(text) => setCommittedSearchText(text.trim() || '')}
          onChange={(patch) => {
            // Normalize คีย์จาก CascadingFilterGroup ให้ตรงกับรูปแบบภายใน
            const normalized = {
              categoryId: patch.categoryId ?? patch.selectedCategoryId ?? patch.category ?? '',
              productTypeId: patch.productTypeId ?? patch.typeId ?? patch.selectedTypeId ?? patch.type ?? '',
              productProfileId: patch.productProfileId ?? patch.profileId ?? patch.selectedProfileId ?? patch.profile ?? '',
              productTemplateId: patch.productTemplateId ?? patch.templateId ?? patch.selectedTemplateId ?? patch.template ?? '',
              brandId: patch.brandId ?? patch.brand ?? patch.selectedBrandId ?? '',
            };
            handleFilterChange(normalized);
          }}
        />
      </div>

      {/* Search Result */}
      <ProductSearchTable
        results={fetchedProducts}
        onAdd={addProductToOrder}      />

      {/* Cart */}
      <PurchaseOrderTable products={products} setProducts={setProducts} editable={mode !== 'view'} />

      {/* Actions */}
      <div className="flex flex-col items-end px-4 gap-2">
        {submitError && (
          <div
            className="w-full rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
            aria-live="assertive"
          >
            {submitError}
          </div>
        )}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={shouldPrint} onChange={(e) => setShouldPrint(e.target.checked)} />
          <span className="text-sm text-gray-700">พิมพ์ใบสั่งซื้อ</span>
        </label>
        <div className="flex items-center gap-4">
          <StandardActionButtons
            onSave={() => {
              if (!isSubmitting) handleSubmit();
            }}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;




