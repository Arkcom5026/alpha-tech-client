import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { materializePurchaseOrderTemplateProduct } from '../api/purchaseOrderApi';
import { executePurchaseOrderSubmit } from '../controllers/purchaseOrderSubmitController';
import { mapProductToPurchaseOrderEditorItem } from '../mappers/purchaseOrderEditorProductMapper';
import { mapPurchaseOrderItems } from '../mappers/purchaseOrderItemMapper';
import {
  projectPurchaseOrderEditorState,
  projectPurchaseOrderSupplierCreditHint,
} from '../projections/purchaseOrderEditorProjection';
import { usePurchaseOrderStore } from '../store/purchaseOrderStore';

const toPositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const unwrapMaterializedProduct = (payload) =>
  payload?.product || payload?.data || payload;

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
  const submitRef = useRef(false);

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

    const projected = projectPurchaseOrderEditorState(
      purchaseOrder,
      new Date().toISOString().substring(0, 10)
    );

    setSupplier(projected.supplier);
    setOrderDate(projected.orderDate);
    setNote(projected.note);
    setProducts(mapPurchaseOrderItems(projected.items));
  }, [mode, purchaseOrder]);

  const creditHint = useMemo(
    () => projectPurchaseOrderSupplierCreditHint(supplier, suppliers),
    [supplier, suppliers]
  );

  const addProductToOrder = useCallback(async (product) => {
    if (submitRef.current) return null;

    let operationalProduct = product;

    if (mode === 'create' && (product?.discoverySource === 'TEMPLATE' || product?.isTemplateProduct === true)) {
      const templateProductId = toPositiveInt(product?.templateProductId || product?.id);
      if (!templateProductId) {
        throw new Error('ไม่พบรหัสสินค้า Template ที่ต้องการนำเข้า');
      }

      const materialized = await materializePurchaseOrderTemplateProduct(templateProductId);
      if (submitRef.current) return null;

      const localProduct = unwrapMaterializedProduct(materialized);
      const localProductId = toPositiveInt(localProduct?.productId || localProduct?.id);
      if (!localProductId) {
        throw new Error('ไม่สามารถสร้างสินค้าในร้านจาก Template ได้');
      }

      operationalProduct = {
        ...localProduct,
        productId: localProductId,
        id: localProductId,
        quantity: product?.quantity || 1,
        costPrice: product?.costPrice ?? localProduct?.costPrice ?? 0,
        discoverySource: 'LOCAL',
        isTemplateProduct: false,
        templateProductId,
        templateTrace: product?.name || localProduct?.templateTrace || null,
      };
    }

    setProducts((previous) => {
      const nextItem = mapProductToPurchaseOrderEditorItem(operationalProduct);
      if (!nextItem) return previous;
      if (previous.some((row) => Number(row.productId || row.id) === nextItem.productId)) {
        return previous;
      }
      return [...previous, nextItem];
    });

    return operationalProduct;
  }, [mode]);

  const handleCancel = useCallback(() => {
    if (submitRef.current) return;
    navigate(`/${shopSlug}/pos/purchases`);
  }, [navigate, shopSlug]);

  const handleSubmit = useCallback(async () => {
    setSubmitError('');
    if (isSubmitting || submitRef.current) return;

    const submitSnapshot = {
      mode,
      id,
      currentBranchId,
      supplier,
      products: products.map((item) => ({ ...item })),
      note,
      shouldPrint,
      purchaseOrder,
      shopSlug,
    };

    submitRef.current = true;
    setIsSubmitting(true);
    try {
      const result = await executePurchaseOrderSubmit({
        ...submitSnapshot,
        createPurchaseOrder,
        updatePurchaseOrder,
      });

      if (!result.ok) {
        if (result.error) setSubmitError(result.error);
        return;
      }

      navigate(result.destination);
    } finally {
      submitRef.current = false;
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
