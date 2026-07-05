import React from 'react';

const toOptions = (items = []) => (Array.isArray(items) ? items : []);

const ProductBasicSection = ({
  register,
  errors = {},
  productTypes = [],
  brands = [],
  units = [],
  watchedProductTypeId,
  showCreateBrandHelper = false,
  setShowCreateBrandHelper,
  showExistingBrandHelper = false,
  setShowExistingBrandHelper,
  brandSearch = '',
  setBrandSearch,
  newBrandName = '',
  setNewBrandName,
  brandHelperError = '',
  brandHelperSuccess = '',
  brandHelperSaving = false,
  onCreateBrandAndAttach,
  onAttachExistingBrand,
  unmappedExistingBrands = [],
}) => {
  const productTypeOptions = toOptions(productTypes);
  const brandOptions = toOptions(brands);
  const unitOptions = toOptions(units);
  const canManageBrandMapping = Boolean(watchedProductTypeId);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">📦 ข้อมูลหลักสินค้า</h2>
        <p className="text-xs text-slate-500 mt-1">โครงสร้างปัจจุบัน: ประเภทสินค้า → แบรนด์ → สินค้า</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-medium mb-1 text-gray-700">
            ชื่อสินค้า <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="เช่น Canon PIXMA G2010, Kingston NV2 1TB"
            {...register('name', { required: 'กรุณาระบุชื่อสินค้า' })}
            className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="productTypeId" className="block font-medium mb-1 text-gray-700">
              ประเภทสินค้า <span className="text-red-500">*</span>
            </label>
            <select
              id="productTypeId"
              {...register('productTypeId', { required: 'กรุณาเลือกประเภทสินค้า' })}
              className="w-full p-2 border rounded-md bg-white focus:ring-blue-400 focus:border-blue-400 text-gray-800"
            >
              <option value="">-- เลือกประเภทสินค้า --</option>
              {productTypeOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            {errors.productTypeId && <p className="text-red-500 text-sm mt-1">{String(errors.productTypeId.message)}</p>}
            {productTypeOptions.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">ยังไม่พบประเภทสินค้า กรุณาตรวจสอบ endpoint dropdown</p>
            )}
          </div>

          <div>
            <label htmlFor="brandId" className="block font-medium mb-1 text-gray-700">
              แบรนด์ <span className="text-red-500">*</span>
            </label>
            <select
              id="brandId"
              {...register('brandId', { required: 'กรุณาเลือกแบรนด์' })}
              disabled={!canManageBrandMapping}
              className="w-full p-2 border rounded-md bg-white focus:ring-blue-400 focus:border-blue-400 text-gray-800 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">-- เลือกแบรนด์ --</option>
              {brandOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            {errors.brandId && <p className="text-red-500 text-sm mt-1">{String(errors.brandId.message)}</p>}

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              {!canManageBrandMapping && <span className="text-slate-500">* กรุณาเลือกประเภทสินค้าก่อน</span>}
              {canManageBrandMapping && (
                <>
                  <button
                    type="button"
                    className="text-blue-600 hover:underline disabled:text-slate-400"
                    disabled={brandHelperSaving}
                    onClick={() => setShowCreateBrandHelper?.(!showCreateBrandHelper)}
                  >
                    + เพิ่มแบรนด์ใหม่
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    className="text-blue-600 hover:underline disabled:text-slate-400"
                    disabled={brandHelperSaving}
                    onClick={() => setShowExistingBrandHelper?.(!showExistingBrandHelper)}
                  >
                    ไม่พบแบรนด์ที่ต้องการ?
                  </button>
                </>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="unitId" className="block font-medium mb-1 text-gray-700">
              หน่วยนับ <span className="text-red-500">*</span>
            </label>
            <select
              id="unitId"
              {...register('unitId', { required: 'กรุณาเลือกหน่วยนับ' })}
              className="w-full p-2 border rounded-md bg-white focus:ring-blue-400 focus:border-blue-400 text-gray-800"
            >
              <option value="">-- เลือกหน่วยนับ --</option>
              {unitOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            {errors.unitId && <p className="text-red-500 text-sm mt-1">{String(errors.unitId.message)}</p>}
          </div>
        </div>

        {(showCreateBrandHelper || showExistingBrandHelper || brandHelperError || brandHelperSuccess) && (
          <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3 space-y-3">
            {showCreateBrandHelper && (
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(event) => setNewBrandName?.(event.target.value)}
                  placeholder="ชื่อแบรนด์ใหม่"
                  className="flex-1 rounded-md border bg-white px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={brandHelperSaving}
                  onClick={onCreateBrandAndAttach}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {brandHelperSaving ? 'กำลังบันทึก...' : 'สร้างและผูกแบรนด์'}
                </button>
              </div>
            )}

            {showExistingBrandHelper && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(event) => setBrandSearch?.(event.target.value)}
                  placeholder="ค้นหาแบรนด์ที่มีอยู่..."
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                />
                <div className="max-h-40 overflow-auto rounded-md border bg-white divide-y">
                  {toOptions(unmappedExistingBrands).length === 0 ? (
                    <div className="px-3 py-2 text-sm text-slate-500">ไม่พบแบรนด์ที่ยังไม่ได้ผูกกับประเภทสินค้านี้</div>
                  ) : (
                    toOptions(unmappedExistingBrands).map((brand) => (
                      <button
                        key={brand.id}
                        type="button"
                        disabled={brandHelperSaving}
                        onClick={() => onAttachExistingBrand?.(brand)}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50 disabled:opacity-50"
                      >
                        {brand.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {brandHelperError && <div className="text-sm text-red-600">{brandHelperError}</div>}
            {brandHelperSuccess && <div className="text-sm text-emerald-700">{brandHelperSuccess}</div>}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductBasicSection;
