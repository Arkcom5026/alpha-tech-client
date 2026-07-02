import React from "react";
import ProductEditor from "./ProductEditor";

const ProductMasterPanel = ({
  selectedProduct,
  selectedTemplateProduct,
  runtimeStatus = "IDLE",
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
  if (selectedTemplateProduct && !selectedProduct) {
    return (
      <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-amber-900">
              ยังไม่มี Operational Product ของร้าน
            </div>
            <div className="mt-1 text-amber-950 text-base font-bold truncate">
              {selectedTemplateProduct.name}
            </div>
            <div className="mt-2 text-xs text-amber-800 leading-relaxed">
              รายการนี้มาจาก Template Catalog (T01) ใช้สำหรับค้นหาและ Clone เท่านั้น
              จึงไม่แสดง/ไม่แก้ไขรายละเอียดสินค้าและราคาเดิมของร้านในส่วนนี้
            </div>
          </div>

          <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-white border border-amber-200 text-amber-700">
            {runtimeStatus === "LOADING" ? "LOADING" : "NOT CREATED"}
          </span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white/70 p-3 text-xs text-amber-900 space-y-1">
          <div>เมื่อ Commit ครั้งแรก ระบบจะ:</div>
          <div>✓ Clone Product เข้า Branch ปัจจุบัน</div>
          <div>✓ สร้าง/บันทึก BranchPrice ของร้าน</div>
          <div>✓ รับสินค้าเข้า Stock Runtime</div>
        </div>

        <button
          type="button"
          className="text-xs text-red-600 hover:underline"
          onClick={onClearProduct}
        >
          เปลี่ยนสินค้า
        </button>
      </section>
    );
  }

  if (!selectedProduct) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="text-sm text-gray-400 text-center py-8">
          เลือกสินค้าก่อนเพื่อแสดงข้อมูล Operational Product ของร้าน
        </div>
      </section>
    );
  }

  return (
    <section className="bg-green-50 border border-green-200 rounded-2xl p-5 text-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-green-800">
            Operational Product ของร้าน
          </div>
          <div className="mt-1 text-green-950 text-base font-bold truncate">
            {productForm.name || selectedProduct.name}
          </div>
          {!isEditingProduct && (
            <div className="mt-1 text-xs text-green-700">
              ข้อมูลนี้มาจาก Product ของร้านเท่านั้น ไม่ใช่ Template Product
            </div>
          )}
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-white border border-green-200 text-green-700">
          OPERATIONAL
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
