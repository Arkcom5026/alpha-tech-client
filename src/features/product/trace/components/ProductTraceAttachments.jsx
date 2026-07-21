import React from 'react';

const collectAttachments = (trace = {}) => {
  const attachments = [];
  const add = (item) => {
    if (!item?.url) return;
    if (attachments.some((existing) => existing.url === item.url)) return;
    attachments.push(item);
  };

  (trace?.identity?.product?.images || []).forEach((image, index) => {
    add({
      id: `product-image-${image?.id || index}`,
      title: image?.isCover ? 'รูปสินค้าหลัก' : `รูปสินค้า ${index + 1}`,
      type: 'PRODUCT_IMAGE',
      url: image?.url,
    });
  });

  (trace?.attachments || []).forEach((item, index) => {
    add({
      id: item?.id || `attachment-${index}`,
      title: item?.title || item?.name || item?.filename || 'เอกสารแนบ',
      type: item?.type || 'ATTACHMENT',
      url: item?.url,
    });
  });

  (trace?.timeline || []).forEach((event, eventIndex) => {
    (event?.attachments || []).forEach((item, index) => {
      add({
        id: item?.id || `timeline-${eventIndex}-${index}`,
        title: item?.title || event?.title || 'หลักฐานเหตุการณ์',
        type: item?.type || event?.category || 'EVIDENCE',
        url: item?.url,
      });
    });
  });

  return attachments;
};

const ProductTraceAttachments = ({ trace }) => {
  const attachments = collectAttachments(trace);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-950">Attachments & Evidence</h3>
          <p className="mt-1 text-xs text-slate-500">
            รูปสินค้า รูป Serial เอกสารซื้อ ใบเคลม และหลักฐานเหตุการณ์
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          {attachments.length} ไฟล์
        </span>
      </div>

      {attachments.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {attachments.map((attachment) => (
            <a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm"
            >
              <div className="flex h-28 items-center justify-center bg-white">
                {/\.(png|jpe?g|webp|gif)(\?|$)/i.test(attachment.url) ? (
                  <img
                    src={attachment.url}
                    alt={attachment.title}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-xs font-black text-slate-400">DOCUMENT</div>
                )}
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-black text-slate-950">
                  {attachment.title}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-blue-600">
                  {attachment.type}
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <div className="text-sm font-black text-slate-700">ตรวจแล้ว ยังไม่พบเอกสารแนบ</div>
          <p className="mt-1 text-xs text-slate-500">
            เมื่อ Backend ส่งรูปหรือเอกสารหลักฐาน ส่วนนี้จะแสดงโดยอัตโนมัติ
          </p>
        </div>
      )}
    </section>
  );
};

export default ProductTraceAttachments;
