// src/features/product/quick-stock/utils/quickStockRuntimeUtils.js

export const ONBOARDING_STATES = {
  NO_SELECTION: "NO_SELECTION",
  CHECKING_OPERATIONAL_PRODUCT: "CHECKING_OPERATIONAL_PRODUCT",
  TEMPLATE_SELECTED_NOT_CREATED: "TEMPLATE_SELECTED_NOT_CREATED",
  OPERATIONAL_READY: "OPERATIONAL_READY",
  INTAKE_READY: "INTAKE_READY",
  INTAKE_COMMITTING: "INTAKE_COMMITTING",
  ERROR_RECOVERABLE: "ERROR_RECOVERABLE",
};

export const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

export const toNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const toMoneyString = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : "";
};

export const toMoneyNumber = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const getProductBrandId = (product) =>
  product?.brandId ??
  product?.brand_id ??
  (product?.brand && typeof product.brand === "object" ? product.brand.id : null) ??
  null;

export const getProductTypeId = (product) =>
  product?.productTypeId ??
  product?.product_type_id ??
  (product?.productType && typeof product.productType === "object" ? product.productType.id : null) ??
  null;

export const getProductUnitId = (product) =>
  product?.unitId ??
  product?.unit_id ??
  (product?.unit && typeof product.unit === "object" ? product.unit.id : null) ??
  null;

export const getProductUnitName = (product) =>
  (product?.unit && typeof product.unit === "object" ? product.unit.name : null) ??
  (typeof product?.unit === "string" ? product.unit : null) ??
  product?.unitName ??
  product?.unit_name ??
  "-";

export const getProductTypeName = (product) =>
  (product?.productType && typeof product.productType === "object" ? product.productType.name : null) ??
  (typeof product?.productType === "string" ? product.productType : null) ??
  product?.productTypeName ??
  product?.product_type_name ??
  product?.typeName ??
  "-";

export const getBrandName = (product) =>
  (product?.brand && typeof product.brand === "object" ? product.brand.name : null) ??
  (typeof product?.brand === "string" ? product.brand : null) ??
  product?.brandName ??
  product?.brand_name ??
  "-";

export const extractList = (response) => {
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

export const extractSingle = (response) => {
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

export const isTemplateCatalogProduct = (product) => {
  if (!product) return false;
  if (product.isOperationalProduct === true) return false;
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

export const isOperationalBranchProduct = (product) => !!product && !isTemplateCatalogProduct(product);

export const getTemplateLookupId = (product) =>
  product?.templateProductId ?? product?.template_product_id ?? product?.id ?? null;

export const normalizeTemplateProduct = (product) => {
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
    isTemplateProduct: true,
    isOperationalProduct: false,
    templateProductId: product.templateProductId ?? product.id,
    __quickStockDiscoverySource: "TEMPLATE",
  };
};

export const normalizeOperationalProduct = (product) => {
  if (!product || typeof product !== "object") return null;
  return {
    ...product,
    isTemplateProduct: false,
    isOperationalProduct: true,
    __quickStockDiscoverySource: "OPERATIONAL",
  };
};

export const normalizeTemplateProductList = (response) =>
  extractList(response).map(normalizeTemplateProduct).filter(Boolean);

export const normalizeOperationalProductList = (response) =>
  extractList(response).map(normalizeOperationalProduct).filter((p) => p?.id);

export const dedupeDiscoveryProducts = (products = []) => {
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

export const getDiscoveryTemplateId = (product) =>
  toNumberOrNull(
    product?.templateProductId ??
    product?.template_product_id ??
    product?.sourceTemplateProductId ??
    product?.source_template_product_id
  );

export const getDiscoveryIdentityKey = (product) => {
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

export const hideTemplateResultsWhenOperationalExists = (products = []) => {
  const operationalKeys = new Set(
    products.filter(isOperationalBranchProduct).map(getDiscoveryIdentityKey).filter(Boolean)
  );

  if (operationalKeys.size === 0) return products;

  return products.filter(
    (product) => !isTemplateCatalogProduct(product) || !operationalKeys.has(getDiscoveryIdentityKey(product))
  );
};

export const buildProductFormFromProduct = (product) => ({
  name: product?.name || "",
  productTypeId: String(getProductTypeId(product) || ""),
  brandId: String(getProductBrandId(product) || ""),
  unitId: String(getProductUnitId(product) || ""),
  trackSerialNumber: !!product?.trackSerialNumber,
  active: product?.active !== false,
});

export const getFirstBranchPrice = (product) => {
  if (!product) return null;
  if (Array.isArray(product.branchPrice)) return product.branchPrice[0] || null;
  if (product.branchPrice && typeof product.branchPrice === "object") return product.branchPrice;
  return null;
};

export const buildPriceFormFromProduct = (product) => {
  const bp = getFirstBranchPrice(product);
  return {
    costPrice: toMoneyString(product?.costPrice ?? bp?.costPrice),
    priceRetail: toMoneyString(product?.priceRetail ?? bp?.priceRetail),
    priceWholesale: toMoneyString(product?.priceWholesale ?? bp?.priceWholesale),
    priceTechnician: toMoneyString(product?.priceTechnician ?? bp?.priceTechnician),
    priceOnline: toMoneyString(product?.priceOnline ?? bp?.priceOnline),
  };
};

export const addDefinedField = (target, key, value) => {
  if (value === undefined || value === null || value === "") return;
  target[key] = value;
};

export const buildCreateOperationalProductPayload = (templateProduct) => {
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

export const buildLocalOperationalProductPayload = ({ productForm, priceForm }) => {
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

export const isValidOperationalProductForAdoption = (product, sourceProduct = null) => {
  const operationalProductId = toNumberOrNull(product?.id);
  const templateProductId = sourceProduct ? toNumberOrNull(getTemplateLookupId(sourceProduct)) : null;

  if (!operationalProductId) return false;
  if (isTemplateCatalogProduct(product)) return false;
  if (templateProductId && Number(operationalProductId) === Number(templateProductId)) return false;

  return true;
};
