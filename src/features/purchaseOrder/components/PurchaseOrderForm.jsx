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
import useSupplierPaymentStore from '@/features/supplierPayment/store/supplierPaymentStore';

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
export default function PurchaseOrderForm({
  mode = 'create',
  searchText = '',
  onSearchTextChange = () => {},
}) {
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
  const [selectedAdvance, setSelectedAdvance] = useState([]); // advance payments used
  const [shouldPrint, setShouldPrint] = useState(true);

  // ฟิลเตอร์ค้นหา (แนวทางเดียวกับ ListProductPage + QuickReceiveSimpleForm)
  const [filter, setFilter] = useState({
    categoryId: '',
    productTypeId: '',
    productProfileId: '',
    productTemplateId: '', // ใช้คีย์เดียวกับ ListProductPage
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
    createPurchaseOrderWithAdvance,
    updatePurchaseOrder,
  } = usePurchaseOrderStore();

  const {
    fetchProductsAction,
    products: fetchedProducts = [],
    dropdowns = {},
    ensureDropdownsAction,
  } = useProductStore();

  const {
    advancePaymentsBySupplier = {},
    fetchAdvancePaymentsBySupplierAction,
  } = useSupplierPaymentStore();

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
    if (!supplier || products.length === 0) return;
    const payload = {
      supplierId: supplier.id,
      date: orderDate,
      note,
      items: products.map((p) => ({
        productId: p.id,
        quantity: p.quantity,
        costPrice: p.costPrice || 0,
      })),
      advancePaymentsUsed: selectedAdvance.map((adv) => ({
        paymentId: adv.id,
        amount: adv.debitAmount || 0,
      })),
    };
    try {
      if (mode === 'edit' && id) {
        const updated = await updatePurchaseOrder(id, payload);
        if (updated) {
          if (shouldPrint) navigate(`/pos/purchases/orders/print/${id}`);
          else navigate('/pos/purchases/orders');
        }
      } else {
        const created = await createPurchaseOrderWithAdvance(payload);
        if (created?.id) {
          if (shouldPrint) navigate(`/pos/purchases/orders/print/${created.id}`);
          else navigate('/pos/purchases/orders');
        }
      }
    } catch (e) {
      // ให้ store/Call site จัดการ error; ที่นี่ไม่ alert
      console.error('[PO] submit error:', e);
    }
  }, [supplier, products, orderDate, note, selectedAdvance, mode, id, shouldPrint, updatePurchaseOrder, createPurchaseOrderWithAdvance, navigate]);

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

  // When supplier changes → load credit + advance payments
  useEffect(() => {
    if (!supplier?.id) {
      setCreditHint(null);
      setSelectedAdvance([]);
      return;
    }
    const s = supplierList.find((x) => x.id === supplier.id);
    setCreditHint(s ? { used: s.creditBalance || 0, total: s.creditLimit || 0 } : null);
    try { fetchAdvancePaymentsBySupplierAction(supplier.id); } catch { /* no-op */ }
    setSelectedAdvance([]);
  }, [supplier, supplierList, fetchAdvancePaymentsBySupplierAction]);

  // Search products when filters or committed text change
  useEffect(() => {
    const hasFilter = filter.categoryId || filter.productTypeId || filter.productProfileId || filter.productTemplateId || filter.brandId;
    if (hasFilter || committedSearchText) {
      const params = {
        categoryId: filter.categoryId ? Number(filter.categoryId) : undefined,
        productTypeId: filter.productTypeId ? Number(filter.productTypeId) : undefined,
        productProfileId: filter.productProfileId ? Number(filter.productProfileId) : undefined,
        productTemplateId: filter.productTemplateId ? Number(filter.productTemplateId) : undefined,
        brandId: filter.brandId ? Number(filter.brandId) : undefined,
        searchText: committedSearchText || undefined,
      };
      try { fetchProductsAction(params); } catch { /* no-op */ }
    }
  }, [filter, committedSearchText, fetchProductsAction]);

  // ────────────────────────────────────────────────────────────────────────────
  // Derived
  // ────────────────────────────────────────────────────────────────────────────
  const advancePayments = useMemo(() => advancePaymentsBySupplier?.[supplier?.id] ?? [], [advancePaymentsBySupplier, supplier]);

  if (loading) return <p className="p-4">กำลังโหลดข้อมูล...</p>;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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

      {/* Advance payments (optional) */}
      {advancePayments.length > 0 && (
        <div>
          <Label>เลือกยอดมัดจำที่จะใช้กับใบสั่งซื้อนี้</Label>
          <div className="space-y-1 mt-2">
            {advancePayments.map((adv) => {
              const isSelected = selectedAdvance.some((s) => s.id === adv.id);
              return (
                <div key={adv.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      setSelectedAdvance((prev) => (e.target.checked ? [...prev, adv] : prev.filter((p) => p.id !== adv.id)));
                    }}
                  />
                  <span>
                    ยอดชำระล่วงหน้า: ฿{adv.debitAmount != null ? adv.debitAmount.toLocaleString() : 'ไม่ระบุ'} | วันที่: {adv.paidAt ? new Date(adv.paidAt).toLocaleDateString() : 'ไม่ระบุ'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
              productTemplateId: patch.productTemplateId ?? patch.productTemplateId ?? patch.selectedproductTemplateIdte ?? '',
              brandId: patch.brandId ?? patch.brand ?? patch.selectedBrandId ?? '',
            };
            handleFilterChange(normalized);
          }}
        />
      </div>

      {/* Search Result */}
      <ProductSearchTable
        results={fetchedProducts}
        onAdd={addProductToOrder}
        filterKey={`${filter.categoryId}|${filter.productTypeId}|${filter.productProfileId}|${filter.productTemplateId}|${filter.brandId}|${committedSearchText}`}
      />

      {/* Cart */}
      <PurchaseOrderTable products={products} setProducts={setProducts} editable={mode !== 'view'} />

      {/* Actions */}
      <div className="flex flex-col items-end px-4 gap-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={shouldPrint} onChange={(e) => setShouldPrint(e.target.checked)} />
          <span className="text-sm text-gray-700">พิมพ์ใบสั่งซื้อ</span>
        </label>
        <div className="flex items-center gap-4">
          <StandardActionButtons onSave={handleSubmit} onCancel={handleCancel} />
        </div>
      </div>
    </form>
  );
}

