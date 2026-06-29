import React from "react";

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
            <div className="text-xs text-gray-500">{filteredProducts.length} รายการ</div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-5 text-center text-sm text-gray-400">ยังไม่มีผลการค้นหา</div>
          ) : (
            <div className="divide-y max-h-80 overflow-auto">
              {filteredProducts.map((product) => {
                const isSelected = Number(product?.id) === Number(selectedProductId);
                return (
                  <button
                    key={product.id}
                    type="button"
                    className={`w-full text-left px-3 py-3 hover:bg-blue-50 ${isSelected ? "bg-blue-50" : "bg-white"}`}
                    onClick={() => onSelectProduct(product.id)}
                  >
                    <div className="font-semibold text-sm text-gray-900">{product.name}</div>
                    <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500">
                      <div>ยี่ห้อ: {getBrandName(product)}</div>
                      <div>ประเภท: {getProductTypeName(product)}</div>
                      <div>หน่วย: {getProductUnitName(product)}</div>
                      <div>โหมด: {product?.mode || "STRUCTURED"}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProductFinderPanel;
