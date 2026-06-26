// src/features/purchaseOrder/hooks/usePurchaseOrderForm.js

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// 🟢 อัปเกรดสัญญา Validation Contract ให้เรียกใช้ออบเจกต์จริงตามมาตรฐานวิศวกรรมตัวดั้งเดิม
import { purchaseOrderSchema } from '../schema/purchaseOrderSchema';

// stores
import { usePurchaseOrderStore } from '../store/purchaseOrderStore';
import useProductStore from '@/features/product/store/productStore';
import useSupplierStore from '@/features/supplier/store/supplierStore';

// 🟢 [REFACTORED] ถอดถอนพารามิเตอร์ onSearchTextChange ออกถาวรเพื่อสยบบั๊ก no-unused-vars
export const usePurchaseOrderForm = (mode, searchText) => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();

  // Local States
  const [currentBranchId, setCurrentBranchId] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [creditHint, setCreditHint] = useState(null);
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [note, setNote] = useState('');
  const [products, setProducts] = useState([]);
  const [shouldPrint, setShouldPrint] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [committedSearchText, setCommittedSearchText] = useState('');
  
  const [filter, setFilter] = useState({
    categoryId: '',
    productTypeId: '',
    brandId: '',
  });

  // Stores Binding
  const { suppliers: supplierList = [] } = useSupplierStore();
  const { purchaseOrder, loading, fetchPurchaseOrderById, createPurchaseOrder, updatePurchaseOrder } = usePurchaseOrderStore();
  const { fetchProductsAction, products: fetchedProducts = [], dropdowns = {}, ensureDropdownsAction } = useProductStore();

  // 1. Tenant Hydration: แปลงคำย่อ URL (slug) เป็นไอดีสาขาจริงจากฐานข้อมูล
  useEffect(() => {
    const fetchBranchIdBySlug = async () => {
      try {
        const response = await axios.get(`/api/branch-prices/profile-by-slug/${shopSlug}`);
        if (response.data?.id) {
          setCurrentBranchId(Number(response.data.id));
        }
      } catch (err) {
        console.error('[PO Form Tenant Mapping Error]', err);
        setSubmitError('ล้มเหลว: ไม่สามารถระบุเลขรหัสประจำร้านค้าจาก Database ได้');
      }
    };
    if (shopSlug) fetchBranchIdBySlug();
  }, [shopSlug]);

  // 2. Ensure Dropdowns Ready
  useEffect(() => {
    try { ensureDropdownsAction(); } catch { /* no-op */ }
  }, [ensureDropdownsAction]);

  useEffect(() => {
    try {
      if (filter.categoryId) {
        ensureDropdownsAction({ categoryId: Number(filter.categoryId) });
      }
    } catch { /* no-op */ }
  }, [filter.categoryId, ensureDropdownsAction]);

  // 3. Load Data for Edit Mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      (async () => { try { await fetchPurchaseOrderById(id); } catch { /* no-op */ } })();
    }
  }, [mode, id, fetchPurchaseOrderById]);

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
  }, [mode, purchaseOrder, orderDate]);

  // 4. Supplier Credit Watcher
  useEffect(() => {
    if (!supplier?.id) {
      setCreditHint(null);
      return;
    }
    const s = supplierList.find((x) => x.id === supplier.id);
    setCreditHint(s ? { used: s.creditBalance || 0, total: s.creditLimit || 0 } : null);
  }, [supplier, supplierList]);

  // 5. Products Multi-Filter Search Watcher
  useEffect(() => {
    const hasFilter = filter.categoryId || filter.productTypeId || filter.brandId;
    if (hasFilter || committedSearchText) {
      const params = {
        categoryId: filter.categoryId ? Number(filter.categoryId) : undefined,
        productTypeId: filter.productTypeId ? Number(filter.productTypeId) : undefined,
        brandId: filter.brandId ? Number(filter.brandId) : undefined,
        searchText: committedSearchText || undefined,
      };
      try { fetchProductsAction(params); } catch { /* no-op */ }
    }
  }, [filter, committedSearchText, fetchProductsAction]);

  // Handlers
  const handleCancel = useCallback(() => {
    navigate(`/${shopSlug}/pos/purchases`);
  }, [navigate, shopSlug]);

  const handleFilterChange = useCallback((patch) => {
    setFilter((prev) => {
      const updated = { ...prev, ...patch };
      if (Object.prototype.hasOwnProperty.call(patch, 'categoryId') && patch.categoryId !== prev.categoryId) {
        updated.productTypeId = '';
      }
      return updated;
    });
  }, []);

  const handleCommitSearch = useCallback(() => {
    setCommittedSearchText((searchText || '').trim());
  }, [searchText]);

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
    setSubmitError('');
    if (isSubmitting) return;

    // 🚀 ยิงทดสอบ Validation Contract ตามผังโครงสร้างสากลเดิมที่คุณวางโครงไว้
    const validation = purchaseOrderSchema.validate({
      branchId: currentBranchId,
      supplierId: supplier?.id,
      products: products,
    });

    if (!validation.isValid) {
      const errorKeys = Object.keys(validation.errors);
      if (errorKeys.length > 0) {
        setSubmitError(validation.errors[errorKeys[0]]);
      }
      return;
    }

    // Sanitize Items แปลงเป็น Number 100% ป้องกันกรณี BE ดีดบิลล้มกลับมา
    const safeItems = products
      .map((p) => ({
        productId: Number(p.id),
        quantity: Number.parseInt(String(p.quantity ?? '1'), 10),
        costPrice: Number.parseFloat(String(p.costPrice ?? '0')),
      }))
      .filter((it) => Number.isFinite(it.productId) && it.productId > 0);

    const payload = {
      branchId: currentBranchId,
      supplierId: supplier.id,
      date: orderDate,
      note,
      items: safeItems,
    };

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && id) {
        const updated = await updatePurchaseOrder(id, payload);
        if (!updated) return setSubmitError('บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง');
        navigate(shouldPrint ? `/${shopSlug}/pos/purchases/orders/print/${id}` : `/${shopSlug}/pos/purchases/orders`);
      } else {
        const created = await createPurchaseOrder(payload);
        if (!created?.id) return setSubmitError('บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง');
        navigate(shouldPrint ? `/${shopSlug}/pos/purchases/orders/print/${created.id}` : `/${shopSlug}/pos/purchases/orders`);
      }
    } catch (e) {
      console.error('[PO] submit error:', e);
      setSubmitError('เกิดข้อผิดพลาดระหว่างบันทึก กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentBranchId, supplier, products, orderDate, note, mode, id, shouldPrint, updatePurchaseOrder, createPurchaseOrder, navigate, isSubmitting, shopSlug]);

  return {
    loading, supplier, setSupplier, creditHint, orderDate, setOrderDate,
    products, setProducts, filter, handleFilterChange, handleCommitSearch,
    fetchedProducts, addProductToOrder, shouldPrint, setShouldPrint,
    submitError, handleCancel, handleSubmit, isSubmitting, dropdowns
  };
};