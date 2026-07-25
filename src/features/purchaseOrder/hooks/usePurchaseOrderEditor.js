import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  buildCreatePurchaseOrderPayload,
  buildUpdatePurchaseOrderPayload,
} from '../builders/purchaseOrderPayloadBuilder';
import { mapPurchaseOrderItems } from '../mappers/purchaseOrderItemMapper';
import {
  canEditPurchaseOrder,
  getPurchaseOrderEditBlockedReason,
} from '../policies/purchaseOrderEditPolicy';
import { pickPurchaseOrderCostPrice } from '../policies/purchaseOrderPricingPolicy';
import { purchaseOrderSchema } from '../schema/purchaseOrderSchema';
import { usePurchaseOrderStore } from '../store/purchaseOrderStore';

const toPositiveInt = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

export const usePurchaseOrderEditor = ({ mode, currentBranchId, suppliers }) => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [note, setNote] = useState('');
  const [products, setProducts] = useState([]);
  const [shouldPrint, setShouldPrint] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const purchaseOrder = usePurchaseOrderStore((state) => state.purchaseOrder);
  const poLoading = usePurchaseOrderStore((state) => state.isLoading);
  const fetchPurchaseOrderById = usePurchaseOrderStore((state) => state.fetchPurchaseOrderById);
  const createPurchaseOrder = usePurchaseOrderStore((state) => state.createPurchaseOrder);
  const updatePurchaseOrder = usePurchaseOrderStore((state) => state.updatePurchaseOrder);
  const clearPurchaseOrder = usePurchaseOrderStore((state) => state.clearPurchaseOrder);

  useEffect(() => {
    if (!currentBranchId) {
      setSubmitError('ไม่พบข้อมูลสาขาของพนักงาน กรุณาเข้าสู่ระบบใหม่');
      return;
    }
    setSubmitError((previous) =>
      previous === 'ไม่พบข้อมูลสาขาของพนักงาน กรุณาเข้าสู่ระบบใหม่' ? '' : previous
    );
  }, [currentBranchId]);

  useEffect(() => {
    if (mode !== 'edit' || !id) {
      clearPurchaseOrder();
      return;
    }

    fetchPurchaseOrderById(id).catch(() => {});
  }, [mode, id, fetchPurchaseOrderById, clearPurchaseOrder]);

  useEffect(() => {
    if (mode !== 'edit' || !purchaseOrder) return;
    setSupplier(purchaseOrder.supplier || null);
    setOrderDate(
      purchaseOrder.createdAt?.substring(0, 10) ||
      new Date().toISOString().substring(0, 10)
    );
    setNote(purchaseOrder.note || '');
    setProducts(mapPurchaseOrderItems(purchaseOrder.items));
  }, [mode, purchaseOrder]);

  const creditHint = useMemo(() => {
    if (!supplier?.id) return null;
    const matchedSupplier = suppliers.find(
      (row) => Number(row.id) === Number(supplier.id)
    );
    if (!matchedSupplier) return null;
    return {
      used: Number(matchedSupplier.creditBalance) || 0,
      total: Number(matchedSupplier.creditLimit) || 0,
    };
  }, [supplier, suppliers]);

  const addProductToOrder = useCallback((product) => {
    setProducts((previous) => {
      const nextProductId = toPositiveInt(product?.productId ?? product?.id);
      if (!nextProductId) return previous;
      if (previous.some((row) => Number(row.productId || row.id) === nextProductId)) {
        return previous;
      }

      return [
        ...previous,
        {
          id: nextProductId,
          productId: nextProductId,
          name: product?.name || '-',
          model: product?.model || '-',
          category: product?.categoryName || product?.category || '-',
          productType: product?.productTypeName || product?.productType || '-',
          brandId: product?.brandId ?? null,
          brandName: product?.brandName || '-',
          templateTrace: product?.templateTrace || null,
          quantity: product?.quantity || 1,
          costPrice: pickPurchaseOrderCostPrice(product),
        },
      ];
    });
  }, []);

  const handleCancel = useCallback(() => {
    navigate(`/${shopSlug}/pos/purchases`);
  }, [navigate, shopSlug]);

  const handleSubmit = useCallback(async () => {
    setSubmitError('');
    if (isSubmitting) return;

    if (!currentBranchId) {
      setSubmitError('ไม่พบข้อมูลสาขาของพนักงาน กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    if (mode === 'edit' && purchaseOrder && !canEditPurchaseOrder(purchaseOrder)) {
      setSubmitError(getPurchaseOrderEditBlockedReason(purchaseOrder));
      return;
    }

    if (typeof purchaseOrderSchema?.validate === 'function') {
      const validation = purchaseOrderSchema.validate({
        mode,
        branchId: currentBranchId,
        supplierId: supplier?.id,
        products,
      });
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors || {})[0];
        if (firstError) setSubmitError(firstError);
        return;
      }
    }

    const payload =
      mode === 'edit'
        ? buildUpdatePurchaseOrderPayload({ note, products })
        : buildCreatePurchaseOrderPayload({ supplierId: supplier?.id, note, products });

    if (payload.items.length !== products.length) {
      setSubmitError('กรุณาตรวจสอบจำนวนและราคาทุนของสินค้าทุกรายการ');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && id) {
        const updated = await updatePurchaseOrder(id, payload);
        if (!updated?.success) {
          setSubmitError('บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง');
          return;
        }
        navigate(
          shouldPrint
            ? `/${shopSlug}/pos/purchases/orders/print/${id}`
            : `/${shopSlug}/pos/purchases/orders`
        );
        return;
      }

      const created = await createPurchaseOrder(payload);
      const createdId = created?.id || created?.data?.id;
      if (!createdId) {
        setSubmitError('บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง');
        return;
      }
      navigate(
        shouldPrint
          ? `/${shopSlug}/pos/purchases/orders/print/${createdId}`
          : `/${shopSlug}/pos/purchases/orders`
      );
    } catch (error) {
      console.error('[PO] submit error:', error);
      setSubmitError(
        String(
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          'เกิดข้อผิดพลาดระหว่างบันทึก กรุณาลองใหม่อีกครั้ง'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentBranchId,
    supplier,
    products,
    note,
    mode,
    id,
    shouldPrint,
    purchaseOrder,
    updatePurchaseOrder,
    createPurchaseOrder,
    navigate,
    isSubmitting,
    shopSlug,
  ]);

  return {
    poLoading,
    supplier,
    setSupplier,
    creditHint,
    orderDate,
    setOrderDate,
    note,
    setNote,
    products,
    setProducts,
    addProductToOrder,
    shouldPrint,
    setShouldPrint,
    submitError,
    handleCancel,
    handleSubmit,
    isSubmitting,
  };
};
