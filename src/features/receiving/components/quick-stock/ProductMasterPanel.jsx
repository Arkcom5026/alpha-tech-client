import React from "react";
import OperationalProductPanel from "./OperationalProductPanel";
import TemplateProductStatePanel from "./TemplateProductStatePanel";

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
      <TemplateProductStatePanel
        selectedTemplateProduct={selectedTemplateProduct}
        runtimeStatus={runtimeStatus}
        onClearProduct={onClearProduct}
      />
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
    <OperationalProductPanel
      selectedProduct={selectedProduct}
      productTypes={productTypes}
      brands={brands}
      units={units}
      productForm={productForm}
      priceForm={priceForm}
      isEditingProduct={isEditingProduct}
      isSavingProduct={isSavingProduct}
      isDeletingProduct={isDeletingProduct}
      onEditStart={onEditStart}
      onEditCancel={onEditCancel}
      onSaveProduct={onSaveProduct}
      onClearProduct={onClearProduct}
      onDeleteProduct={onDeleteProduct}
      onProductFieldChange={onProductFieldChange}
      onPriceFieldChange={onPriceFieldChange}
    />
  );
};

export default ProductMasterPanel;
