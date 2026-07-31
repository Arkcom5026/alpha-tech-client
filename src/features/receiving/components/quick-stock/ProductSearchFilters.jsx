const ProductSearchFilters = ({
  productTypeOptions = [],
  brandOptions = [],
  selectedProductTypeId,
  selectedBrandId,
  keyword,
  busy,
  isLoading,
  onProductTypeChange,
  onBrandChange,
  onKeywordChange,
  onSearch,
  onKeywordEnter,
}) => (
  <>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทสินค้า</label>
        <select
          className="w-full border rounded-lg p-2 bg-white"
          value={selectedProductTypeId}
          disabled={busy}
          onChange={(event) => onProductTypeChange(event.target.value)}
        >
          <option value="">ทั้งหมด</option>
          {productTypeOptions.map((type) => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ</label>
        <select
          className="w-full border rounded-lg p-2 bg-white"
          value={selectedBrandId}
          disabled={busy}
          onChange={(event) => onBrandChange(event.target.value)}
        >
          <option value="">ทั้งหมด</option>
          {brandOptions.map((brand) => (
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
  </>
);

export default ProductSearchFilters;
