import React from "react";
import ProductEditor from "./ProductEditor";

const ProductMasterPanel = ({
  selectedProduct,
  productTypes = [],
  brands = [],
  units = [],
  productForm,
  priceForm,
  isEditingProduct,
  isSavingProduct,
  isDeletingProduct,
  onEditStart,
  onEditCancel,
  onSaveProduct,
  onClearProduct,
  onDeleteProduct,
  onProductFieldChange,
  onPriceFieldChange,
}) => {
  if (!selectedProduct) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="text-sm text-gray-400 text-center py-8">
          เลือกสินค้าก่อนเพื่อแสดงข้อมูลสินค้าและราคาขาย
        </div>
      </section>
    );
  }

  return (
    <section className="bg-green-50 border border-green-200 rounded-2xl p-5 text-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-green-800">เลือกสินค้าแล้ว</div>
          <div className="mt-1 text-green-950 text-base font-bold truncate">
            {productForm.name || selectedProduct.name}
          </div>
          {!isEditingProduct && (
            <div className="mt-1 text-xs text-green-700">
              รายละเอียดสินค้าถูกซ่อนไว้ เพื่อให้พื้นที่หลักใช้สำหรับรับสินค้าเข้า
            </div>
          )}
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-white border border-green-200 text-green-700">
          STRUCTURED
        </span>
      </div>

      {isEditingProduct && (
        <ProductEditor
          productTypes={productTypes}
          brands={brands}
          units={units}
          productForm={productForm}
          priceForm={priceForm}
          isEditingProduct={isEditingProduct}
          onProductFieldChange={onProductFieldChange}
          onPriceFieldChange={onPriceFieldChange}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        {!isEditingProduct ? (
          <button
            type="button"
            className="px-3 py-2 rounded-lg border bg-white text-blue-700 text-xs font-medium hover:bg-blue-50"
            onClick={onEditStart}
          >
            ✏️ แก้ไขรายละเอียดสินค้า
          </button>
        ) : (
          <>
            <button
              type="button"
              className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
              onClick={onSaveProduct}
              disabled={isSavingProduct}
            >
              {isSavingProduct ? "กำลังบันทึก..." : "บันทึกข้อมูลสินค้า"}
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-lg border bg-white text-xs hover:bg-gray-50"
              onClick={onEditCancel}
            >
              ยกเลิกแก้ไข
            </button>
          </>
        )}

        <button
          type="button"
          className="text-xs text-red-600 hover:underline"
          onClick={onClearProduct}
        >
          เปลี่ยนสินค้า
        </button>

        <button
          type="button"
          className="text-xs text-red-700 hover:underline font-semibold disabled:opacity-50"
          onClick={onDeleteProduct}
          disabled={isDeletingProduct}
          title="ใช้เฉพาะช่วง Recovery สำหรับรายการซ้ำ/ผิดที่ยังไม่มีประวัติ"
        >
          {isDeletingProduct ? "กำลังลบ..." : "🗑️ ลบรายการสินค้า"}
        </button>
      </div>
    </section>
  );
};

export default ProductMasterPanel;
