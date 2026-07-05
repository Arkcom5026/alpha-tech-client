// ✅ src/features/product/pages/CreateProductPage.jsx
// ✅ Create Product Page — Current hierarchy:
// Business → ProductType → Brand → Product

import React from 'react';
import { Link } from 'react-router-dom';
import useProductCreateRuntimeController from '../../hooks/useProductCreateRuntimeController';
import ProductForm from '../../components/ProductForm';
import ProductImage from '../../components/ProductImage';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

const CreateProductPage = () => {
  const {
    branchId,
    dropdownsLoaded,
    storeError,
    imageRef,
    runtime,
    handleCreate,
    handleStartNextCreate,
    retryLoadDropdowns,
  } = useProductCreateRuntimeController();

  const {
    isProcessing,
    showSuccess,
    saveLocked,
    createdProduct,
    formResetKey,
    errorMessage,
    selectedFiles,
    previewUrls,
    captions,
    coverIndex,
    unlockAfterChange,
    closeSuccessDialog,
    setSelectedFiles,
    setPreviewUrls,
    setCaptions,
    setCoverIndex,
  } = runtime;

  if (!branchId) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8">
        <h2 className="text-xl font-bold mb-4">เพิ่มสินค้า</h2>
        <p className="text-red-500 font-medium">กำลังโหลดข้อมูลสาขา...</p>
      </div>
    );
  }

  if (!dropdownsLoaded) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8">
        <h2 className="text-xl font-bold mb-4">เพิ่มสินค้า</h2>

        {storeError?.message ? (
          <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-4 py-2">
            {storeError.message}
          </div>
        ) : null}

        <p className="text-gray-600">กำลังโหลดรายการตัวเลือก (ประเภทสินค้า / แบรนด์ / หน่วยนับ)...</p>

        <div className="mt-4">
          <button
            type="button"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={retryLoadDropdowns}
          >
            โหลดรายการอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8">
      <h2 className="text-xl font-bold mb-4">เพิ่มสินค้า</h2>

      {errorMessage && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-4 py-2">
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

      <div className="grid grid-cols-1 gap-6">
        <ProductImage
          ref={imageRef}
          files={selectedFiles}
          setFiles={setSelectedFiles}
          previewUrls={previewUrls}
          setPreviewUrls={setPreviewUrls}
          captions={captions}
          setCaptions={setCaptions}
          coverIndex={coverIndex}
          setCoverIndex={setCoverIndex}
          oldImages={[]}
          setOldImages={() => {}}
        />

        <ProductForm
          key={`create-product-form-${formResetKey}`}
          onSubmit={handleCreate}
          mode="create"
          submitDisabled={isProcessing || saveLocked}
          submitLabel={saveLocked ? 'บันทึกแล้ว' : undefined}
          onAnyChange={unlockAfterChange}
          defaultValues={{
            name: '',
            description: '',
            spec: '',

            productTypeId: '',
            brandId: '',
            unitId: '',

            mode: 'STRUCTURED',
            noSN: false,
            trackSerialNumber: true,
            active: true,

            branchPrice: {
              costPrice: '',
              priceRetail: '',
              priceTechnician: '',
              priceOnline: '',
              priceWholesale: '',
            },
          }}
        />
      </div>

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
