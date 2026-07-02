import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useProductStore from "@/features/product/store/productStore";
import { toast } from "react-toastify";

import ProductFinderPanel from "../components/quick-stock/ProductFinderPanel";
import ProductMasterPanel from "../components/quick-stock/ProductMasterPanel";
import IntakeControlPanel from "../components/quick-stock/IntakeControlPanel";
import IntakeQueueTable from "../components/quick-stock/IntakeQueueTable";
import QueueSummary from "../components/quick-stock/QueueSummary";
import CommitBar from "../components/quick-stock/CommitBar";

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const toNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toMoneyString = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : "";
};

const toMoneyNumber = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const getProductBrandId = (product) =>
  product?.brandId ?? product?.brand?.id ?? null;

const getProductTypeId = (product) =>
  product?.productTypeId ?? product?.productType?.id ?? null;

const getProductUnitId = (product) =>
  product?.unitId ?? product?.unit?.id ?? null;

const getProductUnitName = (product) =>
  product?.unit?.name ?? product?.unitName ?? "-";

const getProductTypeName = (product) =>
  product?.productType?.name ?? product?.productTypeName ?? "-";

const getBrandName = (product) =>
  product?.brand?.name ?? product?.brandName ?? "-";

const buildProductFormFromProduct = (product) => ({
  name: product?.name || "",
  productTypeId: String(getProductTypeId(product) || ""),
  brandId: String(getProductBrandId(product) || ""),
  unitId: String(getProductUnitId(product) || ""),
  trackSerialNumber: !!product?.trackSerialNumber,
  active: product?.active !== false,
});

const getFirstBranchPrice = (product) => {
  if (!product) return null;
  if (Array.isArray(product.branchPrice)) return product.branchPrice[0] || null;
  if (product.branchPrice && typeof product.branchPrice === "object") return product.branchPrice;
  return null;
};

const buildPriceFormFromProduct = (product) => {
  const bp = getFirstBranchPrice(product);

  return {
    costPrice: toMoneyString(product?.costPrice ?? bp?.costPrice),
    priceRetail: toMoneyString(product?.priceRetail ?? bp?.priceRetail),
    priceWholesale: toMoneyString(product?.priceWholesale ?? bp?.priceWholesale),
    priceTechnician: toMoneyString(product?.priceTechnician ?? bp?.priceTechnician),
    priceOnline: toMoneyString(product?.priceOnline ?? bp?.priceOnline),
  };
};

const isTemplateCatalogProduct = (product) => {
  if (!product) return false;

  // Search result from Template Catalog / T01 must never be rendered as Operational Product.
  if (product.isTemplateProduct === true) return true;
  if (String(product.templateBranchCode || "").toUpperCase() === "T01") return true;
  if (Number(product.templateBranchId) === 1) return true;

  // Current template-search API maps templateProductId to self id.
  if (
    product.templateProductId != null &&
    product.id != null &&
    Number(product.templateProductId) === Number(product.id)
  ) {
    return true;
  }

  return false;
};

const isOperationalBranchProduct = (product) => {
  if (!product) return false;
  return !isTemplateCatalogProduct(product);
};

const QuickStockPage = () => {
  const barcodeInputRef = useRef(null);
  const serialInputRefs = useRef({});

  const {
    products = [],
    dropdowns = {},
    dropdownsLoading,
    isLoading,
    error,

    fetchDropdownsAction,
    fetchProducts,
    fetchProductsAction,
    updateProduct,
    deleteProductAction,
    quickStockIntakeExistingAction,
    quickStockInAllInOneAction,
  } = useProductStore();

  const productTypes = dropdowns?.productTypes || dropdowns?.types || [];
  const brands = dropdowns?.brands || [];
  const units = dropdowns?.units || [];

  const [selectedProductTypeId, setSelectedProductTypeId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showSearchResult, setShowSearchResult] = useState(true);

  const [barcode, setBarcode] = useState("");
  const [barcodeQueue, setBarcodeQueue] = useState([]);
  const [autoFocusSerial, setAutoFocusSerial] = useState(false);
  const [defaultCost, setDefaultCost] = useState("");

  const [note, setNote] = useState("Manual stock intake");

  const [isCommitting, setIsCommitting] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const [productForm, setProductForm] = useState(buildProductFormFromProduct(null));
  const [priceForm, setPriceForm] = useState(buildPriceFormFromProduct(null));

  const productList = useMemo(() => {
    const payload = products?.data ?? products;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.products)) return payload.products;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  }, [products]);

  const executeProductSearch = useCallback(async ({
    productTypeId = selectedProductTypeId,
    brandId = selectedBrandId,
    search = keyword,
  } = {}) => {
    const params = {
      productTypeId: productTypeId || undefined,
      brandId: brandId || undefined,
      search: String(search || "").trim() || undefined,

      // Product Template Runtime:
      // บังคับค้นหาจาก Template Branch (T01)
      // Backend จะ Auto Clone เข้า Branch จริงตอน Commit
      template: true,

      takeNum: 1000,
      skipNum: 0,
    };

    try {
      if (typeof fetchProductsAction === "function") {
      if (import.meta.env?.DEV) {
      console.log('[QuickStock] Runtime Search params', params);
    }
    await fetchProductsAction(params);
      return;
    }

      if (typeof fetchProductsAction === "function") {
        await fetchProductsAction(params);
      }
    } catch (err) {
      console.error("QuickStock product search failed:", err);
      toast.error(err?.message || "ค้นหาสินค้าไม่สำเร็จ");
    }
  }, [fetchProducts, fetchProductsAction, selectedProductTypeId, selectedBrandId, keyword]);

  useEffect(() => {
    if (typeof fetchDropdownsAction === "function") {
      fetchDropdownsAction();
    }
  }, [fetchDropdownsAction]);

  const filteredBrands = useMemo(() => {
    const ptId = toNumberOrNull(selectedProductTypeId);
    if (!ptId) return brands;

    const productBrandIds = new Set(
      (productList || [])
        .filter((p) => Number(getProductTypeId(p)) === Number(ptId))
        .map((p) => Number(getProductBrandId(p)))
        .filter(Boolean)
    );

    if (productBrandIds.size === 0) return brands;
    return brands.filter((brand) => productBrandIds.has(Number(brand?.id)));
  }, [brands, productList, selectedProductTypeId]);

  const filteredProducts = useMemo(() => {
    const ptId = toNumberOrNull(selectedProductTypeId);
    const brandId = toNumberOrNull(selectedBrandId);
    const q = normalizeText(keyword);

    return (productList || [])
      .filter((product) => {
        if (ptId && Number(getProductTypeId(product)) !== Number(ptId)) return false;
        if (brandId && Number(getProductBrandId(product)) !== Number(brandId)) return false;

        if (!q) return true;

        const searchable = [
          product?.name,
          product?.title,
          product?.sku,
          product?.barcode,
          product?.model,
          product?.code,
          getBrandName(product),
          getProductTypeName(product),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(q);
      })
      .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
  }, [productList, selectedProductTypeId, selectedBrandId, keyword]);

  const selectedProduct = useMemo(() => {
    const id = toNumberOrNull(selectedProductId);
    if (!id) return null;
    return (productList || []).find((product) => Number(product?.id) === Number(id)) || null;
  }, [productList, selectedProductId]);

  // Runtime Product Separation:
  // selectedProduct here is the product selected from search.
  // If it comes from T01 / Template Catalog, it is selectedTemplateProduct only.
  // It must NOT be shown or edited as Operational Product of the branch.
  const selectedTemplateProduct = useMemo(
    () => (isTemplateCatalogProduct(selectedProduct) ? selectedProduct : null),
    [selectedProduct]
  );

  const operationalProduct = useMemo(
    () => (isOperationalBranchProduct(selectedProduct) ? selectedProduct : null),
    [selectedProduct]
  );

  const runtimeStatus = !selectedProduct
    ? "IDLE"
    : operationalProduct
      ? "READY"
      : "NOT_CREATED";

  useEffect(() => {
    if (!operationalProduct) {
      // Template Product is search/clone source only.
      // Do not hydrate Product Detail / BranchPrice editor from template.
      setProductForm(buildProductFormFromProduct(null));
      setPriceForm(buildPriceFormFromProduct(null));
      setDefaultCost("");
      setIsEditingProduct(false);

      if (selectedTemplateProduct) {
        setTimeout(() => barcodeInputRef.current?.focus(), 50);
      }

      return;
    }

    const nextProductForm = buildProductFormFromProduct(operationalProduct);
    const nextPriceForm = buildPriceFormFromProduct(operationalProduct);

    setProductForm(nextProductForm);
    setPriceForm(nextPriceForm);
    setDefaultCost(nextPriceForm.costPrice || "");
    setIsEditingProduct(false);
    setTimeout(() => barcodeInputRef.current?.focus(), 50);
  }, [operationalProduct, selectedTemplateProduct]);

  const resetQueue = () => {
    setBarcodeQueue([]);
    setBarcode("");
    serialInputRefs.current = {};
    setTimeout(() => barcodeInputRef.current?.focus(), 50);
  };

  const clearProductSelection = () => {
    setSelectedProductId("");
    setShowSearchResult(true);
    setIsEditingProduct(false);
    setProductForm(buildProductFormFromProduct(null));
    setPriceForm(buildPriceFormFromProduct(null));
    setDefaultCost("");
    resetQueue();
  };

  const updateProductForm = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const updatePriceForm = (field, value) => {
    setPriceForm((prev) => ({ ...prev, [field]: value }));
    if (field === "costPrice") setDefaultCost(value);
  };

  const selectProduct = (productId) => {
    setSelectedProductId(String(productId));
    setShowSearchResult(false);
    resetQueue();

    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 150);
  };


  const addBarcodeToQueue = (rawBarcode) => {
    const cleanBarcode = String(rawBarcode || "").trim();
    if (!cleanBarcode) return;

    if (!selectedProduct) {
      toast.error("กรุณาเลือกสินค้าก่อนสแกนบาร์โค้ด");
      return;
    }

    const exists = barcodeQueue.some(
      (item) => normalizeText(item.barcode) === normalizeText(cleanBarcode)
    );

    if (exists) {
      toast.warning(`บาร์โค้ดซ้ำในรายการ: ${cleanBarcode}`);
      setBarcode("");
      barcodeInputRef.current?.focus();
      return;
    }

    const rowId = `${cleanBarcode}-${Date.now()}`;

    setBarcodeQueue((prev) => [
      ...prev,
      {
        id: rowId,
        barcode: cleanBarcode,
        serialNumber: "",
        status: "Ready",
      },
    ]);

    setBarcode("");

    setTimeout(() => {
      if (autoFocusSerial && serialInputRefs.current?.[rowId]) {
        serialInputRefs.current[rowId].focus();
        serialInputRefs.current[rowId].select?.();
        return;
      }

      barcodeInputRef.current?.focus();
    }, 50);
  };

  const handleBarcodeSubmit = (event) => {
    event?.preventDefault();
    addBarcodeToQueue(barcode);
  };

  const removeQueueItem = (id) => {
    setBarcodeQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQueueItemField = (id, field, value) => {
    setBarcodeQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveProductInline = async () => {
    if (!operationalProduct?.id) return;

    const name = String(productForm.name || "").trim();
    if (!name) {
      toast.error("ชื่อสินค้าห้ามว่าง");
      return;
    }

    if (toMoneyNumber(priceForm.priceRetail) <= 0) {
      toast.error("ราคาขายปลีกต้องมากกว่า 0");
      return;
    }

    if (typeof updateProduct !== "function") {
      toast.error("ยังไม่พบ updateProduct ใน productStore");
      return;
    }

    setIsSavingProduct(true);

    try {
      await updateProduct(operationalProduct.id, {
        name,
        productTypeId: toNumberOrNull(productForm.productTypeId),
        brandId: toNumberOrNull(productForm.brandId),
        unitId: toNumberOrNull(productForm.unitId),
        mode: "STRUCTURED",
        noSN: false,
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

      const savedCostPrice = toMoneyNumber(priceForm.costPrice);
      const savedPriceRetail = toMoneyNumber(priceForm.priceRetail);
      const savedPriceWholesale = toMoneyNumber(priceForm.priceWholesale);
      const savedPriceTechnician = toMoneyNumber(priceForm.priceTechnician);
      const savedPriceOnline = toMoneyNumber(priceForm.priceOnline);

      const nextBranchPrice = {
        ...(getFirstBranchPrice(operationalProduct) || {}),
        costPrice: savedCostPrice,
        priceRetail: savedPriceRetail,
        priceWholesale: savedPriceWholesale,
        priceTechnician: savedPriceTechnician,
        priceOnline: savedPriceOnline,
        isActive: true,
      };

      const nextProduct = {
        ...operationalProduct,
        name,
        productTypeId: toNumberOrNull(productForm.productTypeId),
        brandId: toNumberOrNull(productForm.brandId),
        unitId: toNumberOrNull(productForm.unitId),
        trackSerialNumber: !!productForm.trackSerialNumber,
        active: !!productForm.active,
        costPrice: savedCostPrice,
        priceRetail: savedPriceRetail,
        priceWholesale: savedPriceWholesale,
        priceTechnician: savedPriceTechnician,
        priceOnline: savedPriceOnline,
        hasPrice: true,
        branchPriceActive: true,
        branchPrice: [nextBranchPrice],
      };

      // Update Zustand products list directly.
      // selectedProduct เป็น useMemo จาก products + selectedProductId จึงไม่มี setSelectedProduct
      useProductStore.setState((state) => ({
        products: Array.isArray(state.products)
          ? state.products.map((p) =>
              Number(p?.id) === Number(nextProduct.id) ? { ...p, ...nextProduct } : p
            )
          : state.products,
      }));

      setProductForm(buildProductFormFromProduct(nextProduct));
      setPriceForm(buildPriceFormFromProduct(nextProduct));
      setDefaultCost(String(savedCostPrice || ""));

      toast.success("บันทึกข้อมูลสินค้าเรียบร้อย");
      setIsEditingProduct(false);
      setTimeout(() => barcodeInputRef.current?.focus(), 50);
    } catch (err) {
      console.error("Quick edit product failed:", err);
      toast.error(err?.message || "บันทึกข้อมูลสินค้าไม่สำเร็จ");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteSelectedProductForRecovery = async () => {
    if (!operationalProduct?.id) return;

    const ok = window.confirm(
      `ยืนยันลบสินค้าในช่วง Recovery?\n\n${operationalProduct.name}\n\nควรใช้เฉพาะรายการซ้ำ/ผิด และยังไม่มีประวัติรับเข้าเท่านั้น`
    );
    if (!ok) return;

    if (typeof deleteProductAction !== "function") {
      toast.error("ยังไม่พบ deleteProductAction ใน productStore");
      return;
    }

    setIsDeletingProduct(true);

    try {
      const result = await deleteProductAction(operationalProduct.id);
      if (result === false) {
        toast.error("ลบสินค้าไม่สำเร็จ อาจมีประวัติใช้งานแล้ว");
        return;
      }

      toast.success("ลบสินค้าเรียบร้อย");
      setSelectedProductId("");
      resetQueue();
      await executeProductSearch();
    } catch (err) {
      console.error("Delete product failed:", err);
      toast.error(err?.message || "ลบสินค้าไม่สำเร็จ");
    } finally {
      setIsDeletingProduct(false);
      setTimeout(() => barcodeInputRef.current?.focus(), 50);
    }
  };

  const validateBeforeCommit = () => {
    if (!selectedProduct) {
      toast.error("กรุณาเลือกสินค้าก่อนบันทึก");
      return false;
    }

    if (toMoneyNumber(defaultCost || priceForm.costPrice) <= 0) {
      toast.error("ราคาทุนรับเข้าต้องมากกว่า 0 ก่อนรับเข้า");
      return false;
    }

    if (toMoneyNumber(priceForm.priceRetail) <= 0) {
      toast.error("ราคาขายปลีกต้องมากกว่า 0 ก่อนรับเข้า");
      return false;
    }

    if (barcodeQueue.length === 0) {
      toast.error("ยังไม่มีบาร์โค้ดใน Queue");
      return false;
    }

    for (const [index, item] of barcodeQueue.entries()) {
      const rowNo = index + 1;

      if (!String(item.barcode || "").trim()) {
        toast.error(`แถว ${rowNo}: Barcode ห้ามว่าง`);
        return false;
      }
    }

    return true;
  };

  const handleCommit = async () => {
    if (!validateBeforeCommit()) return;

    const sessionCost = toMoneyNumber(defaultCost || priceForm.costPrice);

    const cleanQueueItems = barcodeQueue.map((item) => ({
      barcode: String(item.barcode || "").trim(),
      serialNumber: String(item.serialNumber || "").trim() || null,
    }));

    const payload = {
      productId: Number(selectedProduct.id),
      productName: selectedProduct.name,
      mode: "STRUCTURED",
      trackSerialNumber: !!selectedProduct.trackSerialNumber,

      // Runtime Intake v2:
      // Frontend does not send movementType/source.
      // Backend owns RECEIVE/source metadata.
      note,
      quantity: cleanQueueItems.length,

      // Runtime Session Price is the single source of truth.
      costPrice: sessionCost,
      priceRetail: toMoneyNumber(priceForm.priceRetail),
      priceWholesale: toMoneyNumber(priceForm.priceWholesale),
      priceTechnician: toMoneyNumber(priceForm.priceTechnician),
      priceOnline: toMoneyNumber(priceForm.priceOnline),

      // Queue Item contains only per-item identity.
      items: cleanQueueItems,
      barcodes: cleanQueueItems,
    };

    setIsCommitting(true);

    try {
      if (typeof quickStockIntakeExistingAction === "function") {
        await quickStockIntakeExistingAction(payload);
        toast.success(`บันทึกรับเข้า ${barcodeQueue.length} รายการเรียบร้อย`);
        resetQueue();
        return;
      }

      if (typeof quickStockInAllInOneAction === "function") {
        toast.error("ยังไม่มี Backend action สำหรับรับเข้า Product เดิม กรุณาเพิ่ม quickStockIntakeExistingAction ก่อนใช้งานจริง");
        return;
      }

      toast.error("ยังไม่พบ action สำหรับบันทึก Stock Intake");
    } catch (err) {
      console.error("Quick Stock Commit Error:", err);
      toast.error(err?.message || "บันทึกรับเข้าไม่สำเร็จ");
    } finally {
      setIsCommitting(false);
    }
  };

  const readyCount = barcodeQueue.filter(
    (item) => String(item.barcode || "").trim()
  ).length;
  const needDataCount = barcodeQueue.length - readyCount;
  const queueReady = barcodeQueue.length > 0 && needDataCount === 0;
  const productReady =
    !!selectedProduct &&
    toMoneyNumber(defaultCost || priceForm.costPrice) > 0 &&
    toMoneyNumber(priceForm.priceRetail) > 0;

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 xl:p-6 space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <h1 className="text-2xl font-bold text-gray-900">📦 Stock Intake Runtime</h1>
        <p className="text-sm text-gray-500 mt-1">
          Universal Structured Intake — กู้คืนสต๊อก / รับด่วน / รับสินค้าใหม่แบบไม่ผ่าน PO
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {typeof error === "string" ? error : error?.message || "เกิดข้อผิดพลาด"}
        </div>
      )}

      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-4">
        <div className="2xl:col-span-4 space-y-4">
          <ProductFinderPanel
            selectedProduct={selectedProduct}
            showSearchResult={showSearchResult}
            onShowSearchResult={() => setShowSearchResult(true)}
            productTypes={productTypes}
            brands={filteredBrands}
            selectedProductTypeId={selectedProductTypeId}
            selectedBrandId={selectedBrandId}
            keyword={keyword}
            filteredProducts={filteredProducts}
            selectedProductId={selectedProductId}
            dropdownsLoading={dropdownsLoading}
            isLoading={isLoading}
            onProductTypeChange={(value) => {
              setSelectedProductTypeId(value);
              setSelectedBrandId("");
              setSelectedProductId("");
              setShowSearchResult(true);
              resetQueue();
              executeProductSearch({ productTypeId: value, brandId: "" });
            }}
            onBrandChange={(value) => {
              setSelectedBrandId(value);
              setSelectedProductId("");
              setShowSearchResult(true);
              resetQueue();
              executeProductSearch({ brandId: value });
            }}
            onKeywordChange={(value) => {
              setKeyword(value);
              setSelectedProductId("");
              setShowSearchResult(true);
              resetQueue();
            }}
            onSearch={() => {
              setShowSearchResult(true);
              executeProductSearch();
            }}
            onKeywordEnter={(value) => {
              setShowSearchResult(true);
              executeProductSearch({ search: value });
            }}
            onSelectProduct={selectProduct}
            getBrandName={getBrandName}
            getProductTypeName={getProductTypeName}
            getProductUnitName={getProductUnitName}
          />

          <ProductMasterPanel
            selectedProduct={operationalProduct}
            selectedTemplateProduct={selectedTemplateProduct}
            runtimeStatus={runtimeStatus}
            productTypes={productTypes}
            brands={brands}
            units={units}
            productForm={productForm}
            priceForm={priceForm}
            isEditingProduct={isEditingProduct}
            isSavingProduct={isSavingProduct}
            isDeletingProduct={isDeletingProduct}
            onEditStart={() => setIsEditingProduct(true)}
            onEditCancel={() => {
              setProductForm(buildProductFormFromProduct(operationalProduct));
              setPriceForm(buildPriceFormFromProduct(operationalProduct));
              setDefaultCost(buildPriceFormFromProduct(operationalProduct).costPrice || "");
              setIsEditingProduct(false);
            }}
            onSaveProduct={handleSaveProductInline}
            onClearProduct={clearProductSelection}
            onDeleteProduct={handleDeleteSelectedProductForRecovery}
            onProductFieldChange={updateProductForm}
            onPriceFieldChange={updatePriceForm}
          />
        </div>

        <div className="2xl:col-span-8 space-y-4">
          <IntakeControlPanel
            selectedProduct={selectedProduct}
            barcodeInputRef={barcodeInputRef}
            barcode={barcode}
            setBarcode={setBarcode}
            autoFocusSerial={autoFocusSerial}
            setAutoFocusSerial={setAutoFocusSerial}
            defaultCost={defaultCost}
            setDefaultCost={setDefaultCost}
            priceForm={priceForm}
            onPriceFieldChange={updatePriceForm}
            note={note}
            setNote={setNote}
            isCommitting={isCommitting}
            onBarcodeSubmit={handleBarcodeSubmit}
          />

          <QueueSummary
            total={barcodeQueue.length}
            readyCount={readyCount}
            needDataCount={needDataCount}
            productReady={productReady}
          />

          <IntakeQueueTable
            barcodeQueue={barcodeQueue}
            serialInputRefs={serialInputRefs}
            barcodeInputRef={barcodeInputRef}
            onUpdateQueueItemField={updateQueueItemField}
            onRemoveQueueItem={removeQueueItem}
          />

          <CommitBar
            selectedProduct={selectedProduct}
            barcodeQueue={barcodeQueue}
            productReady={productReady}
            queueReady={queueReady}
            isCommitting={isCommitting}
            onResetQueue={resetQueue}
            onCommit={handleCommit}
          />
        </div>
      </div>
    </div>
  );
};

export default QuickStockPage;
