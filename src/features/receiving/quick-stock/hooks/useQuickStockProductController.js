// src/features/receiving/quick-stock/hooks/useQuickStockProductController.js

import { useCallback, useEffect, useState } from "react";
import { feedback as toast } from '@/design-system';

import {
  buildCreateOperationalProductPayload,
  buildLocalOperationalProductPayload,
  buildPriceFormFromProduct,
  buildProductFormFromProduct,
  dedupeDiscoveryProducts,
  extractSingle,
  getFirstBranchPrice,
  isValidOperationalProductForAdoption,
  normalizeOperationalProduct,
  toMoneyNumber,
  toNumberOrNull,
} from "../utils/quickStockRuntimeUtils";

const useQuickStockProductController = ({
  selectedProduct,
  selectedTemplateProduct,
  selectedSearchOperationalProduct,
  productList,
  setSelectedProductId,
  setShowSearchResult,
  setRuntimeSearchProducts,
  selectedProductTypeId,
  selectedBrandId,
  keyword,
  committedKeyword,
  resetQueue,
  executeProductSearch,

  materializeTemplateProductAction,
  createLocalOperationalProductAction,
  updateOperationalProductAction,
  deleteOperationalProductAction,
} = {}) => {
  const [adoptedOperationalProduct, setAdoptedOperationalProduct] = useState(null);
  const [isCheckingOperationalProduct, setIsCheckingOperationalProduct] = useState(false);
  const [isCreatingOperationalProduct, setIsCreatingOperationalProduct] = useState(false);
  const [isLocalCreateOpen, setIsLocalCreateOpen] = useState(false);

  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const [defaultCost, setDefaultCost] = useState(0);

  const [productForm, setProductForm] = useState(buildProductFormFromProduct(null));
  const [priceForm, setPriceForm] = useState(buildPriceFormFromProduct(null));
  const [localProductForm, setLocalProductForm] = useState({
    name: "",
    productTypeId: "",
    brandId: "",
    unitId: "",
    trackSerialNumber: false,
    active: true,
  });
  const [localPriceForm, setLocalPriceForm] = useState({
    costPrice: 0,
    priceRetail: "",
    priceWholesale: "",
    priceTechnician: "",
    priceOnline: "",
  });

  const operationalProduct = selectedSearchOperationalProduct || adoptedOperationalProduct;
  const isTemplateOnlySelection = !!selectedTemplateProduct && !operationalProduct;
  const isOperationalSelection = !!operationalProduct?.id;
  const runtimeStatus = operationalProduct
    ? "READY"
    : selectedTemplateProduct && isCreatingOperationalProduct
      ? "MATERIALIZING"
      : selectedProduct
        ? "NOT_CREATED"
        : "IDLE";

  const adoptOperationalProduct = useCallback((rawProduct, sourceProduct = null) => {
    if (!isValidOperationalProductForAdoption(rawProduct, sourceProduct)) return false;

    const nextOperationalProduct = normalizeOperationalProduct(rawProduct);
    setAdoptedOperationalProduct(nextOperationalProduct);
    setRuntimeSearchProducts((prev) =>
      dedupeDiscoveryProducts([nextOperationalProduct, ...(Array.isArray(prev) ? prev : [])])
    );

    setProductForm(buildProductFormFromProduct(nextOperationalProduct));
    const nextPriceForm = buildPriceFormFromProduct(nextOperationalProduct);
    setPriceForm(nextPriceForm);
    setDefaultCost(nextPriceForm.costPrice ?? 0);
    setSelectedProductId(`OPERATIONAL:${nextOperationalProduct.id}`);
    setIsLocalCreateOpen(false);
    resetQueue();

    return true;
  }, [resetQueue, setRuntimeSearchProducts, setSelectedProductId]);

  useEffect(() => {
    if (!selectedTemplateProduct || operationalProduct) return;

    const payload = buildCreateOperationalProductPayload(selectedTemplateProduct);
    if (!payload?.templateProductId) {
      toast.error("ไม่พบ Template Product ID สำหรับเตรียมสินค้าในร้าน");
      return;
    }

    let active = true;
    setIsCheckingOperationalProduct(false);
    setIsCreatingOperationalProduct(true);

    const materializeTemplateProduct = async () => {
      try {
        const response = await materializeTemplateProductAction(payload);
        if (!active) return;

        const rawProduct = extractSingle(response);
        if (!adoptOperationalProduct(rawProduct, selectedTemplateProduct)) {
          toast.error("เตรียมสินค้าในร้านแล้ว แต่ข้อมูลที่ตอบกลับยังไม่ใช่ Operational Product ที่ถูกต้อง");
        }
      } catch (err) {
        if (!active) return;
        console.error("Quick Receipt template materialization failed:", err);
        toast.error(err?.message || "เตรียมสินค้า Template สำหรับรับเข้าไม่สำเร็จ");
      } finally {
        if (active) setIsCreatingOperationalProduct(false);
      }
    };

    materializeTemplateProduct();

    return () => {
      active = false;
    };
  }, [
    selectedTemplateProduct,
    operationalProduct,
    materializeTemplateProductAction,
    adoptOperationalProduct,
  ]);

  useEffect(() => {
    if (!operationalProduct) {
      setProductForm(buildProductFormFromProduct(null));
      setPriceForm(buildPriceFormFromProduct(null));
      setDefaultCost("");
      setIsEditingProduct(false);
      return;
    }

    const nextProductForm = buildProductFormFromProduct(operationalProduct);
    const nextPriceForm = buildPriceFormFromProduct(operationalProduct);

    setProductForm(nextProductForm);
    setPriceForm(nextPriceForm);
    setDefaultCost(nextPriceForm.costPrice ?? 0);
    setIsEditingProduct(false);
  }, [operationalProduct]);

  const clearProductSelection = useCallback(() => {
    setSelectedProductId("");
    setShowSearchResult(true);
    setAdoptedOperationalProduct(null);
    setIsEditingProduct(false);
    setIsLocalCreateOpen(false);
    setProductForm(buildProductFormFromProduct(null));
    setPriceForm(buildPriceFormFromProduct(null));
    setDefaultCost("");
    resetQueue();
  }, [resetQueue, setSelectedProductId, setShowSearchResult]);

  const updateProductForm = useCallback((field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updatePriceForm = useCallback((field, value) => {
    setPriceForm((prev) => ({ ...prev, [field]: value }));
    if (field === "costPrice") setDefaultCost(value);
  }, []);

  const updateLocalProductForm = useCallback((field, value) => {
    setLocalProductForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateLocalPriceForm = useCallback((field, value) => {
    setLocalPriceForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const selectProduct = useCallback((productId) => {
    const nextSelected = productList.find(
      (product) =>
        `${product.__quickStockDiscoverySource}:${product.id}` === String(productId) ||
        String(product.id) === String(productId)
    );

    setSelectedProductId(
      nextSelected ? `${nextSelected.__quickStockDiscoverySource}:${nextSelected.id}` : String(productId)
    );
    setAdoptedOperationalProduct(null);
    setIsLocalCreateOpen(false);
    setShowSearchResult(false);
    resetQueue();
  }, [productList, resetQueue, setSelectedProductId, setShowSearchResult]);

  const handleCreateLocalOperationalProduct = useCallback(async () => {
    const payload = buildLocalOperationalProductPayload({
      productForm: localProductForm,
      priceForm: localPriceForm,
    });

    if (!payload.name) return toast.error("กรุณาระบุชื่อสินค้า");
    if (!payload.productTypeId) return toast.error("กรุณาเลือกประเภทสินค้า");
    if (payload.costPrice == null || payload.priceRetail <= 0) {
      return toast.error("กรุณาระบุราคาทุนและราคาขายปลีกก่อนสร้างสินค้า");
    }

    setIsCreatingOperationalProduct(true);

    try {
      const response = await createLocalOperationalProductAction(payload);
      const rawCreatedProduct = extractSingle(response);

      if (!adoptOperationalProduct(rawCreatedProduct, null)) {
        toast.error("สร้างสินค้าแล้ว แต่ข้อมูลที่ตอบกลับยังไม่ใช่ Operational Product ที่ถูกต้อง");
        return;
      }

      setLocalProductForm({
        name: "",
        productTypeId: "",
        brandId: "",
        unitId: "",
        trackSerialNumber: false,
        active: true,
      });
      setLocalPriceForm({
        costPrice: 0,
        priceRetail: "",
        priceWholesale: "",
        priceTechnician: "",
        priceOnline: "",
      });

      toast.success("สร้างสินค้า Local ของร้านเรียบร้อย");
    } catch (err) {
      console.error("Create local operational product failed:", err);
      toast.error(err?.message || "สร้างสินค้า Local ไม่สำเร็จ");
    } finally {
      setIsCreatingOperationalProduct(false);
    }
  }, [localProductForm, localPriceForm, createLocalOperationalProductAction, adoptOperationalProduct]);

  const handleSaveProductInline = useCallback(async () => {
    if (!operationalProduct?.id) return;

    const name = String(productForm.name || "").trim();
    if (!name) return toast.error("ชื่อสินค้าห้ามว่าง");
    if (toMoneyNumber(priceForm.priceRetail) <= 0) return toast.error("ราคาขายปลีกต้องมากกว่า 0");

    setIsSavingProduct(true);

    try {
      await updateOperationalProductAction(operationalProduct.id, {
        name,
        productTypeId: toNumberOrNull(productForm.productTypeId),
        brandId: toNumberOrNull(productForm.brandId),
        unitId: toNumberOrNull(productForm.unitId),
        mode: operationalProduct.mode || (productForm.trackSerialNumber ? "STRUCTURED" : "SIMPLE"),
        noSN: operationalProduct.noSN ?? !productForm.trackSerialNumber,
        trackSerialNumber: !!productForm.trackSerialNumber,
        active: !!productForm.active,
        branchPrice: {
          costPrice: toMoneyNumber(priceForm.costPrice),
          priceRetail: toMoneyNumber(priceForm.priceRetail),
          priceWholesale: toMoneyNumber(priceForm.priceWholesale),
          priceTechnician: toMoneyNumber(priceForm.priceTechnician),
          priceOnline: toMoneyNumber(priceForm.priceOnline),
          isActive: true,
        },
      });

      const nextProduct = {
        ...operationalProduct,
        name,
        productTypeId: toNumberOrNull(productForm.productTypeId),
        brandId: toNumberOrNull(productForm.brandId),
        unitId: toNumberOrNull(productForm.unitId),
        trackSerialNumber: !!productForm.trackSerialNumber,
        active: !!productForm.active,
        costPrice: toMoneyNumber(priceForm.costPrice),
        priceRetail: toMoneyNumber(priceForm.priceRetail),
        priceWholesale: toMoneyNumber(priceForm.priceWholesale),
        priceTechnician: toMoneyNumber(priceForm.priceTechnician),
        priceOnline: toMoneyNumber(priceForm.priceOnline),
        hasPrice: true,
        branchPriceActive: true,
        branchPrice: [
          {
            ...(getFirstBranchPrice(operationalProduct) || {}),
            costPrice: toMoneyNumber(priceForm.costPrice),
            priceRetail: toMoneyNumber(priceForm.priceRetail),
            priceWholesale: toMoneyNumber(priceForm.priceWholesale),
            priceTechnician: toMoneyNumber(priceForm.priceTechnician),
            priceOnline: toMoneyNumber(priceForm.priceOnline),
            isActive: true,
          },
        ],
      };

      setAdoptedOperationalProduct((prev) =>
        prev && Number(prev?.id) === Number(nextProduct.id) ? { ...prev, ...nextProduct } : prev
      );
      setRuntimeSearchProducts((prev) =>
        dedupeDiscoveryProducts([normalizeOperationalProduct(nextProduct), ...(Array.isArray(prev) ? prev : [])])
      );
      setProductForm(buildProductFormFromProduct(nextProduct));
      setPriceForm(buildPriceFormFromProduct(nextProduct));
      setDefaultCost(String(nextProduct.costPrice ?? 0));
      toast.success("บันทึกข้อมูลสินค้าเรียบร้อย");
      setIsEditingProduct(false);
    } catch (err) {
      console.error("Quick edit product failed:", err);
      toast.error(err?.message || "บันทึกข้อมูลสินค้าไม่สำเร็จ");
    } finally {
      setIsSavingProduct(false);
    }
  }, [operationalProduct, productForm, priceForm, updateOperationalProductAction, setRuntimeSearchProducts]);

  const handleDeleteSelectedProductForRecovery = useCallback(async () => {
    if (!operationalProduct?.id) return;

    setIsDeletingProduct(true);

    try {
      const result = await deleteOperationalProductAction(operationalProduct.id);
      if (result === false) {
        toast.error("ลบสินค้าไม่สำเร็จ อาจมีประวัติใช้งานแล้ว");
        return false;
      }

      toast.success("ลบสินค้าเรียบร้อย");
      clearProductSelection();
      await executeProductSearch();
      return true;
    } catch (err) {
      console.error("Delete product failed:", err);
      toast.error(err?.message || "ลบสินค้าไม่สำเร็จ");
      return false;
    } finally {
      setIsDeletingProduct(false);
    }
  }, [operationalProduct, deleteOperationalProductAction, clearProductSelection, executeProductSearch]);

  const openLocalCreateForm = useCallback(() => {
    setIsLocalCreateOpen(true);
    setLocalProductForm((prev) => ({
      ...prev,
      name: keyword || committedKeyword || prev.name,
      productTypeId: selectedProductTypeId || prev.productTypeId,
      brandId: selectedBrandId || prev.brandId,
    }));
  }, [keyword, committedKeyword, selectedProductTypeId, selectedBrandId]);

  return {
    adoptedOperationalProduct,
    setAdoptedOperationalProduct,
    isCheckingOperationalProduct,
    setIsCheckingOperationalProduct,
    isCreatingOperationalProduct,
    setIsCreatingOperationalProduct,
    isLocalCreateOpen,
    setIsLocalCreateOpen,

    isEditingProduct,
    setIsEditingProduct,
    isSavingProduct,
    setIsSavingProduct,
    isDeletingProduct,
    setIsDeletingProduct,

    defaultCost,
    setDefaultCost,
    productForm,
    setProductForm,
    priceForm,
    setPriceForm,
    localProductForm,
    setLocalProductForm,
    localPriceForm,
    setLocalPriceForm,

    operationalProduct,
    isTemplateOnlySelection,
    isOperationalSelection,
    runtimeStatus,

    clearProductSelection,
    updateProductForm,
    updatePriceForm,
    updateLocalProductForm,
    updateLocalPriceForm,
    selectProduct,
    adoptOperationalProduct,
    handleCreateLocalOperationalProduct,
    handleSaveProductInline,
    handleDeleteSelectedProductForRecovery,
    openLocalCreateForm,
  };
};

export default useQuickStockProductController;
