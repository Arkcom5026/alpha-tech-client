// src/features/product/create/components/ProductCreateImageSection.jsx

import ProductCreateImageUploader from './ProductCreateImageUploader';

const ProductCreateImageSection = ({
  imageRef,
  selectedFiles,
  setSelectedFiles,
  previewUrls,
  setPreviewUrls,
  captions,
  setCaptions,
  coverIndex,
  setCoverIndex,
  disabled = false,
}) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">🖼️ รูปภาพสินค้า</h3>
        <p className="text-xs text-slate-500">
          รูปภาพอยู่ภายใน Product Create Runtime โดยตรง ไม่พึ่ง Component กลางของ Product เดิม
        </p>
      </div>

      <ProductCreateImageUploader
        ref={imageRef}
        files={selectedFiles}
        setFiles={setSelectedFiles}
        previewUrls={previewUrls}
        setPreviewUrls={setPreviewUrls}
        captions={captions}
        setCaptions={setCaptions}
        coverIndex={coverIndex}
        setCoverIndex={setCoverIndex}
        disabled={disabled}
      />
    </section>
  );
};

export default ProductCreateImageSection;
