import React, { useEffect, useMemo, useState } from "react";
import apiClient from "@/utils/apiClient";

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

const getDiscoveryKey = (product) => {
  const source = product?.__quickStockDiscoverySource || (isTemplateCandidate(product) ? "TEMPLATE" : "OPERATIONAL");
  return `${source}:${product?.id}`;
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

const ProductResultRow = ({ product, selectedProductId, onSelectProduct, getBrandName, getProductTypeName, getProductUnitName }) => {
  const discoveryKey = getDiscoveryKey(product);
  const isSelected = String(selectedProductId) === discoveryKey || String(selectedProductId) === String(product?.id);
  const template = isTemplateCandidate(product);
  return (
    <button type="button" className={`w-full text-left px-3 py-3 hover:bg-blue-50 ${isSelected ? "bg-blue-50" : "bg-white"}`} onClick={() => onSelectProduct(discoveryKey)}>
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-sm text-gray-900 min-w-0">{product.name}</div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${template ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {template ? "Template · ต้องสร้างในร้านก่อน" : "Operational · พร้อมรับเข้า"}
        </span>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500">
        <div>ยี่ห้อ: {getBrandName(product)}</div>
        <div>ประเภท: {getProductTypeName(product)}</div>
        <div>หน่วย: {getProductUnitName(product)}</div>
        <div>โหมด: {product?.mode || "STRUCTURED"}</div>
      </div>
    </button>
  );
};

const ProductResultGroup = ({ title, description, products = [], selectedProductId, onSelectProduct, getBrandName, getProductTypeName, getProductUnitName }) => {
  if (!products.length) return null;
  return (
    <div className="border-b last:border-b-0">
      <div className="px-3 py-2 bg-slate-50 border-b">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-700">{title}</div>
          <div className="text-[11px] text-slate-500">{products.length} รายการ</div>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">{description}</div>
      </div>
      <div className="divide-y">
        {products.map((product) => <ProductResultRow key={getDiscoveryKey(product)} product={product} selectedProductId={selectedProductId} onSelectProduct={onSelectProduct} getBrandName={getBrandName} getProductTypeName={getProductTypeName} getProductUnitName={getProductUnitName} />)}
      </div>
    </div>
  );
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
        const params = { _ts: Date.now() };
        if (selectedProductTypeId) params.productTypeId = selectedProductTypeId;
        const { data } = await apiClient.get("quick-stock/dropdowns", { params });
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
  const visibleProductCount = operationalProducts.length + visibleTemplateProducts.length;
  const busy = dropdownsLoading || workflowLoading || isLoading;

  return (
    <section className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
      <div className="border-b pb-3">
        <h2 className="font-semibold text-gray-800">1. ค้นหาสินค้า</h2>
        <p className="text-xs text-gray-500">ค้นด้วย ProductType / Brand / Keyword แล้วเลือกรายการด้านล่าง</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทสินค้า</label>
          <select className="w-full border rounded-lg p-2 bg-white" value={selectedProductTypeId} disabled={busy} onChange={(event) => onProductTypeChange(event.target.value)}>
            <option value="">ทั้งหมด</option>
            {productTypeOptions.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ</label>
          <select className="w-full border rounded-lg p-2 bg-white" value={selectedBrandId} disabled={busy} onChange={(event) => onBrandChange(event.target.value)}>
            <option value="">ทั้งหมด</option>
            {brandOptions.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
        </div>
      </div>

      <div className="pt-2 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหาด้วยชื่อ / รุ่น / Keyword</label>
        <div className="flex gap-2">
          <input className="w-full border rounded-lg p-2 bg-white" placeholder="เช่น BH-7, 790 black, canon, m185" value={keyword} onChange={(event) => onKeywordChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); onKeywordEnter(event.currentTarget.value); } }} />
          <button type="button" className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm whitespace-nowrap disabled:opacity-50" disabled={isLoading} onClick={onSearch}>ค้นหา</button>
        </div>
      </div>

      {!showSearchResult && selectedProduct && (
        <div className="border rounded-xl bg-blue-50 border-blue-200 p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-blue-700">เลือกสินค้าแล้ว</div>
            <div className="font-semibold text-sm text-gray-900 truncate">{selectedProduct.name}</div>
            <div className="text-xs text-gray-500 mt-1">ยี่ห้อ: {getBrandName(selectedProduct)} · ประเภท: {getProductTypeName(selectedProduct)}</div>
          </div>
          <button type="button" className="shrink-0 px-3 py-2 rounded-lg border bg-white text-xs hover:bg-blue-50" onClick={onShowSearchResult}>แสดงผลค้นหา</button>
        </div>
      )}

      {showSearchResult && (
        <div className="border rounded-xl overflow-hidden bg-white">
          <div className="px-3 py-2 bg-gray-50 border-b flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">ผลการค้นหา</div>
            <div className="text-xs text-gray-500">{visibleProductCount} รายการ · ในร้าน {operationalProducts.length} · Template {visibleTemplateProducts.length}</div>
          </div>
          {visibleProductCount === 0 ? (
            <div className="p-5 text-center text-sm text-gray-400">ยังไม่มีผลการค้นหา</div>
          ) : (
            <div className="max-h-80 overflow-auto">
              <ProductResultGroup title="สินค้าในร้าน / Operational Product" description="เลือกแล้วรับเข้าได้ทันที ใช้ productId ของสาขา" products={operationalProducts} selectedProductId={selectedProductId} onSelectProduct={onSelectProduct} getBrandName={getBrandName} getProductTypeName={getProductTypeName} getProductUnitName={getProductUnitName} />
              <ProductResultGroup title="Template Catalog" description="ยังเป็นต้นแบบ ต้องสร้างหรือ adopt เป็นสินค้าในร้านก่อนรับเข้า" products={visibleTemplateProducts} selectedProductId={selectedProductId} onSelectProduct={onSelectProduct} getBrandName={getBrandName} getProductTypeName={getProductTypeName} getProductUnitName={getProductUnitName} />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProductFinderPanel;
