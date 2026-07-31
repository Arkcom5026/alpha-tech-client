import React from "react";
import ProductIdentityFields from "./ProductIdentityFields";
import ProductPriceFields from "./ProductPriceFields";

const ProductEditor = ({
  productTypes = [],
  brands = [],
  units = [],
  productForm,
  priceForm,
  isEditingProduct,
  onProductFieldChange,
  onPriceFieldChange,
}) => (
  <>
    <ProductIdentityFields
      productTypes={productTypes}
      brands={brands}
      units={units}
      productForm={productForm}
      isEditingProduct={isEditingProduct}
      onProductFieldChange={onProductFieldChange}
    />

    <ProductPriceFields
      priceForm={priceForm}
      onPriceFieldChange={onPriceFieldChange}
    />
  </>
);

export default ProductEditor;
