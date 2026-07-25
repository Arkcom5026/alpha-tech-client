import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { executePurchaseOrderSubmit } from '../controllers/purchaseOrderSubmitController';
import { mapProductToPurchaseOrderEditorItem } from '../mappers/purchaseOrderEditorProductMapper';
import { mapPurchaseOrderItems } from '../mappers/purchaseOrderItemMapper';
import {
  projectPurchaseOrderEditorState,
  projectPurchaseOrderSupplierCreditHint,
} from '../projections/purchaseOrderEditorProjection';
import { usePurchaseOrderStore } from '../store/purchaseOrderStore';

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

  const addProductToOrder = useCallback((product) => {
    setProducts((previous) => {
      const nextItem = mapProductToPurchaseOrderEditorItem(product);
      if (!nextItem) return previous;
      if (previous.some((row) => Number(row.productId || row.id) === nextItem.productId)) {
        return previous;
      }
      return [...previous, nextItem];
    });
  }, []);

  const handleCancel = useCallback(() => {
    navigate(`/${shopSlug}/pos/purchases`);
  }, [navigate, shopSlug]);

  const handleSubmit = useCallback(async () => {
    setSubmitError('');
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await executePurchaseOrderSubmit({
        mode,
        id,
        currentBranchId,
        supplier,
        products,
        note,
        shouldPrint,
        purchaseOrder,
        createPurchaseOrder,
        updatePurchaseOrder,
        shopSlug,
      });

      if (!result.ok) {
        if (result.error) setSubmitError(result.error);
        return;
      }

      navigate(result.destination);
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
