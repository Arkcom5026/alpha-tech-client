// src/features/product/quick-stock/hooks/useQuickStockProductController.js

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  INVENTORY_BEHAVIORS,
  buildCreateOperationalProductPayload,
  buildLocalOperationalProductPayload,
  buildPriceFormFromProduct,
  buildProductFormFromProduct,
  dedupeDiscoveryProducts,
  extractSingle,
  getFirstBranchPrice,
  getProductInventoryBehavior,
  getTemplateLookupId,
  isValidOperationalProductForAdoption,
  normalizeOperationalProduct,
  toMoneyNumber,
  toNumberOrNull,
} from "../utils/quickStockRuntimeUtils";

const buildEmptyLocalProductForm = () => ({
  name: "",
  productTypeId: "",
  brandId: "",
  unitId: "",
  mode: "SIMPLE",
  inventoryBehavior: INVENTORY_BEHAVIORS.TRACKED,
  trackSerialNumber: false,
  active: true,
});

const buildEmptyLocalPriceForm = () => ({
  costPrice: 0,
  priceRetail: "",
  priceWholesale: "",
  priceTechnician: "",
  priceOnline: "",
});

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

  getOperationalProductByTemplateIdAction,
  createOperationalProductFromTemplateAction,
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
  const [localProductForm, setLocalProductForm] = useState(buildEmptyLocalProductForm);
  const [localPriceForm, setLocalPriceForm] = useState(buildEmptyLocalPriceForm);

  const operationalProduct = selectedSearchOperationalProduct || adoptedOperationalProduct;
  const isTemplateOnlySelection = !!selectedTemplateProduct && !operationalProduct;
  const isOperationalSelection = !!operationalProduct?.id;
  const runtimeStatus = operationalProduct ? "READY" : selectedProduct ? "NOT_CREATED" : "IDLE";

  useEffect(() => {
    let cancelled = false;

    const lookupTemplateOperationalProduct = async () => {
      if (!selectedTemplateProduct) {
        setAdoptedOperationalProduct(null);
        setIsCheckingOperationalProduct(false);
        return;
      }

      const templateProductId = getTemplateLookupId(selectedTemplateProduct);
      if (!templateProductId) return;

      setAdoptedOperationalProduct(null);
      setIsCheckingOperationalProduct(true);

      try {
        const response = await getOperationalProductByTemplateIdAction(templateProductId);
        if (cancelled) return;

        const rawCandidate = extractSingle(response);
        if (isValidOperationalProductForAdoption(rawCandidate, selectedTemplateProduct)) {
          setAdoptedOperationalProduct(normalizeOperationalProduct(rawCandidate));
          return;
        }

        setAdoptedOperationalProduct(null);
      } catch (err) {
        if (!cancelled) {
          console.warn("QuickStock operational lookup did not find a branch product:", err);
          setAdoptedOperationalProduct(null);
        }
      } finally {
        if (!cancelled) setIsCheckingOperationalProduct(false);
      }
    };

    lookupTemplateOperationalProduct();

    return () => {
      cancelled = true;
    };
  }, [selectedTemplateProduct, getOperationalProductByTemplateIdAction]);

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
    setProductForm((prev) => {
      if (field === "mode") {
        const mode = String(value || "SIMPLE").toUpperCase();
        return {
          ...prev,
          mode,
          trackSerialNumber: mode === "STRUCTURED",
          inventoryBehavior:
            mode === "SIMPLE"
              ? prev.inventoryBehavior || INVENTORY_BEHAVIORS.TRACKED
              : INVENTORY_BEHAVIORS.TRACKED,
        };
      }
      if (field === "trackSerialNumber") {
        return {
          ...prev,
          trackSerialNumber: !!value,
          mode: value ? "STRUCTURED" : "SIMPLE",
          inventoryBehavior: value
            ? INVENTORY_BEHAVIORS.TRACKED
            : prev.inventoryBehavior || INVENTORY_BEHAVIORS.TRACKED,
        };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const updatePriceForm = useCallback((field, value) => {
    setPriceForm((prev) => ({ ...prev, [field]: value }));
    if (field === "costPrice") setDefaultCost(value);
  }, []);

  const updateLocalProductForm = useCallback((field, value) => {
    setLocalProductForm((prev) => {
      if (field === "mode") {
        const mode = String(value || "SIMPLE").toUpperCase();
        return {
          ...prev,
          mode,
          trackSerialNumber: mode === "STRUCTURED",
          inventoryBehavior:
            mode === "SIMPLE"
              ? prev.inventoryBehavior || INVENTORY_BEHAVIORS.TRACKED
              : INVENTORY_BEHAVIORS.TRACKED,
        };
      }
      if (field === "trackSerialNumber") {
        return {
          ...prev,
          trackSerialNumber: !!value,
          mode: value ? "STRUCTURED" : "SIMPLE",
          inventoryBehavior: value
            ? INVENTORY_BEHAVIORS.TRACKED
            : prev.inventoryBehavior || INVENTORY_BEHAVIORS.TRACKED,
        };
      }
      return { ...prev, [field]: value };
    });
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

  const handleCreateOperationalProductFromTemplate = useCallback(async () => {
    if (!selectedTemplateProduct || operationalProduct) return;

    const payload = buildCreateOperationalProductPayload(selectedTemplateProduct);
    if (!payload?.templateProductId) {
      toast.error("ไม่พบ Template Product ID สำหรับสร้างสินค้าในร้าน");
      return;
    }

    setIsCreatingOperationalProduct(true);

    try {
      const response = await createOperationalProductFromTemplateAction(payload);
      const rawCreatedProduct = extractSingle(response);

      if (!adoptOperationalProduct(rawCreatedProduct, selectedTemplateProduct)) {
        toast.error("สร้างสินค้าแล้ว แต่ข้อมูลที่ตอบกลับยังไม่ใช่ Operational Product ที่ถูกต้อง");
        return;
      }

      toast.success("สร้าง Operational Product จาก Template เรียบร้อย");
    } catch (err) {
      console.error("Create operational product from template failed:", err);
      toast.error(err?.message || "สร้าง Operational Product จาก Template ไม่สำเร็จ");
    } finally {
      setIsCreatingOperationalProduct(false);
    }
  }, [
    selectedTemplateProduct,
    operationalProduct,
    createOperationalProductFromTemplateAction,
    adoptOperationalProduct,
  ]);

  const handleCreateLocalOperationalProduct = useCallback(async () => {
    const payload = buildLocalOperationalProductPayload({
      productForm: localProductForm,
      priceForm: localPriceForm,
    });

    if (!payload.name) return toast.error("กรุณาระบุชื่อสินค้า");
    if (!payload.productTypeId) return toast.error("กรุณาเลือกประเภทสินค้า");
    if (payload.priceRetail <= 0) return toast.error("กรุณาระบุราคาขายปลีกก่อนสร้างสินค้า");
    if (payload.inventoryBehavior !== INVENTORY_BEHAVIORS.NON_STOCK && payload.costPrice < 0) {
      return toast.error("ราคาทุนต้องไม่ต่ำกว่า 0");
    }

    setIsCreatingOperationalProduct(true);

    try {
      const response = await createLocalOperationalProductAction(payload);
      const rawCreatedProduct = extractSingle(response);

      if (!adoptOperationalProduct(rawCreatedProduct, null)) {
        toast.error("สร้างสินค้าแล้ว แต่ข้อมูลที่ตอบกลับยังไม่ใช่ Operational Product ที่ถูกต้อง");
        return;
      }

      setLocalProductForm(buildEmptyLocalProductForm());
      setLocalPriceForm(buildEmptyLocalPriceForm());

      toast.success(
        payload.inventoryBehavior === INVENTORY_BEHAVIORS.NON_STOCK
          ? "สร้างค่าบริการแบบไม่ควบคุมสต็อกเรียบร้อย"
          : "สร้างสินค้า Local ของร้านเรียบร้อย"
      );
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

    const mode = String(productForm.mode || operationalProduct.mode || "SIMPLE").toUpperCase();
    const inventoryBehavior = mode === "SIMPLE"
      ? String(productForm.inventoryBehavior || INVENTORY_BEHAVIORS.TRACKED).toUpperCase()
      : null;

    setIsSavingProduct(true);

    try {
      await updateOperationalProductAction(operationalProduct.id, {
        name,
        productTypeId: toNumberOrNull(productForm.productTypeId),
        brandId: toNumberOrNull(productForm.brandId),
        unitId: toNumberOrNull(productForm.unitId),
        mode,
        ...(inventoryBehavior ? { inventoryBehavior } : {}),
        noSN: mode === "SIMPLE",
        trackSerialNumber: mode === "STRUCTURED",
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

      const nextProduct = normalizeOperationalProduct({
        ...operationalProduct,
        name,
        productTypeId: toNumberOrNull(productForm.productTypeId),
        brandId: toNumberOrNull(productForm.brandId),
        unitId: toNumberOrNull(productForm.unitId),
        mode,
        ...(inventoryBehavior ? { inventoryBehavior } : {}),
        noSN: mode === "SIMPLE",
        trackSerialNumber: mode === "STRUCTURED",
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
      });

      setAdoptedOperationalProduct((prev) =>
        prev && Number(prev?.id) === Number(nextProduct.id) ? { ...prev, ...nextProduct } : prev
      );
      setRuntimeSearchProducts((prev) =>
        dedupeDiscoveryProducts([nextProduct, ...(Array.isArray(prev) ? prev : [])])
      );
      setProductForm(buildProductFormFromProduct(nextProduct));
      setPriceForm(buildPriceFormFromProduct(nextProduct));
      setDefaultCost(String(nextProduct.costPrice ?? 0));
      toast.success("บันทึกข้อมูลสินค้าเรียบร้อย");
      setIsEditingProduct(false);
    } catch (err) {
      console.error("Quick edit product failed:", err);
      if (err?.code === "PRODUCT_OPERATIONAL_POLICY_LOCKED") {
        toast.error("ไม่สามารถเปลี่ยนโหมดหรือการควบคุมสต็อกได้ เพราะสินค้านี้มีประวัติใช้งานแล้ว");
      } else {
        toast.error(err?.message || "บันทึกข้อมูลสินค้าไม่สำเร็จ");
      }
    } finally {
      setIsSavingProduct(false);
    }
  }, [operationalProduct, productForm, priceForm, updateOperationalProductAction, setRuntimeSearchProducts]);

  const handleDeleteSelectedProductForRecovery = useCallback(async () => {
    if (!operationalProduct?.id) return;

    const ok = window.confirm(
      `ยืนยันลบสินค้าในช่วง Recovery?\n\n${operationalProduct.name}\n\nควรใช้เฉพาะรายการซ้ำ/ผิด และยังไม่มีประวัติรับเข้าเท่านั้น`
    );
    if (!ok) return;

    setIsDeletingProduct(true);

    try {
      const result = await deleteOperationalProductAction(operationalProduct.id);
      if (result === false) return toast.error("ลบสินค้าไม่สำเร็จ อาจมีประวัติใช้งานแล้ว");

      toast.success("ลบสินค้าเรียบร้อย");
      clearProductSelection();
      await executeProductSearch();
    } catch (err) {
      console.error("Delete product failed:", err);
      toast.error(err?.message || "ลบสินค้าไม่สำเร็จ");
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
    handleCreateOperationalProductFromTemplate,
    handleCreateLocalOperationalProduct,
    handleSaveProductInline,
    handleDeleteSelectedProductForRecovery,
    openLocalCreateForm,
    getProductInventoryBehavior,
  };
};

export default useQuickStockProductController;
