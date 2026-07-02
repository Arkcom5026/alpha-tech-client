import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useProductStore from "@/features/product/store/productStore";
import {
  getOperationalProductByTemplateId,
  getTemplateProductsForPos,
} from "@/features/product/api/productApi";
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
  product?.brandId ??
  product?.brand_id ??
  (product?.brand && typeof product.brand === "object" ? product.brand.id : null) ??
  null;

const getProductTypeId = (product) =>
  product?.productTypeId ??
  product?.product_type_id ??
  (product?.productType && typeof product.productType === "object" ? product.productType.id : null) ??
  null;

const getProductUnitId = (product) =>
  product?.unitId ??
  product?.unit_id ??
  (product?.unit && typeof product.unit === "object" ? product.unit.id : null) ??
  null;

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

const extractProductList = (response) => {
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

const extractSingleProduct = (response) => {
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
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      return candidate;
    }
  }

  return null;
};

const normalizeTemplateProduct = (product) => {
  if (!product || typeof product !== "object") return product;

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
    productType:
      productTypeId || productTypeName !== "-"
        ? { id: productTypeId, name: productTypeName !== "-" ? productTypeName : null }
        : product.productType,

    brandId,
    brandName: brandName !== "-" ? brandName : product?.brandName,
    brand:
      brandId || brandName !== "-"
        ? { id: brandId, name: brandName !== "-" ? brandName : null }
        : product.brand,

    unitId,
    unitName: unitName !== "-" ? unitName : product?.unitName,
    unit:
      unitId || unitName !== "-"
        ? { id: unitId, name: unitName !== "-" ? unitName : null }
        : product.unit,

    isTemplateProduct: product.isTemplateProduct === true || product.templateProductId != null,
    templateProductId: product.templateProductId ?? product.id,
  };
};

const normalizeTemplateProductList = (response) =>
  extractProductList(response).map(normalizeTemplateProduct).filter(Boolean);

const normalizeOperationalProduct = (product) => {
  if (!product || typeof product !== "object") return null;
  return {
    ...product,
    isTemplateProduct: false,
  };
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

const isTemplateCatalogProduct = (product) => {
  if (!product) return false;

  if (product.isTemplateProduct === true) return true;
  if (String(product.templateBranchCode || "").toUpperCase() === "T01") return true;
  if (Number(product.templateBranchId) === 1) return true;

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

const getTemplateLookupId = (product) =>
  product?.templateProductId ?? product?.template_product_id ?? product?.id ?? null;

const addDefinedField = (target, key, value) => {
  if (value === undefined || value === null || value === "") return;
  target[key] = value;
};

const buildCreateOperationalProductPayload = (templateProduct) => {
  const templateProductId = toNumberOrNull(getTemplateLookupId(templateProduct));
  if (!templateProductId) return null;

  const payload = {
    templateProductId,
    sourceCatalog: "TEMPLATE",
  };

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

const isValidOperationalProductForAdoption = (product, templateProduct) => {
  const operationalProductId = toNumberOrNull(product?.id);
  const templateProductId = toNumberOrNull(getTemplateLookupId(templateProduct));

  if (!operationalProductId) return false;
  if (isTemplateCatalogProduct(product)) return false;
  if (templateProductId && Number(operationalProductId) === Number(templateProductId)) return false;

  return true;
};

const ONBOARDING_STATES = {
  NO_SELECTION: "NO_SELECTION",
  CHECKING_OPERATIONAL_PRODUCT: "CHECKING_OPERATIONAL_PRODUCT",
  TEMPLATE_SELECTED_NOT_CREATED: "TEMPLATE_SELECTED_NOT_CREATED",
  OPERATIONAL_READY: "OPERATIONAL_READY",
  INTAKE_READY: "INTAKE_READY",
  INTAKE_COMMITTING: "INTAKE_COMMITTING",
  ERROR_RECOVERABLE: "ERROR_RECOVERABLE",
};

const QuickStockPage = () => {
  const barcodeInputRef = useRef(null);
  const serialInputRefs = useRef({});

  const {
    dropdowns = {},
    dropdownsLoading,
    isLoading,
    fetchDropdownsAction,
    updateProduct,
    deleteProductAction,
    quickStockIntakeExistingAction,
    createOperationalProductFromTemplateAction,
  } = useProductStore();

  const productTypes = dropdowns?.productTypes || dropdowns?.types || [];
  const brands = dropdowns?.brands || [];
  const units = dropdowns?.units || [];

  const [selectedProductTypeId, setSelectedProductTypeId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [committedKeyword, setCommittedKeyword] = useState("");
  const [showSearchResult, setShowSearchResult] = useState(true);
  const [runtimeSearchProducts, setRuntimeSearchProducts] = useState([]);
  const [templateDropdownProducts, setTemplateDropdownProducts] = useState([]);
  const [adoptedOperationalProduct, setAdoptedOperationalProduct] = useState(null);
  const [isCheckingOperationalProduct, setIsCheckingOperationalProduct] = useState(false);
  const [isCreatingOperationalProduct, setIsCreatingOperationalProduct] = useState(false);

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
    return normalizeTemplateProductList(runtimeSearchProducts);
  }, [runtimeSearchProducts]);

  const templateDropdownList = useMemo(() => {
    return normalizeTemplateProductList(templateDropdownProducts);
  }, [templateDropdownProducts]);

  const templateProductTypes = useMemo(() => {
    const map = new Map();

    (Array.isArray(templateDropdownList) ? templateDropdownList : []).forEach((p) => {
      const id = getProductTypeId(p);
      const name = getProductTypeName(p);
      const n = toNumberOrNull(id);

      if (!n || !name || name === "-") return;
      if (!map.has(n)) {
        map.set(n, { id: n, name });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), "th")
    );
  }, [templateDropdownList]);

  const templateBrands = useMemo(() => {
    const map = new Map();
    const currentTypeId = toNumberOrNull(selectedProductTypeId);

    (Array.isArray(templateDropdownList) ? templateDropdownList : [])
      .filter((p) => {
        if (!currentTypeId) return true;
        return Number(getProductTypeId(p)) === Number(currentTypeId);
      })
      .forEach((p) => {
        const id = getProductBrandId(p);
        const name = getBrandName(p);
        const n = toNumberOrNull(id);

        if (!n || !name || name === "-") return;
        if (!map.has(n)) {
          map.set(n, { id: n, name });
        }
      });

    return Array.from(map.values()).sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), "th")
    );
  }, [templateDropdownList, selectedProductTypeId]);

  const executeProductSearch = useCallback(async ({
    productTypeId = selectedProductTypeId,
    brandId = selectedBrandId,
    search = committedKeyword,
  } = {}) => {
    const params = {
      productTypeId: productTypeId || undefined,
      brandId: brandId || undefined,
      search: String(search || "").trim() || undefined,
      takeNum: 1000,
      skipNum: 0,
    };

    try {
      const response = await getTemplateProductsForPos(params);
      const list = normalizeTemplateProductList(response);
      setRuntimeSearchProducts(list);
      return list;
    } catch (err) {
      console.error("QuickStock product search failed:", err);
      setRuntimeSearchProducts([]);
      toast.error(err?.message || "ค้นหาสินค้าไม่สำเร็จ");
      return [];
    }
  }, [selectedProductTypeId, selectedBrandId, committedKeyword]);

  const loadTemplateDropdownCatalog = useCallback(async () => {
    try {
      const response = await getTemplateProductsForPos({
        takeNum: 1000,
        skipNum: 0,
      });

      const list = normalizeTemplateProductList(response);
      setTemplateDropdownProducts(list);
      return list;
    } catch (err) {
      console.error("QuickStock template dropdown load failed:", err);
      setTemplateDropdownProducts([]);
      return [];
    }
  }, []);

  useEffect(() => {
    if (typeof fetchDropdownsAction === "function") {
      fetchDropdownsAction();
    }
  }, [fetchDropdownsAction]);

  useEffect(() => {
    loadTemplateDropdownCatalog();
  }, [loadTemplateDropdownCatalog]);

  const filteredProducts = useMemo(() => {
    const ptId = toNumberOrNull(selectedProductTypeId);
    const brandId = toNumberOrNull(selectedBrandId);
    const q = normalizeText(committedKeyword);

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
  }, [productList, selectedProductTypeId, selectedBrandId, committedKeyword]);

  const selectedProduct = useMemo(() => {
    const id = toNumberOrNull(selectedProductId);
    if (!id) return null;
    return (productList || []).find((product) => Number(product?.id) === Number(id)) || null;
  }, [productList, selectedProductId]);

  const selectedTemplateProduct = useMemo(
    () => (isTemplateCatalogProduct(selectedProduct) ? selectedProduct : null),
    [selectedProduct]
  );

  const selectedSearchOperationalProduct = useMemo(
    () => (isOperationalBranchProduct(selectedProduct) ? selectedProduct : null),
    [selectedProduct]
  );

  useEffect(() => {
    let cancelled = false;

    const lookupTemplateOperationalProduct = async () => {
      if (!selectedTemplateProduct) {
        setAdoptedOperationalProduct(null);
        setIsCheckingOperationalProduct(false);
        return;
      }

      const templateProductId = getTemplateLookupId(selectedTemplateProduct);
      if (!templateProductId) {
        setAdoptedOperationalProduct(null);
        setIsCheckingOperationalProduct(false);
        return;
      }

      setAdoptedOperationalProduct(null);
      setIsCheckingOperationalProduct(true);

      try {
        const response = await getOperationalProductByTemplateId(templateProductId);
        if (cancelled) return;

        const rawCandidate = extractSingleProduct(response);
        const operationalCandidate = normalizeOperationalProduct(rawCandidate);
        if (
          operationalCandidate?.id &&
          isValidOperationalProductForAdoption(rawCandidate, selectedTemplateProduct)
        ) {
          setAdoptedOperationalProduct(operationalCandidate);
          return;
        }

        setAdoptedOperationalProduct(null);
      } catch (err) {
        if (cancelled) return;
        console.warn("QuickStock operational lookup did not find a branch product:", err);
        setAdoptedOperationalProduct(null);
      } finally {
        if (!cancelled) {
          setIsCheckingOperationalProduct(false);
        }
      }
    };

    lookupTemplateOperationalProduct();

    return () => {
      cancelled = true;
    };
  }, [selectedTemplateProduct]);

  const operationalProduct = selectedSearchOperationalProduct || adoptedOperationalProduct;
  const isTemplateOnlySelection = !!selectedTemplateProduct && !operationalProduct;
  const isOperationalSelection = !!operationalProduct?.id;

  const runtimeStatus = !selectedProduct
    ? "IDLE"
    : operationalProduct
      ? "READY"
      : "NOT_CREATED";

  useEffect(() => {
    if (!operationalProduct) {
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
    setAdoptedOperationalProduct(null);
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
    setAdoptedOperationalProduct(null);
    setShowSearchResult(false);
    resetQueue();

    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 150);
  };

  const addBarcodeToQueue = (rawBarcode) => {
    const cleanBarcode = String(rawBarcode || "").trim();
    if (!cleanBarcode) return;

    if (!isOperationalSelection) {
      toast.error(
        isTemplateOnlySelection
          ? "สินค้านี้ยังเป็น Template กรุณาสร้าง Operational Product ของร้านก่อนรับเข้า"
          : "กรุณาเลือกสินค้า Operational Product ก่อนสแกนบาร์โค้ด"
      );
      setBarcode("");
      barcodeInputRef.current?.focus();
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

  const handleCreateOperationalProductFromTemplate = async () => {
    if (!selectedTemplateProduct || operationalProduct) return;

    if (typeof createOperationalProductFromTemplateAction !== "function") {
      toast.error("ยังไม่พบ action สำหรับสร้าง Operational Product จาก Template");
      return;
    }

    const payload = buildCreateOperationalProductPayload(selectedTemplateProduct);
    if (!payload?.templateProductId) {
      toast.error("ไม่พบ Template Product ID สำหรับสร้างสินค้าในร้าน");
      return;
    }

    setIsCreatingOperationalProduct(true);

    try {
      const response = await createOperationalProductFromTemplateAction(payload);
      const rawCreatedProduct = extractSingleProduct(response);

      if (!isValidOperationalProductForAdoption(rawCreatedProduct, selectedTemplateProduct)) {
        toast.error("สร้างสินค้าแล้ว แต่ข้อมูลที่ตอบกลับยังไม่ใช่ Operational Product ที่ถูกต้อง");
        return;
      }

      const nextOperationalProduct = normalizeOperationalProduct(rawCreatedProduct);
      setAdoptedOperationalProduct(nextOperationalProduct);
      setProductForm(buildProductFormFromProduct(nextOperationalProduct));
      setPriceForm(buildPriceFormFromProduct(nextOperationalProduct));
      setDefaultCost(buildPriceFormFromProduct(nextOperationalProduct).costPrice || "");
      toast.success("สร้าง Operational Product จาก Template เรียบร้อย");
      setTimeout(() => barcodeInputRef.current?.focus(), 50);
    } catch (err) {
      console.error("Create operational product from template failed:", err);
      toast.error(err?.message || "สร้าง Operational Product จาก Template ไม่สำเร็จ");
    } finally {
      setIsCreatingOperationalProduct(false);
    }
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

      setRuntimeSearchProducts((prev) =>
        Array.isArray(prev)
          ? prev.map((p) =>
              Number(p?.id) === Number(nextProduct.id) ? { ...p, ...nextProduct } : p
            )
          : prev
      );
      setAdoptedOperationalProduct((prev) =>
        prev && Number(prev?.id) === Number(nextProduct.id) ? { ...prev, ...nextProduct } : prev
      );

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
    if (!selectedProduct) {
      toast.error("กรุณาเลือกสินค้าก่อนบันทึก");
      return false;
    }

    if (!operationalProduct?.id) {
      toast.error(
        isTemplateOnlySelection
          ? "สินค้านี้ยังเป็น Template และยังไม่ใช่ Operational Product ของร้าน"
          : "กรุณาเลือกสินค้า Operational Product ก่อนบันทึก"
      );
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
      productId: Number(operationalProduct.id),
      productName: operationalProduct.name,
      mode: "STRUCTURED",
      trackSerialNumber: !!operationalProduct.trackSerialNumber,
      note,
      quantity: cleanQueueItems.length,
      costPrice: sessionCost,
      priceRetail: toMoneyNumber(priceForm.priceRetail),
      priceWholesale: toMoneyNumber(priceForm.priceWholesale),
      priceTechnician: toMoneyNumber(priceForm.priceTechnician),
      priceOnline: toMoneyNumber(priceForm.priceOnline),
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
  const hasRequiredIntakePrices =
    toMoneyNumber(defaultCost || priceForm.costPrice) > 0 &&
    toMoneyNumber(priceForm.priceRetail) > 0;
  const productReady = isOperationalSelection && hasRequiredIntakePrices;
  const canScanBarcode = isOperationalSelection && !isCommitting && !isCheckingOperationalProduct && !isCreatingOperationalProduct;
  const canCommitExistingIntake = productReady && queueReady && !isCommitting && !isCheckingOperationalProduct && !isCreatingOperationalProduct;

  const onboardingState = isCommitting
    ? ONBOARDING_STATES.INTAKE_COMMITTING
    : isCheckingOperationalProduct || isCreatingOperationalProduct
      ? ONBOARDING_STATES.CHECKING_OPERATIONAL_PRODUCT
      : !selectedProduct
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

  if (import.meta.env?.DEV) {
    console.log("[QuickStock] onboarding state", onboardingState);
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 xl:p-6 space-y-4">
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-4">
        <div className="2xl:col-span-4 space-y-4">
          <ProductFinderPanel
            selectedProduct={selectedProduct}
            showSearchResult={showSearchResult}
            onShowSearchResult={() => setShowSearchResult(true)}
            productTypes={templateProductTypes}
            brands={templateBrands}
            selectedProductTypeId={selectedProductTypeId}
            selectedBrandId={selectedBrandId}
            keyword={keyword}
            filteredProducts={filteredProducts}
            selectedProductId={selectedProductId}
            dropdownsLoading={dropdownsLoading}
            isLoading={isLoading || isCheckingOperationalProduct || isCreatingOperationalProduct}
            onProductTypeChange={(value) => {
              setSelectedProductTypeId(value);
              setSelectedBrandId("");
              setSelectedProductId("");
              setAdoptedOperationalProduct(null);
              setShowSearchResult(true);
              resetQueue();
              executeProductSearch({ productTypeId: value, brandId: "", search: committedKeyword });
            }}
            onBrandChange={(value) => {
              setSelectedBrandId(value);
              setSelectedProductId("");
              setAdoptedOperationalProduct(null);
              setShowSearchResult(true);
              resetQueue();
              executeProductSearch({ brandId: value, search: committedKeyword });
            }}
            onKeywordChange={(value) => {
              setKeyword(value);
              setSelectedProductId("");
              setAdoptedOperationalProduct(null);
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
                <p className="text-sm text-amber-800">
                  สร้าง Operational Product ของร้านก่อน จึงจะรับบาร์โค้ดหรือบันทึก Stock Intake ได้
                </p>
              </div>
              <button
                type="button"
                className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCreatingOperationalProduct || isCheckingOperationalProduct}
                onClick={handleCreateOperationalProductFromTemplate}
              >
                {isCreatingOperationalProduct ? "กำลังสร้างสินค้าในร้าน..." : "สร้าง Operational Product จาก Template"}
              </button>
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
            selectedProduct={commitRuntimeProduct}
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
