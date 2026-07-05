// src/features/product/create/pages/CreateProductPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

import ProductCreateBasicSection from '../components/ProductCreateBasicSection';
import ProductCreateBrandSection from '../components/ProductCreateBrandSection';
import ProductCreateExistingModelsPanel from '../components/ProductCreateExistingModelsPanel';
import ProductCreateImageSection from '../components/ProductCreateImageSection';
import ProductCreateInventorySection from '../components/ProductCreateInventorySection';
import ProductCreatePriceSection from '../components/ProductCreatePriceSection';
import ProductCreateSubmitBar from '../components/ProductCreateSubmitBar';
import useProductCreateRuntimeController from '../hooks/useProductCreateRuntimeController';

const CreateProductPage = () => {
  const {
    branchId,
    dropdownsLoaded,
    storeError,
    imageRef,
    runtime,
    handleFieldChange,
    handleCreate,
    handleStartNextCreate,
    retryLoadDropdowns,
    refreshBrands,
    refreshExistingModels,
    selectExistingModel,
  } = useProductCreateRuntimeController();

  const {
    isProcessing,
    showSuccess,
    saveLocked,
    createdProduct,
    formResetKey,
    errorMessage,
    formValues,
    formErrors,
    dropdowns,
    brandsLoading,
    existingModels,
    existingModelsLoading,
    selectedFiles,
    previewUrls,
    captions,
    coverIndex,
    closeSuccessDialog,
    setSelectedFiles,
    setPreviewUrls,
    setCaptions,
    setCoverIndex,
  } = runtime;

  const formDisabled = isProcessing || saveLocked;

  if (!branchId) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 lg:px-8">
        <h2 className="mb-4 text-xl font-bold">เพิ่มสินค้า</h2>
        <p className="font-medium text-red-500">กำลังโหลดข้อมูลสาขา...</p>
      </div>
    );
  }

  if (!dropdownsLoaded) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 lg:px-8">
        <h2 className="mb-4 text-xl font-bold">เพิ่มสินค้า</h2>

        {storeError?.message ? (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-red-700">
            {storeError.message}
          </div>
        ) : null}

        <p className="text-gray-600">กำลังโหลดรายการตัวเลือกสำหรับเพิ่มสินค้า...</p>

        <div className="mt-4">
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={retryLoadDropdowns}
          >
            โหลดรายการอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 lg:px-8">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-xl font-bold">เพิ่มสินค้า</h2>
        <p className="text-sm text-slate-500">
          Product Create Runtime ใช้ API และ Component เฉพาะของงานเพิ่มสินค้า
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-red-700">
          {errorMessage}
        </div>
      )}

      {createdProduct?.id && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          <div className="font-semibold">สร้างสินค้าในสาขาเรียบร้อยแล้ว</div>
          <div className="mt-1 text-green-800">
            Product #{createdProduct.id} · {createdProduct.name || 'ไม่ระบุชื่อสินค้า'}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to={`/pos/stock/products/edit/${createdProduct.id}`}
              className="rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-green-100"
            >
              เปิดหน้าแก้ไขสินค้า
            </Link>
            <Link
              to="/pos/stock/products"
              className="rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-green-100"
            >
              ไป Product List
            </Link>
            <button
              type="button"
              onClick={handleStartNextCreate}
              className="rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-green-100"
            >
              เพิ่มสินค้ารายการถัดไป
            </button>
          </div>
        </div>
      )}

      <form
        key={`create-product-form-${formResetKey}`}
        onSubmit={handleCreate}
        className="grid grid-cols-1 gap-6"
      >
        <ProductCreateImageSection
          imageRef={imageRef}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          previewUrls={previewUrls}
          setPreviewUrls={setPreviewUrls}
          captions={captions}
          setCaptions={setCaptions}
          coverIndex={coverIndex}
          setCoverIndex={setCoverIndex}
          disabled={formDisabled}
        />

        <ProductCreateBasicSection
          values={formValues}
          dropdowns={dropdowns}
          errors={formErrors}
          disabled={formDisabled}
          onChange={handleFieldChange}
        />

        <ProductCreateBrandSection
          values={formValues}
          brands={dropdowns.brands}
          errors={formErrors}
          loading={brandsLoading}
          disabled={formDisabled}
          onChange={handleFieldChange}
          onRefreshBrands={refreshBrands}
        />

        <ProductCreateExistingModelsPanel
          items={existingModels}
          loading={existingModelsLoading}
          productTypeId={formValues.productTypeId}
          brandId={formValues.brandId}
          onSelect={selectExistingModel}
          onRefresh={refreshExistingModels}
        />

        <ProductCreateInventorySection
          values={formValues}
          errors={formErrors}
          disabled={formDisabled}
          onChange={handleFieldChange}
        />

        <ProductCreatePriceSection
          values={formValues}
          errors={formErrors}
          disabled={formDisabled}
          onChange={handleFieldChange}
        />

        <ProductCreateSubmitBar
          loading={isProcessing}
          disabled={formDisabled}
          submitLabel={saveLocked ? 'บันทึกแล้ว' : 'บันทึกสินค้า'}
        />
      </form>

      <ProcessingDialog
        open={isProcessing || showSuccess}
        isLoading={isProcessing}
        message={isProcessing ? 'ระบบกำลังบันทึกข้อมูล กรุณารอสักครู่...' : '✅ บันทึกข้อมูลเรียบร้อยแล้ว'}
        onClose={closeSuccessDialog}
      />
    </div>
  );
};

export default CreateProductPage;
