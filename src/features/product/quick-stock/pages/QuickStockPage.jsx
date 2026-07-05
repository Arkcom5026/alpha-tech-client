import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import useQuickReceiveStore from "@/features/quickReceive/store/quickReceiveStore";

import ProductFinderPanel from "../components/QuickStockFinderPanel";
import ProductMasterPanel from "../components/QuickStockReceiveTable";
import IntakeControlPanel from "../components/QuickStockToolbar";
import IntakeQueueTable from "../components/QuickStockSerialDialog";
import QueueSummary from "../components/QuickStockSummary";
import CommitBar from "../components/QuickStockCommitBar";

const ONBOARDING_STATES = {
  NO_SELECTION: "NO_SELECTION",
  CHECKING_OPERATIONAL_PRODUCT: "CHECKING_OPERATIONAL_PRODUCT",
  TEMPLATE_SELECTED_NOT_CREATED: "TEMPLATE_SELECTED_NOT_CREATED",
  OPERATIONAL_READY: "OPERATIONAL_READY",
  INTAKE_READY: "INTAKE_READY",
  INTAKE_COMMITTING: "INTAKE_COMMITTING",
  ERROR_RECOVERABLE: "ERROR_RECOVERABLE",
};

const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

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
  product?.brandId ?? product?.brand_id ?? (product?.brand && typeof product.brand === "object" ? product.brand.id : null) ?? null;

const getProductTypeId = (product) =>
  product?.productTypeId ?? product?.product_type_id ?? (product?.productType && typeof product.productType === "object" ? product.productType.id : null) ?? null;

const getProductUnitId = (product) =>
  product?.unitId ?? product?.unit_id ?? (product?.unit && typeof product.unit === "object" ? product.unit.id : null) ?? null;

const getProductUnitName = (product) =>
  (product?.unit && typeof product.unit === "object" ? product.unit.name : null) ??
  (typeof product?.unit === "string" ? product.unit : null) ??
  product?.unitName ??
  product?.unit_name ??
  "-";

const getProductTypeName = (product) =>
  (product?.productType && typeof product.productType === "object" ? product.productType.name : null) ??
  (typeof product?.productType === "string" ? product.productType : null) ??
  product?.productTypeName ??
  product?.product_type_name ??
  product?.typeName ??
  "-";

const getBrandName = (product) =>
  (product?.brand && typeof product.brand === "object" ? product.brand.name : null) ??
  (typeof product?.brand === "string" ? product.brand : null) ??
  product?.brandName ??
  product?.brand_name ??
  "-";

const extractList = (response) => {
  if (Array.isArray(response)) return response;
  const candidates = [
    response?.items,
    response?.products,
    response?.data,
    response?.data?.items,
    response?.data?.products,
    response?.data?.data,
    response?.result,
    response?.result?.items,
    response?.result?.products,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};

const extractSingle = (response) => {
  if (!response) return null;
  if (Array.isArray(response)) return response[0] || null;
  const candidates = [
    response?.product,
    response?.data?.product,
    response?.data?.item,
    response?.data,
    response?.result?.product,
    response?.result?.item,
    response?.result,
    response?.item,
  ];
  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) return candidate;
  }
  return null;
};

const isTemplateCatalogProduct = (product) => {
  if (!product) return false;
  if (product.isOperationalProduct === true) return false;
  if (product.isTemplateProduct === true) return true;
  if (String(product.templateBranchCode || "").toUpperCase() === "T01") return true;
  if (Number(product.templateBranchId) === 1) return true;
  if (product.templateProductId != null && product.id != null && Number(product.templateProductId) === Number(product.id)) return true;
  return false;
};

const isOperationalBranchProduct = (product) => !!product && !isTemplateCatalogProduct(product);
const getTemplateLookupId = (product) => product?.templateProductId ?? product?.template_product_id ?? product?.id ?? null;

const normalizeTemplateProduct = (product) => {
  if (!product || typeof product !== "object") return null;
  const productTypeId = getProductTypeId(product);
  const productTypeName = getProductTypeName(product);
  const brandId = getProductBrandId(product);
  const brandName = getBrandName(product);
  const unitId = getProductUnitId(product);
  const unitName = getProductUnitName(product);

  return {
    ...product,
    productTypeId,
    productTypeName: productTypeName !== "-" ? productTypeName : product?.productTypeName,
    productType: productTypeId || productTypeName !== "-" ? { id: productTypeId, name: productTypeName !== "-" ? productTypeName : null } : product.productType,
    brandId,
    brandName: brandName !== "-" ? brandName : product?.brandName,
    brand: brandId || brandName !== "-" ? { id: brandId, name: brandName !== "-" ? brandName : null } : product.brand,
    unitId,
    unitName: unitName !== "-" ? unitName : product?.unitName,
    unit: unitId || unitName !== "-" ? { id: unitId, name: unitName !== "-" ? unitName : null } : product.unit,
    isTemplateProduct: true,
    isOperationalProduct: false,
    templateProductId: product.templateProductId ?? product.id,
    __quickStockDiscoverySource: "TEMPLATE",
  };
};

const normalizeOperationalProduct = (product) => {
  if (!product || typeof product !== "object") return null;
  return {
    ...product,
    isTemplateProduct: false,
    isOperationalProduct: true,
    __quickStockDiscoverySource: "OPERATIONAL",
  };
};

const normalizeTemplateProductList = (response) => extractList(response).map(normalizeTemplateProduct).filter(Boolean);
const normalizeOperationalProductList = (response) => extractList(response).map(normalizeOperationalProduct).filter((p) => p?.id);

const dedupeDiscoveryProducts = (products = []) => {
  const seen = new Set();
  const result = [];
  products.forEach((product) => {
    if (!product?.id) return;
    const key = `${product.__quickStockDiscoverySource || (isTemplateCatalogProduct(product) ? "TEMPLATE" : "OPERATIONAL")}:${product.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(product);
  });
  return result;
};

const getDiscoveryTemplateId = (product) =>
  toNumberOrNull(product?.templateProductId ?? product?.template_product_id ?? product?.sourceTemplateProductId ?? product?.source_template_product_id);

const getDiscoveryIdentityKey = (product) => {
  if (!product) return "";
  const templateId = getDiscoveryTemplateId(product);
  if (templateId) return `template:${templateId}`;

  const name = normalizeText(product?.name || product?.title);
  if (!name) return "";

  const productTypeId = toNumberOrNull(getProductTypeId(product));
  const brandId = toNumberOrNull(getProductBrandId(product));

  return [
    "identity",
    name,
    productTypeId ? `type:${productTypeId}` : `type-name:${normalizeText(getProductTypeName(product))}`,
    brandId ? `brand:${brandId}` : `brand-name:${normalizeText(getBrandName(product))}`,
  ].join("|");
};

const hideTemplateResultsWhenOperationalExists = (products = []) => {
  const operationalKeys = new Set(products.filter(isOperationalBranchProduct).map(getDiscoveryIdentityKey).filter(Boolean));
  if (operationalKeys.size === 0) return products;
  return products.filter((product) => !isTemplateCatalogProduct(product) || !operationalKeys.has(getDiscoveryIdentityKey(product)));
};

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

const addDefinedField = (target, key, value) => {
  if (value === undefined || value === null || value === "") return;
  target[key] = value;
};

const buildCreateOperationalProductPayload = (templateProduct) => {
  const templateProductId = toNumberOrNull(getTemplateLookupId(templateProduct));
  if (!templateProductId) return null;
  const payload = { templateProductId, sourceCatalog: "TEMPLATE" };
  addDefinedField(payload, "name", templateProduct?.name || templateProduct?.title);
  addDefinedField(payload, "productTypeId", toNumberOrNull(getProductTypeId(templateProduct)));
  addDefinedField(payload, "brandId", toNumberOrNull(getProductBrandId(templateProduct)));
  addDefinedField(payload, "unitId", toNumberOrNull(getProductUnitId(templateProduct)));
  addDefinedField(payload, "mode", templateProduct?.mode || "STRUCTURED");
  addDefinedField(payload, "trackSerialNumber", !!templateProduct?.trackSerialNumber);
  addDefinedField(payload, "categoryId", toNumberOrNull(templateProduct?.categoryId));
  addDefinedField(payload, "codeType", templateProduct?.codeType);
  addDefinedField(payload, "warrantyDays", toNumberOrNull(templateProduct?.warrantyDays));
  addDefinedField(payload, "productConfig", templateProduct?.productConfig);
  addDefinedField(payload, "active", templateProduct?.active !== false);
  return payload;
};

const buildLocalOperationalProductPayload = ({ productForm, priceForm }) => {
  const payload = {
    name: String(productForm.name || "").trim(),
    productTypeId: toNumberOrNull(productForm.productTypeId),
    mode: productForm.trackSerialNumber ? "STRUCTURED" : "SIMPLE",
    noSN: !productForm.trackSerialNumber,
    trackSerialNumber: !!productForm.trackSerialNumber,
    active: productForm.active !== false,
    costPrice: toMoneyNumber(priceForm.costPrice),
    priceRetail: toMoneyNumber(priceForm.priceRetail),
    priceWholesale: toMoneyNumber(priceForm.priceWholesale),
    priceTechnician: toMoneyNumber(priceForm.priceTechnician),
    priceOnline: toMoneyNumber(priceForm.priceOnline),
  };
  addDefinedField(payload, "brandId", toNumberOrNull(productForm.brandId));
  addDefinedField(payload, "unitId", toNumberOrNull(productForm.unitId));
  return payload;
};

const isValidOperationalProductForAdoption = (product, sourceProduct = null) => {
  const operationalProductId = toNumberOrNull(product?.id);
  const templateProductId = sourceProduct ? toNumberOrNull(getTemplateLookupId(sourceProduct)) : null;
  if (!operationalProductId) return false;
  if (isTemplateCatalogProduct(product)) return false;
  if (templateProductId && Number(operationalProductId) === Number(templateProductId)) return false;
  return true;
};

const QuickStockPage = () => {
  const barcodeInputRef = useRef(null);
  const serialInputRefs = useRef({});

  const {
    dropdowns = {},
    dropdownsLoading,
    isLoading,
    loadDropdownsAction,
    searchProductsAction,
    getOperationalProductByTemplateIdAction,
    updateOperationalProductAction,
    deleteOperationalProductAction,
    quickStockIntakeExistingAction,
    createOperationalProductFromTemplateAction,
    createLocalOperationalProductAction,
  } = useQuickReceiveStore();

  const productTypes = dropdowns?.productTypes || [];
  const brands = dropdowns?.brands || [];
  const units = dropdowns?.units || [];

  const [selectedProductTypeId, setSelectedProductTypeId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [committedKeyword, setCommittedKeyword] = useState("");
  const [showSearchResult, setShowSearchResult] = useState(true);
  const [runtimeSearchProducts, setRuntimeSearchProducts] = useState([]);
  const [adoptedOperationalProduct, setAdoptedOperationalProduct] = useState(null);
  const [isCheckingOperationalProduct, setIsCheckingOperationalProduct] = useState(false);
  const [isCreatingOperationalProduct, setIsCreatingOperationalProduct] = useState(false);
  const [isLocalCreateOpen, setIsLocalCreateOpen] = useState(false);

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
  const [localProductForm, setLocalProductForm] = useState({ name: "", productTypeId: "", brandId: "", unitId: "", trackSerialNumber: false, active: true });
  const [localPriceForm, setLocalPriceForm] = useState({ costPrice: "", priceRetail: "", priceWholesale: "", priceTechnician: "", priceOnline: "" });

  const productList = useMemo(() => dedupeDiscoveryProducts(runtimeSearchProducts), [runtimeSearchProducts]);

  const executeProductSearch = useCallback(async ({ productTypeId = selectedProductTypeId, brandId = selectedBrandId, search = committedKeyword } = {}) => {
    const cleanSearch = String(search || "").trim() || undefined;
    const params = {
      productTypeId: productTypeId || undefined,
      brandId: brandId || undefined,
      search: cleanSearch,
      searchText: cleanSearch,
      takeNum: 1000,
      skipNum: 0,
    };

    try {
      const result = await searchProductsAction(params);
      const operationalList = normalizeOperationalProductList(result?.operationalProducts || []);
      const templateList = normalizeTemplateProductList(result?.templateProducts || []);
      const merged = dedupeDiscoveryProducts([...operationalList, ...templateList]);
      setRuntimeSearchProducts(merged);
      return merged;
    } catch (err) {
      console.error("QuickStock product search failed:", err);
      setRuntimeSearchProducts([]);
      toast.error(err?.message || "ค้นหาสินค้าไม่สำเร็จ");
      return [];
    }
  }, [selectedProductTypeId, selectedBrandId, committedKeyword, searchProductsAction]);

  useEffect(() => {
    if (typeof loadDropdownsAction === "function") loadDropdownsAction({ productTypeId: selectedProductTypeId });
  }, [loadDropdownsAction, selectedProductTypeId]);

  useEffect(() => { executeProductSearch({}); }, [executeProductSearch]);

  const filteredProducts = useMemo(() => {
    const ptId = toNumberOrNull(selectedProductTypeId);
    const brandId = toNumberOrNull(selectedBrandId);
    const q = normalizeText(committedKeyword);
    return hideTemplateResultsWhenOperationalExists(
      productList.filter((product) => {
        if (ptId && Number(getProductTypeId(product)) !== Number(ptId)) return false;
        if (brandId && Number(getProductBrandId(product)) !== Number(brandId)) return false;
        if (!q) return true;
        const searchable = [product?.name, product?.title, product?.sku, product?.barcode, product?.model, product?.code, getBrandName(product), getProductTypeName(product)].filter(Boolean).join(" ").toLowerCase();
        return searchable.includes(q);
      })
    ).sort((a, b) => {
      const sourceRankA = a.__quickStockDiscoverySource === "OPERATIONAL" ? 0 : 1;
      const sourceRankB = b.__quickStockDiscoverySource === "OPERATIONAL" ? 0 : 1;
      if (sourceRankA !== sourceRankB) return sourceRankA - sourceRankB;
      return String(a?.name || "").localeCompare(String(b?.name || ""));
    });
  }, [productList, selectedProductTypeId, selectedBrandId, committedKeyword]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return productList.find((product) => `${product.__quickStockDiscoverySource}:${product.id}` === selectedProductId || String(product.id) === String(selectedProductId)) || null;
  }, [productList, selectedProductId]);

  const selectedTemplateProduct = useMemo(() => (isTemplateCatalogProduct(selectedProduct) ? selectedProduct : null), [selectedProduct]);
  const selectedSearchOperationalProduct = useMemo(() => (isOperationalBranchProduct(selectedProduct) ? selectedProduct : null), [selectedProduct]);

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
    return () => { cancelled = true; };
  }, [selectedTemplateProduct, getOperationalProductByTemplateIdAction]);

  const operationalProduct = selectedSearchOperationalProduct || adoptedOperationalProduct;
  const isTemplateOnlySelection = !!selectedTemplateProduct && !operationalProduct;
  const isOperationalSelection = !!operationalProduct?.id;
  const runtimeStatus = operationalProduct ? "READY" : selectedProduct ? "NOT_CREATED" : "IDLE";

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
    setDefaultCost(nextPriceForm.costPrice || "");
    setIsEditingProduct(false);
    setTimeout(() => barcodeInputRef.current?.focus(), 50);
  }, [operationalProduct]);

  const resetQueue = () => {
    setBarcodeQueue([]);
    setBarcode("");
    serialInputRefs.current = {};
    setTimeout(() => barcodeInputRef.current?.focus(), 50);
  };

  const clearProductSelection = () => {
    setSelectedProductId("");
    setShowSearchResult(true);
    setAdoptedOperationalProduct(null);
    setIsEditingProduct(false);
    setIsLocalCreateOpen(false);
    setProductForm(buildProductFormFromProduct(null));
    setPriceForm(buildPriceFormFromProduct(null));
    setDefaultCost("");
    resetQueue();
  };

  const updateProductForm = (field, value) => setProductForm((prev) => ({ ...prev, [field]: value }));
  const updatePriceForm = (field, value) => {
    setPriceForm((prev) => ({ ...prev, [field]: value }));
    if (field === "costPrice") setDefaultCost(value);
  };
  const updateLocalProductForm = (field, value) => setLocalProductForm((prev) => ({ ...prev, [field]: value }));
  const updateLocalPriceForm = (field, value) => setLocalPriceForm((prev) => ({ ...prev, [field]: value }));

  const selectProduct = (productId) => {
    const nextSelected = productList.find((product) => `${product.__quickStockDiscoverySource}:${product.id}` === String(productId) || String(product.id) === String(productId));
    setSelectedProductId(nextSelected ? `${nextSelected.__quickStockDiscoverySource}:${nextSelected.id}` : String(productId));
    setAdoptedOperationalProduct(null);
    setIsLocalCreateOpen(false);
    setShowSearchResult(false);
    resetQueue();
    setTimeout(() => barcodeInputRef.current?.focus(), 150);
  };

  const adoptOperationalProduct = (rawProduct, sourceProduct = null) => {
    if (!isValidOperationalProductForAdoption(rawProduct, sourceProduct)) return false;
    const nextOperationalProduct = normalizeOperationalProduct(rawProduct);
    setAdoptedOperationalProduct(nextOperationalProduct);
    setRuntimeSearchProducts((prev) => dedupeDiscoveryProducts([nextOperationalProduct, ...(Array.isArray(prev) ? prev : [])]));
    setProductForm(buildProductFormFromProduct(nextOperationalProduct));
    const nextPriceForm = buildPriceFormFromProduct(nextOperationalProduct);
    setPriceForm(nextPriceForm);
    setDefaultCost(nextPriceForm.costPrice || "");
    setSelectedProductId(`OPERATIONAL:${nextOperationalProduct.id}`);
    setIsLocalCreateOpen(false);
    resetQueue();
    setTimeout(() => barcodeInputRef.current?.focus(), 50);
    return true;
  };

  const handleCreateOperationalProductFromTemplate = async () => {
    if (!selectedTemplateProduct || operationalProduct) return;
    const payload = buildCreateOperationalProductPayload(selectedTemplateProduct);
    if (!payload?.templateProductId) return toast.error("ไม่พบ Template Product ID สำหรับสร้างสินค้าในร้าน");
    setIsCreatingOperationalProduct(true);
    try {
      const response = await createOperationalProductFromTemplateAction(payload);
      const rawCreatedProduct = extractSingle(response);
      if (!adoptOperationalProduct(rawCreatedProduct, selectedTemplateProduct)) return toast.error("สร้างสินค้าแล้ว แต่ข้อมูลที่ตอบกลับยังไม่ใช่ Operational Product ที่ถูกต้อง");
      toast.success("สร้าง Operational Product จาก Template เรียบร้อย");
    } catch (err) {
      console.error("Create operational product from template failed:", err);
      toast.error(err?.message || "สร้าง Operational Product จาก Template ไม่สำเร็จ");
    } finally {
      setIsCreatingOperationalProduct(false);
    }
  };

  const handleCreateLocalOperationalProduct = async () => {
    const payload = buildLocalOperationalProductPayload({ productForm: localProductForm, priceForm: localPriceForm });
    if (!payload.name) return toast.error("กรุณาระบุชื่อสินค้า");
    if (!payload.productTypeId) return toast.error("กรุณาเลือกประเภทสินค้า");
    if (payload.costPrice <= 0 || payload.priceRetail <= 0) return toast.error("กรุณาระบุราคาทุนและราคาขายปลีกก่อนสร้างสินค้า");
    setIsCreatingOperationalProduct(true);
    try {
      const response = await createLocalOperationalProductAction(payload);
      const rawCreatedProduct = extractSingle(response);
      if (!adoptOperationalProduct(rawCreatedProduct, null)) return toast.error("สร้างสินค้าแล้ว แต่ข้อมูลที่ตอบกลับยังไม่ใช่ Operational Product ที่ถูกต้อง");
      setLocalProductForm({ name: "", productTypeId: "", brandId: "", unitId: "", trackSerialNumber: false, active: true });
      setLocalPriceForm({ costPrice: "", priceRetail: "", priceWholesale: "", priceTechnician: "", priceOnline: "" });
      toast.success("สร้างสินค้า Local ของร้านเรียบร้อย");
    } catch (err) {
      console.error("Create local operational product failed:", err);
      toast.error(err?.message || "สร้างสินค้า Local ไม่สำเร็จ");
    } finally {
      setIsCreatingOperationalProduct(false);
    }
  };

  const addBarcodeToQueue = (rawBarcode) => {
    const cleanBarcode = String(rawBarcode || "").trim();
    if (!cleanBarcode) return;
    if (!isOperationalSelection) {
      toast.error(isTemplateOnlySelection ? "สินค้านี้ยังเป็น Template กรุณาสร้าง Operational Product ของร้านก่อนรับเข้า" : "กรุณาเลือกสินค้า Operational Product ก่อนสแกนบาร์โค้ด");
      setBarcode("");
      barcodeInputRef.current?.focus();
      return;
    }
    if (barcodeQueue.some((item) => normalizeText(item.barcode) === normalizeText(cleanBarcode))) {
      toast.warning(`บาร์โค้ดซ้ำในรายการ: ${cleanBarcode}`);
      setBarcode("");
      barcodeInputRef.current?.focus();
      return;
    }
    const rowId = `${cleanBarcode}-${Date.now()}`;
    setBarcodeQueue((prev) => [...prev, { id: rowId, barcode: cleanBarcode, serialNumber: "", status: "Ready" }]);
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

  const removeQueueItem = (id) => setBarcodeQueue((prev) => prev.filter((item) => item.id !== id));
  const updateQueueItemField = (id, field, value) => setBarcodeQueue((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  const handleSaveProductInline = async () => {
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
        branchPrice: [{ ...(getFirstBranchPrice(operationalProduct) || {}), costPrice: toMoneyNumber(priceForm.costPrice), priceRetail: toMoneyNumber(priceForm.priceRetail), priceWholesale: toMoneyNumber(priceForm.priceWholesale), priceTechnician: toMoneyNumber(priceForm.priceTechnician), priceOnline: toMoneyNumber(priceForm.priceOnline), isActive: true }],
      };
      setAdoptedOperationalProduct((prev) => (prev && Number(prev?.id) === Number(nextProduct.id) ? { ...prev, ...nextProduct } : prev));
      setRuntimeSearchProducts((prev) => dedupeDiscoveryProducts([normalizeOperationalProduct(nextProduct), ...(Array.isArray(prev) ? prev : [])]));
      setProductForm(buildProductFormFromProduct(nextProduct));
      setPriceForm(buildPriceFormFromProduct(nextProduct));
      setDefaultCost(String(nextProduct.costPrice || ""));
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
    const ok = window.confirm(`ยืนยันลบสินค้าในช่วง Recovery?\n\n${operationalProduct.name}\n\nควรใช้เฉพาะรายการซ้ำ/ผิด และยังไม่มีประวัติรับเข้าเท่านั้น`);
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
      setTimeout(() => barcodeInputRef.current?.focus(), 50);
    }
  };

  const validateBeforeCommit = () => {
    if (!operationalProduct?.id) {
      toast.error(isTemplateOnlySelection ? "สินค้านี้ยังเป็น Template และยังไม่ใช่ Operational Product ของร้าน" : "กรุณาเลือกสินค้า Operational Product ก่อนบันทึก");
      return false;
    }
    if (toMoneyNumber(defaultCost || priceForm.costPrice) <= 0) return toast.error("ราคาทุนรับเข้าต้องมากกว่า 0 ก่อนรับเข้า"), false;
    if (toMoneyNumber(priceForm.priceRetail) <= 0) return toast.error("ราคาขายปลีกต้องมากกว่า 0 ก่อนรับเข้า"), false;
    if (barcodeQueue.length === 0) return toast.error("ยังไม่มีบาร์โค้ดใน Queue"), false;
    for (const [index, item] of barcodeQueue.entries()) {
      if (!String(item.barcode || "").trim()) return toast.error(`แถว ${index + 1}: Barcode ห้ามว่าง`), false;
    }
    return true;
  };

  const handleCommit = async () => {
    if (!validateBeforeCommit()) return;
    const cleanQueueItems = barcodeQueue.map((item) => ({ barcode: String(item.barcode || "").trim(), serialNumber: String(item.serialNumber || "").trim() || null }));
    const payload = {
      productId: Number(operationalProduct.id),
      productName: operationalProduct.name,
      mode: operationalProduct.mode || "STRUCTURED",
      trackSerialNumber: !!operationalProduct.trackSerialNumber,
      note,
      quantity: cleanQueueItems.length,
      costPrice: toMoneyNumber(defaultCost || priceForm.costPrice),
      priceRetail: toMoneyNumber(priceForm.priceRetail),
      priceWholesale: toMoneyNumber(priceForm.priceWholesale),
      priceTechnician: toMoneyNumber(priceForm.priceTechnician),
      priceOnline: toMoneyNumber(priceForm.priceOnline),
      items: cleanQueueItems,
      barcodes: cleanQueueItems,
    };
    setIsCommitting(true);
    try {
      await quickStockIntakeExistingAction(payload);
      toast.success(`บันทึกรับเข้า ${barcodeQueue.length} รายการเรียบร้อย`);
      resetQueue();
    } catch (err) {
      console.error("Quick Stock Commit Error:", err);
      toast.error(err?.message || "บันทึกรับเข้าไม่สำเร็จ");
    } finally {
      setIsCommitting(false);
    }
  };

  const readyCount = barcodeQueue.filter((item) => String(item.barcode || "").trim()).length;
  const needDataCount = barcodeQueue.length - readyCount;
  const queueReady = barcodeQueue.length > 0 && needDataCount === 0;
  const hasRequiredIntakePrices = toMoneyNumber(defaultCost || priceForm.costPrice) > 0 && toMoneyNumber(priceForm.priceRetail) > 0;
  const productReady = isOperationalSelection && hasRequiredIntakePrices;
  const isBusy = isCommitting || isCheckingOperationalProduct || isCreatingOperationalProduct;
  const canScanBarcode = isOperationalSelection && !isBusy;
  const canCommitExistingIntake = productReady && queueReady && !isBusy;
  const noSearchResults = showSearchResult && committedKeyword && filteredProducts.length === 0 && !isLoading;

  const onboardingState = isCommitting
    ? ONBOARDING_STATES.INTAKE_COMMITTING
    : isCheckingOperationalProduct || isCreatingOperationalProduct
      ? ONBOARDING_STATES.CHECKING_OPERATIONAL_PRODUCT
      : !operationalProduct && !selectedProduct
        ? ONBOARDING_STATES.NO_SELECTION
        : isTemplateOnlySelection
          ? ONBOARDING_STATES.TEMPLATE_SELECTED_NOT_CREATED
          : canCommitExistingIntake
            ? ONBOARDING_STATES.INTAKE_READY
            : isOperationalSelection
              ? ONBOARDING_STATES.OPERATIONAL_READY
              : ONBOARDING_STATES.ERROR_RECOVERABLE;

  const intakeRuntimeProduct = canScanBarcode ? operationalProduct : null;
  const commitRuntimeProduct = canCommitExistingIntake ? operationalProduct : null;

  if (import.meta.env?.DEV) console.log("[QuickStock] onboarding state", onboardingState);

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 xl:p-6 space-y-4">
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-4">
        <div className="2xl:col-span-4 space-y-4">
          <ProductFinderPanel
            selectedProduct={selectedProduct}
            showSearchResult={showSearchResult}
            onShowSearchResult={() => setShowSearchResult(true)}
            productTypes={productTypes}
            brands={brands}
            selectedProductTypeId={selectedProductTypeId}
            selectedBrandId={selectedBrandId}
            keyword={keyword}
            filteredProducts={filteredProducts}
            selectedProductId={selectedProductId}
            dropdownsLoading={dropdownsLoading}
            isLoading={isLoading || isBusy}
            onProductTypeChange={(value) => {
              setSelectedProductTypeId(value);
              setSelectedBrandId("");
              setSelectedProductId("");
              setAdoptedOperationalProduct(null);
              setIsLocalCreateOpen(false);
              setShowSearchResult(true);
              resetQueue();
              executeProductSearch({ productTypeId: value, brandId: "", search: committedKeyword });
            }}
            onBrandChange={(value) => {
              setSelectedBrandId(value);
              setSelectedProductId("");
              setAdoptedOperationalProduct(null);
              setIsLocalCreateOpen(false);
              setShowSearchResult(true);
              resetQueue();
              executeProductSearch({ brandId: value, search: committedKeyword });
            }}
            onKeywordChange={(value) => {
              setKeyword(value);
              setSelectedProductId("");
              setAdoptedOperationalProduct(null);
              setIsLocalCreateOpen(false);
              setShowSearchResult(true);
              resetQueue();
            }}
            onSearch={() => {
              const nextKeyword = String(keyword || "").trim();
              setCommittedKeyword(nextKeyword);
              setShowSearchResult(true);
              executeProductSearch({ search: nextKeyword });
            }}
            onKeywordEnter={(value) => {
              const nextKeyword = String(value || "").trim();
              setCommittedKeyword(nextKeyword);
              setShowSearchResult(true);
              executeProductSearch({ search: nextKeyword });
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

          {isTemplateOnlySelection && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <div>
                <p className="font-semibold text-amber-900">สินค้านี้ยังเป็น Template</p>
                <p className="text-sm text-amber-800">สร้าง Operational Product ของร้านก่อน จึงจะรับบาร์โค้ดหรือบันทึก Stock Intake ได้</p>
              </div>
              <button type="button" className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={isBusy} onClick={handleCreateOperationalProductFromTemplate}>
                {isCreatingOperationalProduct ? "กำลังสร้างสินค้าในร้าน..." : "สร้าง Operational Product จาก Template"}
              </button>
            </div>
          )}

          {(noSearchResults || isLocalCreateOpen) && !operationalProduct && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">สร้างสินค้า Local ของร้าน</p>
                  <p className="text-sm text-slate-600">ใช้เมื่อไม่มี Template หรือสินค้าในร้านที่เหมาะสม ระบบจะสร้าง Operational Product ก่อนรับเข้า</p>
                </div>
                {!isLocalCreateOpen && (
                  <button type="button" className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => {
                    setIsLocalCreateOpen(true);
                    setLocalProductForm((prev) => ({ ...prev, name: keyword || committedKeyword || prev.name, productTypeId: selectedProductTypeId || prev.productTypeId, brandId: selectedBrandId || prev.brandId }));
                  }}>
                    เปิดฟอร์ม
                  </button>
                )}
              </div>

              {isLocalCreateOpen && (
                <div className="space-y-3">
                  <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="ชื่อสินค้า" value={localProductForm.name} onChange={(e) => updateLocalProductForm("name", e.target.value)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <select className="rounded-lg border px-3 py-2 text-sm" value={localProductForm.productTypeId} onChange={(e) => updateLocalProductForm("productTypeId", e.target.value)}>
                      <option value="">เลือกประเภทสินค้า</option>
                      {productTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                    </select>
                    <select className="rounded-lg border px-3 py-2 text-sm" value={localProductForm.brandId} onChange={(e) => updateLocalProductForm("brandId", e.target.value)}>
                      <option value="">เลือกแบรนด์</option>
                      {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                    </select>
                    <select className="rounded-lg border px-3 py-2 text-sm" value={localProductForm.unitId} onChange={(e) => updateLocalProductForm("unitId", e.target.value)}>
                      <option value="">เลือกหน่วย</option>
                      {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                    </select>
                    <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                      <input type="checkbox" checked={localProductForm.trackSerialNumber} onChange={(e) => updateLocalProductForm("trackSerialNumber", e.target.checked)} />
                      ติดตาม Serial Number
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input className="rounded-lg border px-3 py-2 text-sm" placeholder="ราคาทุน" value={localPriceForm.costPrice} onChange={(e) => updateLocalPriceForm("costPrice", e.target.value)} />
                    <input className="rounded-lg border px-3 py-2 text-sm" placeholder="ราคาขายปลีก" value={localPriceForm.priceRetail} onChange={(e) => updateLocalPriceForm("priceRetail", e.target.value)} />
                    <input className="rounded-lg border px-3 py-2 text-sm" placeholder="ราคาส่ง" value={localPriceForm.priceWholesale} onChange={(e) => updateLocalPriceForm("priceWholesale", e.target.value)} />
                    <input className="rounded-lg border px-3 py-2 text-sm" placeholder="ราคาช่าง" value={localPriceForm.priceTechnician} onChange={(e) => updateLocalPriceForm("priceTechnician", e.target.value)} />
                  </div>
                  <button type="button" className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={isBusy} onClick={handleCreateLocalOperationalProduct}>
                    {isCreatingOperationalProduct ? "กำลังสร้างสินค้า Local..." : "สร้างสินค้า Local และ Adopt เข้า QuickStock"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="2xl:col-span-8 space-y-4">
          <IntakeControlPanel
            selectedProduct={intakeRuntimeProduct}
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

          <QueueSummary total={barcodeQueue.length} readyCount={readyCount} needDataCount={needDataCount} productReady={productReady} />
          <IntakeQueueTable barcodeQueue={barcodeQueue} serialInputRefs={serialInputRefs} barcodeInputRef={barcodeInputRef} onUpdateQueueItemField={updateQueueItemField} onRemoveQueueItem={removeQueueItem} />
          <CommitBar selectedProduct={commitRuntimeProduct} barcodeQueue={barcodeQueue} productReady={productReady} queueReady={queueReady} isCommitting={isCommitting} onResetQueue={resetQueue} onCommit={handleCommit} />
        </div>
      </div>
    </div>
  );
};

export default QuickStockPage;
