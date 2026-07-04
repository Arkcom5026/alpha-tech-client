import React from 'react';

const getImageUrl = (image) => image?.secure_url || image?.url || image?.imageUrl || '';

const TemplateImageGalleryPanel = ({ template }) => {
  const images = Array.isArray(template?.images) ? template.images : [];
  const cover = images.find((image) => image?.isCover) || images[0] || null;
  const coverUrl = template?.imageUrl || getImageUrl(cover);

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

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {images.slice(0, 8).map((image) => {
            const url = getImageUrl(image);
            if (!url) return null;
            return (
              <div key={image.id || image.public_id || url} className="relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                <img src={url} alt="Template gallery" className="h-full w-full object-cover" />
                {image.isCover && (
                  <span className="absolute left-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black text-orange-600">Cover</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
        Image upload manager will be added as a governance action
      </div>
    </section>
  );
};

export default TemplateImageGalleryPanel;
