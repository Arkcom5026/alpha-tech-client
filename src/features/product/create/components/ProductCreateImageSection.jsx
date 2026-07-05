// src/features/product/create/components/ProductCreateImageSection.jsx

import ProductImage from '../../components/ProductImage';

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
}) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">🖼️ รูปภาพสินค้า</h3>
        <p className="text-xs text-slate-500">
          รูปภาพเป็นส่วนหนึ่งของ Product Create flow แต่แยก section เพื่อให้เปลี่ยนเงื่อนไขได้ง่าย
        </p>
      </div>

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
    </section>
  );
};

export default ProductCreateImageSection;
