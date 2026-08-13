const getDiscoveryKey = (product) => {
  const source = product?.__quickStockDiscoverySource || (product?.isTemplateProduct ? "TEMPLATE" : "OPERATIONAL");
  return `${source}:${product?.id}`;
};

const ProductResultRow = ({
  product,
  selectedProductId,
  onSelectProduct,
  getBrandName,
  getProductTypeName,
  getProductUnitName,
  isTemplateCandidate,
}) => {
  const discoveryKey = getDiscoveryKey(product);
  const isSelected = String(selectedProductId) === discoveryKey || String(selectedProductId) === String(product?.id);
  const template = isTemplateCandidate(product);

  return (
    <button
      type="button"
      className={`w-full text-left px-3 py-3 hover:bg-blue-50 ${isSelected ? "bg-blue-50" : "bg-white"}`}
      onClick={() => onSelectProduct(discoveryKey)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-sm text-gray-900 min-w-0">{product.name}</div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${template ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {template ? "Template · เตรียมให้อัตโนมัติ" : "Operational · พร้อมรับเข้า"}
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

const ProductResultGroup = ({
  title,
  description,
  products = [],
  selectedProductId,
  onSelectProduct,
  getBrandName,
  getProductTypeName,
  getProductUnitName,
  isTemplateCandidate,
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
            isTemplateCandidate={isTemplateCandidate}
          />
        ))}
      </div>
    </div>
  );
};

const ProductSearchResults = ({
  showSearchResult,
  selectedProduct,
  onShowSearchResult,
  operationalProducts = [],
  templateProducts = [],
  selectedProductId,
  onSelectProduct,
  getBrandName,
  getProductTypeName,
  getProductUnitName,
  isTemplateCandidate,
}) => {
  const visibleProductCount = operationalProducts.length + templateProducts.length;

  if (!showSearchResult && selectedProduct) {
    return (
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
    );
  }

  if (!showSearchResult) return null;

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      <div className="px-3 py-2 bg-gray-50 border-b flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-800">ผลการค้นหา</div>
        <div className="text-xs text-gray-500">
          {visibleProductCount} รายการ · ในร้าน {operationalProducts.length} · Template {templateProducts.length}
        </div>
      </div>
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
            isTemplateCandidate={isTemplateCandidate}
          />
          <ProductResultGroup
            title="Template Catalog"
            description="เลือกได้ทันที ระบบจะเตรียม Local Product ของร้านให้อัตโนมัติก่อนรับเข้า"
            products={templateProducts}
            selectedProductId={selectedProductId}
            onSelectProduct={onSelectProduct}
            getBrandName={getBrandName}
            getProductTypeName={getProductTypeName}
            getProductUnitName={getProductUnitName}
            isTemplateCandidate={isTemplateCandidate}
          />
        </div>
      )}
    </div>
  );
};

export default ProductSearchResults;
