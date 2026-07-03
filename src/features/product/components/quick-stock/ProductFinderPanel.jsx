import React from "react";

const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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

const getTemplateLookupId = (product) =>
  product?.templateProductId ??
  product?.template_product_id ??
  product?.templateId ??
  product?.template_id ??
  product?.sourceTemplateProductId ??
  product?.source_template_product_id ??
  null;

const isTemplateCandidate = (product) => {
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

const getDiscoveryKey = (product) => {
  const source = product?.__quickStockDiscoverySource || (isTemplateCandidate(product) ? "TEMPLATE" : "OPERATIONAL");
  return `${source}:${product?.id}`;
};

const getLogicalMatchKeys = (product) => {
  if (!product) return [];
  const keys = [];
  const templateLookupId = toFiniteNumber(getTemplateLookupId(product));

  if (templateLookupId) {
    keys.push(`template:${templateLookupId}`);
  }

  if (isTemplateCandidate(product)) {
    const ownId = toFiniteNumber(product?.id);
    if (ownId) keys.push(`template:${ownId}`);
  }

  const name = normalizeText(product?.name || product?.title);
  const productTypeId = toFiniteNumber(getProductTypeId(product));
  const brandId = toFiniteNumber(getProductBrandId(product));

  if (name && productTypeId && brandId) {
    keys.push(`signature:${name}:${productTypeId}:${brandId}`);
  }

  return Array.from(new Set(keys));
};

const hideTemplatesCoveredByOperationalProducts = (templateProducts = [], operationalProducts = []) => {
  const operationalMatchKeys = new Set(
    operationalProducts.flatMap((product) => getLogicalMatchKeys(product))
  );

  if (operationalMatchKeys.size === 0) return templateProducts;

  return templateProducts.filter((templateProduct) => {
    const templateKeys = getLogicalMatchKeys(templateProduct);
    return !templateKeys.some((key) => operationalMatchKeys.has(key));
  });
};

const ProductResultRow = ({
  product,
  selectedProductId,
  onSelectProduct,
  getBrandName,
  getProductTypeName,
  getProductUnitName,
}) => {
  const discoveryKey = getDiscoveryKey(product);
  const isSelected = String(selectedProductId) === discoveryKey || String(selectedProductId) === String(product?.id);
  const showTemplateBadge = isTemplateCandidate(product);

  return (
    <button
      key={discoveryKey}
      type="button"
      className={`w-full text-left px-3 py-3 hover:bg-blue-50 ${isSelected ? "bg-blue-50" : "bg-white"}`}
      onClick={() => onSelectProduct(discoveryKey)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-sm text-gray-900 min-w-0">{product.name}</div>
        {showTemplateBadge ? (
          <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            Template · ต้องสร้างในร้านก่อน
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            Operational · พร้อมรับเข้า
          </span>
        )}
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

const ProductResultGroup = ({
  title,
  description,
  products = [],
  selectedProductId,
  onSelectProduct,
  getBrandName,
  getProductTypeName,
  getProductUnitName,
}) => {
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
        {products.map((product) => (
          <ProductResultRow
            key={getDiscoveryKey(product)}
            product={product}
            selectedProductId={selectedProductId}
            onSelectProduct={onSelectProduct}
            getBrandName={getBrandName}
            getProductTypeName={getProductTypeName}
            getProductUnitName={getProductUnitName}
          />
        ))}
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
  const operationalProducts = filteredProducts.filter((product) => !isTemplateCandidate(product));
  const templateProducts = filteredProducts.filter((product) => isTemplateCandidate(product));
  const visibleTemplateProducts = hideTemplatesCoveredByOperationalProducts(templateProducts, operationalProducts);
  const visibleProductCount = operationalProducts.length + visibleTemplateProducts.length;
  const hiddenTemplateCount = templateProducts.length - visibleTemplateProducts.length;

  return (
    <section className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
      <div className="border-b pb-3">
        <h2 className="font-semibold text-gray-800">1. ค้นหาสินค้า</h2>
        <p className="text-xs text-gray-500">ค้นด้วย ProductType / Brand / Keyword แล้วเลือกรายการด้านล่าง</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทสินค้า</label>
          <select
            className="w-full border rounded-lg p-2 bg-white"
            value={selectedProductTypeId}
            disabled={dropdownsLoading || isLoading}
            onChange={(event) => onProductTypeChange(event.target.value)}
          >
            <option value="">ทั้งหมด</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ</label>
          <select
            className="w-full border rounded-lg p-2 bg-white"
            value={selectedBrandId}
            disabled={dropdownsLoading || isLoading}
            onChange={(event) => onBrandChange(event.target.value)}
          >
            <option value="">ทั้งหมด</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-2 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหาด้วยชื่อ / รุ่น / Keyword</label>
        <div className="flex gap-2">
          <input
            className="w-full border rounded-lg p-2 bg-white"
            placeholder="เช่น BH-7, 790 black, canon, m185"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onKeywordEnter(event.currentTarget.value);
              }
            }}
          />
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm whitespace-nowrap disabled:opacity-50"
            disabled={isLoading}
            onClick={onSearch}
          >
            ค้นหา
          </button>
        </div>
      </div>

      {!showSearchResult && selectedProduct && (
        <div className="border rounded-xl bg-blue-50 border-blue-200 p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-blue-700">เลือกสินค้าแล้ว</div>
            <div className="font-semibold text-sm text-gray-900 truncate">{selectedProduct.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              ยี่ห้อ: {getBrandName(selectedProduct)} · ประเภท: {getProductTypeName(selectedProduct)}
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 px-3 py-2 rounded-lg border bg-white text-xs hover:bg-blue-50"
            onClick={onShowSearchResult}
          >
            แสดงผลค้นหา
          </button>
        </div>
      )}

      {showSearchResult && (
        <div className="border rounded-xl overflow-hidden bg-white">
          <div className="px-3 py-2 bg-gray-50 border-b flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">ผลการค้นหา</div>
            <div className="text-xs text-gray-500">
              {visibleProductCount} รายการ · ในร้าน {operationalProducts.length} · Template {visibleTemplateProducts.length}
            </div>
          </div>

          {hiddenTemplateCount > 0 && (
            <div className="px-3 py-2 border-b bg-emerald-50 text-[11px] text-emerald-700">
              ซ่อน Template {hiddenTemplateCount} รายการ เพราะพบสินค้าในร้านที่ตรงกันแล้ว
            </div>
          )}

          {visibleProductCount === 0 ? (
            <div className="p-5 text-center text-sm text-gray-400">ยังไม่มีผลการค้นหา</div>
          ) : (
            <div className="max-h-80 overflow-auto">
              <ProductResultGroup
                title="สินค้าในร้าน / Operational Product"
                description="เลือกแล้วรับเข้าได้ทันที ใช้ productId ของสาขา"
                products={operationalProducts}
                selectedProductId={selectedProductId}
                onSelectProduct={onSelectProduct}
                getBrandName={getBrandName}
                getProductTypeName={getProductTypeName}
                getProductUnitName={getProductUnitName}
              />
              <ProductResultGroup
                title="Template Catalog"
                description="ยังเป็นต้นแบบ ต้องสร้างหรือ adopt เป็นสินค้าในร้านก่อนรับเข้า"
                products={visibleTemplateProducts}
                selectedProductId={selectedProductId}
                onSelectProduct={onSelectProduct}
                getBrandName={getBrandName}
                getProductTypeName={getProductTypeName}
                getProductUnitName={getProductUnitName}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProductFinderPanel;
