// src/features/purchaseOrder/hooks/usePurchaseOrderForm.js
// Purchase Order Form Hook
//
// Module isolation rule:
// - Purchase Order flow must not import/use Product store or Supplier store.
// - Purchase Order flow resolves current branch from authenticated employee state.
// - No shopSlug -> branch profile mapping.
// - No /branch-prices/profile-by-slug request.
//
// Cost price rule:
// - Product search for PO must use POS runtime endpoint:
//   GET /api/products/pos/search
// - This endpoint returns branch-scoped costPrice from BranchPrice / StockBalance runtime.

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/utils/apiClient';

import { purchaseOrderSchema } from '../schema/purchaseOrderSchema';
import { usePurchaseOrderStore } from '../store/purchaseOrderStore';
import { useAuthStore } from '@/features/auth/store/authStore';

const toPositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const toNumber = (value, fallback = 0) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const n = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : fallback;
};

const firstArray = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
};

const pickArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  return firstArray(
    payload?.items,
    payload?.products,
    payload?.data,
    payload?.data?.items,
    payload?.data?.products,
    payload?.rows,
    payload?.records
  );
};

const pickCostPrice = (row) => {
  const branchPrice = Array.isArray(row?.branchPrice)
    ? row.branchPrice[0]
    : row?.branchPrice;

  const branchPrices = Array.isArray(row?.branchPrices)
    ? row.branchPrices[0]
    : row?.branchPrices;

  const stockBalance = row?.stockBalance || row?.stockBalances?.[0] || null;

  return toNumber(
    row?.costPrice ??
      row?.cost ??
      row?.receivedCost ??
      row?.lastReceivedCost ??
      row?.purchaseCost ??
      branchPrice?.costPrice ??
      branchPrices?.costPrice ??
      stockBalance?.lastReceivedCost,
    0
  );
};

const normalizeProductTypeOption = (row) => {
  const id = toPositiveInt(row?.id ?? row?.productTypeId ?? row?.typeId);
  const name = String(row?.name ?? row?.label ?? row?.title ?? '').trim();
  if (!id || !name) return null;
  return {
    ...row,
    id,
    name,
    active: row?.active ?? row?.isActive ?? true,
  };
};

const normalizeBrandOption = (row) => {
  const id = toPositiveInt(row?.id ?? row?.brandId);
  const name = String(row?.name ?? row?.label ?? row?.title ?? '').trim();
  if (!id || !name) return null;
  return {
    ...row,
    id,
    name,
    active: row?.active ?? row?.isActive ?? true,
  };
};

const normalizeProductRow = (row) => {
  const id = toPositiveInt(row?.id ?? row?.productId);
  if (!id) return null;

  const brandName =
    row?.brand?.name ??
    row?.brandName ??
    row?.brand ??
    row?.productProfile ??
    '-';

  const costPrice = pickCostPrice(row);

  return {
    ...row,
    id,
    productId: id,
    name: row?.name ?? row?.title ?? '-',
    category: row?.category?.name ?? row?.categoryName ?? row?.category ?? '-',
    productType: row?.productType?.name ?? row?.productTypeName ?? row?.productType ?? '-',
    productProfile: brandName,
    brandId: row?.brand?.id ?? row?.brandId ?? null,
    brandName,
    productTemplate: row?.productTemplate?.name ?? row?.templateName ?? row?.productTemplate ?? '-',
    model: row?.model ?? row?.spec ?? '-',
    description: row?.description ?? '',
    costPrice,
    branchPrice: row?.branchPrice ?? row?.branchPrices ?? [],
    stockBalance: row?.stockBalance ?? null,
  };
};

export const usePurchaseOrderForm = (mode, searchText) => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();

  const authBranchId = useAuthStore((s) => (
    s?.employee?.branchId ??
    s?.employee?.branch?.id ??
    s?.currentEmployee?.branchId ??
    s?.currentEmployee?.branch?.id ??
    s?.branch?.id ??
    s?.branchId
  ));

  const currentBranchId = toPositiveInt(authBranchId);

  const [supplier, setSupplier] = useState(null);
  const [creditHint, setCreditHint] = useState(null);
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [note, setNote] = useState('');
  const [products, setProducts] = useState([]);
  const [shouldPrint, setShouldPrint] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [committedSearchText, setCommittedSearchText] = useState('');

  const [supplierList, setSupplierList] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  const [dropdowns, setDropdowns] = useState({
    productTypes: [],
    brands: [],
  });
  const [dropdownsLoading, setDropdownsLoading] = useState(false);

  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [filter, setFilter] = useState({
    productTypeId: '',
    brandId: '',
  });

  const {
    purchaseOrder,
    loading: poLoading,
    fetchPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
  } = usePurchaseOrderStore();

  useEffect(() => {
    if (!currentBranchId) {
      setSubmitError('ไม่พบข้อมูลสาขาของพนักงาน กรุณาเข้าสู่ระบบใหม่');
    } else {
      setSubmitError((prev) =>
        prev === 'ไม่พบข้อมูลสาขาของพนักงาน กรุณาเข้าสู่ระบบใหม่' ? '' : prev
      );
    }
  }, [currentBranchId]);

  useEffect(() => {
    if (!currentBranchId) {
      setSupplierList([]);
      return;
    }

    let alive = true;
    setSuppliersLoading(true);

    apiClient
      .get('suppliers', {
        params: {
          branchId: currentBranchId,
          _ts: Date.now(),
        },
      })
      .then(({ data }) => {
        if (!alive) return;
        setSupplierList(pickArray(data));
      })
      .catch((err) => {
        if (!alive) return;
        console.error('[PO] load suppliers failed:', err);
        setSupplierList([]);
      })
      .finally(() => {
        if (alive) setSuppliersLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [currentBranchId]);

  useEffect(() => {
    if (!currentBranchId) return;

    let alive = true;
    setDropdownsLoading(true);

    Promise.allSettled([
      apiClient.get('product-types/dropdowns', {
        params: {
          includeInactive: 'false',
          _ts: Date.now(),
        },
      }),
      apiClient.get('brands/dropdowns', {
        params: {
          includeInactive: 'false',
          _ts: Date.now(),
        },
      }),
    ])
      .then((results) => {
        if (!alive) return;

        const productTypesResult = results[0];
        const brandsResult = results[1];

        const productTypes =
          productTypesResult.status === 'fulfilled'
            ? pickArray(productTypesResult.value?.data).map(normalizeProductTypeOption).filter(Boolean)
            : [];

        const brands =
          brandsResult.status === 'fulfilled'
            ? pickArray(brandsResult.value?.data).map(normalizeBrandOption).filter(Boolean)
            : [];

        setDropdowns({
          productTypes,
          brands,
        });
      })
      .catch((err) => {
        if (!alive) return;
        console.error('[PO] load dropdowns failed:', err);
        setDropdowns({ productTypes: [], brands: [] });
      })
      .finally(() => {
        if (alive) setDropdownsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [currentBranchId]);

  useEffect(() => {
    const productTypeId = toPositiveInt(filter.productTypeId);
    if (!currentBranchId || !productTypeId) return;

    let alive = true;

    apiClient
      .get('brands/dropdowns', {
        params: {
          productTypeId,
          includeInactive: 'false',
          _ts: Date.now(),
        },
      })
      .then(({ data }) => {
        if (!alive) return;
        const brands = pickArray(data).map(normalizeBrandOption).filter(Boolean);
        setDropdowns((prev) => ({ ...prev, brands }));
      })
      .catch((err) => {
        if (!alive) return;
        console.error('[PO] load brands by product type failed:', err);
      });

    return () => {
      alive = false;
    };
  }, [currentBranchId, filter.productTypeId]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      (async () => {
        try {
          await fetchPurchaseOrderById(id);
        } catch {
          // no-op
        }
      })();
    }
  }, [mode, id, fetchPurchaseOrderById]);

  useEffect(() => {
    if (mode === 'edit' && purchaseOrder) {
      setSupplier(purchaseOrder.supplier);
      setOrderDate(purchaseOrder.date?.substring(0, 10) || orderDate);
      setNote(purchaseOrder.note || '');
      const enriched = (purchaseOrder.items || []).map((item) => ({
        id: item.productId,
        productId: item.productId,
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

  useEffect(() => {
    if (!supplier?.id) {
      setCreditHint(null);
      return;
    }

    const s = supplierList.find((x) => Number(x.id) === Number(supplier.id));
    setCreditHint(s ? { used: s.creditBalance || 0, total: s.creditLimit || 0 } : null);
  }, [supplier, supplierList]);

  // Product search owned by Purchase flow.
  // Important: use POS runtime endpoint so costPrice is available.
  useEffect(() => {
    const productTypeId = toPositiveInt(filter.productTypeId);
    const brandId = toPositiveInt(filter.brandId);
    const search = (committedSearchText || '').trim();

    const hasFilter = productTypeId || brandId || search;
    if (!currentBranchId || !hasFilter) {
      setFetchedProducts([]);
      return;
    }

    let alive = true;
    setProductsLoading(true);

    apiClient
      .get('products/pos/search', {
        params: {
          productTypeId: productTypeId || undefined,
          brandId: brandId || undefined,
          search: search || undefined,
          take: 50,
          pageSize: 50,
          activeOnly: 'true',
          _ts: Date.now(),
        },
      })
      .then(({ data }) => {
        if (!alive) return;
        const rows = pickArray(data).map(normalizeProductRow).filter(Boolean);
        setFetchedProducts(rows);
      })
      .catch((err) => {
        if (!alive) return;
        console.error('[PO] product search failed:', err);
        setFetchedProducts([]);
      })
      .finally(() => {
        if (alive) setProductsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [currentBranchId, filter, committedSearchText]);

  const handleCancel = useCallback(() => {
    navigate(`/${shopSlug}/pos/purchases`);
  }, [navigate, shopSlug]);

  const handleFilterChange = useCallback((patch) => {
    setFilter((prev) => {
      const updated = { ...prev, ...patch };

      if (
        Object.prototype.hasOwnProperty.call(patch, 'productTypeId') &&
        patch.productTypeId !== prev.productTypeId
      ) {
        updated.brandId = '';
      }

      return updated;
    });
  }, []);

  const handleCommitSearch = useCallback(() => {
    setCommittedSearchText((searchText || '').trim());
  }, [searchText]);

  const addProductToOrder = useCallback((product) => {
    setProducts((prev) => {
      const nextProductId = Number(product.productId || product.id);
      if (prev.some((p) => Number(p.productId || p.id) === nextProductId)) return prev;

      return [
        ...prev,
        {
          id: nextProductId,
          productId: nextProductId,
          name: product.name || '-',
          model: product.model || '-',
          category: product.category || '-',
          productType: product.productType || '-',
          productProfile: product.productProfile || '-',
          brandId: product.brandId ?? null,
          brandName: product.brandName || product.productProfile || '-',
          productTemplate: product.productTemplate || '-',
          quantity: product.quantity || 1,
          costPrice: pickCostPrice(product),
        },
      ];
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitError('');
    if (isSubmitting) return;

    if (!currentBranchId) {
      setSubmitError('ไม่พบข้อมูลสาขาของพนักงาน กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    if (typeof purchaseOrderSchema?.validate === 'function') {
      const validation = purchaseOrderSchema.validate({
        branchId: currentBranchId,
        supplierId: supplier?.id,
        products,
      });

      if (!validation.isValid) {
        const errorKeys = Object.keys(validation.errors);
        if (errorKeys.length > 0) {
          setSubmitError(validation.errors[errorKeys[0]]);
        }
        return;
      }
    }

    const safeItems = products
      .map((p) => ({
        productId: Number(p.productId || p.id),
        quantity: Number.parseInt(String(p.quantity ?? '1'), 10),
        costPrice: Number.parseFloat(String(p.costPrice ?? '0')),
      }))
      .filter((it) => Number.isFinite(it.productId) && it.productId > 0);

    const payload = {
      branchId: currentBranchId,
      supplierId: supplier?.id,
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
        const createdId = created?.id || created?.data?.id;
        if (!createdId) return setSubmitError('บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง');
        navigate(shouldPrint ? `/${shopSlug}/pos/purchases/orders/print/${createdId}` : `/${shopSlug}/pos/purchases/orders`);
      }
    } catch (e) {
      console.error('[PO] submit error:', e);
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        'เกิดข้อผิดพลาดระหว่างบันทึก กรุณาลองใหม่อีกครั้ง';
      setSubmitError(String(msg));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentBranchId,
    supplier,
    products,
    orderDate,
    note,
    mode,
    id,
    shouldPrint,
    updatePurchaseOrder,
    createPurchaseOrder,
    navigate,
    isSubmitting,
    shopSlug,
  ]);

  return {
    loading: poLoading || dropdownsLoading || suppliersLoading,
    supplier,
    setSupplier,
    suppliers: supplierList,
    suppliersLoading,
    creditHint,
    orderDate,
    setOrderDate,
    products,
    setProducts,
    filter,
    handleFilterChange,
    handleCommitSearch,
    fetchedProducts,
    productsLoading,
    addProductToOrder,
    shouldPrint,
    setShouldPrint,
    submitError,
    handleCancel,
    handleSubmit,
    isSubmitting,
    dropdowns,
    currentBranchId,
  };
};
