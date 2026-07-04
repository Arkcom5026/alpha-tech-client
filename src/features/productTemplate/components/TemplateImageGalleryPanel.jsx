import React from 'react';
import useProductTemplateStore from '../store/productTemplateStore';

const getImageUrl = (image) => image?.secure_url || image?.url || image?.imageUrl || '';

const TemplateImageGalleryPanel = ({ template }) => {
  const inputRef = React.useRef(null);
  const {
    isUploadingImage,
    uploadTemplateImageAction,
    deleteTemplateImageAction,
    setTemplateCoverImageAction,
  } = useProductTemplateStore();

  const images = Array.isArray(template?.images) ? template.images : [];
  const cover = images.find((image) => image?.isCover) || images[0] || null;
  const coverUrl = template?.imageUrl || getImageUrl(cover);
  const templateId = template?.id;

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !templateId) return;
    await uploadTemplateImageAction(templateId, file);
    event.target.value = '';
  };

  const handleDelete = async (image) => {
    if (!templateId || !image) return;
    const confirmed = window.confirm('ลบรูป Template นี้หรือไม่?');
    if (!confirmed) return;
    await deleteTemplateImageAction(templateId, image);
  };

  const handleSetCover = async (image) => {
    if (!templateId || !image?.id) return;
    await setTemplateCoverImageAction(templateId, image.id);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-900">Template Images</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            รูปภาพของ Template Catalog ใช้ประกอบการค้นหาและ clone source เท่านั้น
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
          {images.length} images
        </span>
      </div>

      <div className="mt-4 flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
        {coverUrl ? (
          <img src={coverUrl} alt={template?.name || 'Product Template'} className="h-full w-full object-cover" />
        ) : (
          <div className="px-6 text-center text-sm font-bold text-slate-400">No image</div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploadingImage || !templateId}
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-orange-500 disabled:opacity-60"
        >
          {isUploadingImage ? 'Processing...' : '+ Upload Image'}
        </button>
        <p className="text-[11px] font-semibold text-slate-400">JPEG, PNG หรือ WEBP เท่านั้น</p>
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {images.slice(0, 8).map((image) => {
            const url = getImageUrl(image);
            if (!url) return null;
            return (
              <div key={image.id || image.public_id || url} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                <div className="relative aspect-square">
                  <img src={url} alt="Template gallery" className="h-full w-full object-cover" />
                  {image.isCover && (
                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black text-orange-600">Cover</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1 p-2">
                  <button
                    type="button"
                    disabled={isUploadingImage || image.isCover}
                    onClick={() => handleSetCover(image)}
                    className="rounded-xl border border-slate-200 px-2 py-2 text-[11px] font-black text-slate-600 disabled:opacity-40"
                  >
                    Cover
                  </button>
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => handleDelete(image)}
                    className="rounded-xl border border-red-100 bg-red-50 px-2 py-2 text-[11px] font-black text-red-600 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
        Image actions affect Template Catalog only
      </div>
    </section>
  );
};

export default TemplateImageGalleryPanel;
