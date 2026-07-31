import React, { useEffect, useState } from "react";
import { getQuickReceiveDropdowns } from "@/features/quickReceive/api/quickReceiveApi";
import ProductSearchFilters from "./ProductSearchFilters";
import ProductSearchResults from "./ProductSearchResults";

const normalizeText = (value) => String(value ?? "").trim().toLowerCase();
const toNum = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
const normalizeName = (value) => String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();

const dedupeOptions = (items = []) => {
  const seen = new Set();
  const result = [];
  for (const item of Array.isArray(items) ? items : []) {
    const id = toNum(item?.id);
    const name = String(item?.name ?? "").trim();
    const key = normalizeName(name);
    if (!id || !name || !key || seen.has(key)) continue;
    seen.add(key);
    result.push({ ...item, id, name });
  }
  return result.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "th"));
};

const getProductBrandId = (product) =>
  product?.brandId ?? product?.brand_id ?? (product?.brand && typeof product.brand === "object" ? product.brand.id : null) ?? null;
const getProductTypeId = (product) =>
  product?.productTypeId ?? product?.product_type_id ?? (product?.productType && typeof product.productType === "object" ? product.productType.id : null) ?? null;
const getTemplateLookupId = (product) =>
  product?.templateProductId ?? product?.template_product_id ?? product?.templateId ?? product?.template_id ?? product?.sourceTemplateProductId ?? product?.source_template_product_id ?? null;

const isTemplateCandidate = (product) => {
  if (!product) return false;
  if (product.isOperationalProduct === true) return false;
  if (product.isTemplateProduct === true) return true;
  if (String(product.templateBranchCode || "").toUpperCase() === "T01") return true;
  if (Number(product.templateBranchId) === 1) return true;
  return product.templateProductId != null && product.id != null && Number(product.templateProductId) === Number(product.id);
};

const getLogicalKeys = (product) => {
  if (!product) return [];
  const keys = [];
  const templateId = toNum(getTemplateLookupId(product));
  const ownId = toNum(product?.id);
  const name = normalizeText(product?.name || product?.title);
  const productTypeId = toNum(getProductTypeId(product));
  const brandId = toNum(getProductBrandId(product));
  if (templateId) keys.push(`template:${templateId}`);
  if (isTemplateCandidate(product) && ownId) keys.push(`template:${ownId}`);
  if (name) keys.push(`name:${name}`);
  if (name && productTypeId && brandId) keys.push(`signature:${name}:${productTypeId}:${brandId}`);
  return Array.from(new Set(keys));
};

const hideTemplatesCoveredByOperationalProducts = (templateProducts = [], operationalProducts = []) => {
  const operationalKeys = new Set(operationalProducts.flatMap(getLogicalKeys));
  if (!operationalKeys.size) return templateProducts;
  return templateProducts.filter((product) => !getLogicalKeys(product).some((key) => operationalKeys.has(key)));
};

const ProductFinderPanel = ({
  selectedProduct,
  showSearchResult = true,
  onShowSearchResult,
  productTypes = [],
  brands = [],
  selectedProductTypeId,
  selectedBrandId,
  keyword,
  filteredProducts = [],
  selectedProductId,
  dropdownsLoading,
  isLoading,
  onProductTypeChange,
  onBrandChange,
  onKeywordChange,
  onSearch,
  onKeywordEnter,
  onSelectProduct,
  getBrandName,
  getProductTypeName,
  getProductUnitName,
}) => {
  const [workflowDropdowns, setWorkflowDropdowns] = useState({ productTypes: [], brands: [] });
  const [workflowLoading, setWorkflowLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setWorkflowLoading(true);
      try {
        const data = await getQuickReceiveDropdowns({ productTypeId: selectedProductTypeId });
        if (!cancelled) {
          setWorkflowDropdowns({
            productTypes: dedupeOptions(data?.productTypes || []),
            brands: dedupeOptions(data?.brands || []),
          });
        }
      } catch (error) {
        console.warn("Quick Receive dropdown load failed; using fallback props", error);
        if (!cancelled) setWorkflowDropdowns({ productTypes: [], brands: [] });
      } finally {
        if (!cancelled) setWorkflowLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedProductTypeId]);

  const productTypeOptions = workflowDropdowns.productTypes.length ? workflowDropdowns.productTypes : dedupeOptions(productTypes);
  const brandOptions = workflowDropdowns.brands.length ? workflowDropdowns.brands : dedupeOptions(brands);
  const operationalProducts = filteredProducts.filter((product) => !isTemplateCandidate(product));
  const templateProducts = filteredProducts.filter((product) => isTemplateCandidate(product));
  const visibleTemplateProducts = hideTemplatesCoveredByOperationalProducts(templateProducts, operationalProducts);
  const busy = dropdownsLoading || workflowLoading || isLoading;

  return (
    <section className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
      <div className="border-b pb-3">
        <h2 className="font-semibold text-gray-800">1. ค้นหาสินค้า</h2>
        <p className="text-xs text-gray-500">ค้นด้วย ProductType / Brand / Keyword แล้วเลือกรายการด้านล่าง</p>
      </div>

      <ProductSearchFilters
        productTypeOptions={productTypeOptions}
        brandOptions={brandOptions}
        selectedProductTypeId={selectedProductTypeId}
        selectedBrandId={selectedBrandId}
        keyword={keyword}
        busy={busy}
        isLoading={isLoading}
        onProductTypeChange={onProductTypeChange}
        onBrandChange={onBrandChange}
        onKeywordChange={onKeywordChange}
        onSearch={onSearch}
        onKeywordEnter={onKeywordEnter}
      />

      <ProductSearchResults
        showSearchResult={showSearchResult}
        selectedProduct={selectedProduct}
        onShowSearchResult={onShowSearchResult}
        operationalProducts={operationalProducts}
        templateProducts={visibleTemplateProducts}
        selectedProductId={selectedProductId}
        onSelectProduct={onSelectProduct}
        getBrandName={getBrandName}
        getProductTypeName={getProductTypeName}
        getProductUnitName={getProductUnitName}
        isTemplateCandidate={isTemplateCandidate}
      />
    </section>
  );
};

export default ProductFinderPanel;
