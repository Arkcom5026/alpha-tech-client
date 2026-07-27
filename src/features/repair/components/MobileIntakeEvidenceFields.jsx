import React, { useEffect, useMemo } from 'react';

const PERMISSIONS = [
  ['allowDisassembly', 'อนุญาตให้เปิดเครื่องเพื่อตรวจสอบ'],
  ['allowDataErase', 'อนุญาตให้ลบข้อมูลเมื่อจำเป็น'],
  ['allowFactoryReset', 'อนุญาตให้คืนค่าโรงงานเมื่อจำเป็น'],
  ['allowOutsourceRepair', 'อนุญาตให้ส่งซ่อมภายนอกเมื่อจำเป็น'],
];

const MobileIntakeEvidenceFields = ({ value, onChange }) => {
  const photos = value?.photos || [];
  const previews = useMemo(
    () => photos.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [photos]
  );

  useEffect(
    () => () => previews.forEach((item) => URL.revokeObjectURL(item.url)),
    [previews]
  );

  const patch = (field, nextValue) =>
    onChange({ ...value, [field]: nextValue });

  const addPhotos = (event) => {
    const selected = Array.from(event.target.files || []);
    patch('photos', [...photos, ...selected].slice(0, 6));
    event.target.value = '';
  };

  return (
    <section className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
          Paperless Intake Evidence
        </p>
        <h3 className="mt-1 font-black text-slate-950">ภาพสภาพเครื่องและคำยืนยัน</h3>
        <p className="mt-1 text-xs text-slate-600">
          ถ่ายภาพจากโทรศัพท์ได้ทันที สูงสุด 6 ภาพ เพื่อเป็นหลักฐานร่วมกัน
        </p>
      </div>

      <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-emerald-500 bg-white px-4 text-sm font-black text-emerald-700">
        📷 ถ่ายภาพ / เลือกภาพ ({photos.length}/6)
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={addPhotos}
          className="sr-only"
        />
      </label>

      {previews.length ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {previews.map((item, index) => (
            <div key={`${item.file.name}-${item.file.lastModified}`} className="relative">
              <img
                src={item.url}
                alt={`หลักฐาน ${index + 1}`}
                className="aspect-square w-full rounded-lg border border-slate-200 object-cover"
              />
              <button
                type="button"
                aria-label={`ลบภาพ ${index + 1}`}
                onClick={() => patch('photos', photos.filter((_, photoIndex) => photoIndex !== index))}
                className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-slate-950/80 text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        {PERMISSIONS.map(([field, label]) => (
          <label key={field} className="flex min-h-11 items-center gap-3 rounded-xl border border-emerald-100 bg-white px-3 text-sm font-bold text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(value?.[field])}
              onChange={(event) => patch(field, event.target.checked)}
              className="h-5 w-5"
            />
            {label}
          </label>
        ))}
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-black text-slate-600">ชื่อผู้ยืนยัน *</span>
        <input
          value={value?.customerSignature || ''}
          onChange={(event) => patch('customerSignature', event.target.value)}
          placeholder="ลูกค้าหรือผู้ส่งมอบพิมพ์ชื่อเพื่อยืนยัน"
          className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4"
        />
      </label>

      <label className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-white p-3 text-sm font-bold text-slate-800">
        <input
          type="checkbox"
          checked={Boolean(value?.confirmed)}
          onChange={(event) => patch('confirmed', event.target.checked)}
          className="mt-0.5 h-5 w-5"
        />
        <span>
          ยืนยันว่าอุปกรณ์ อาการ และสิ่งที่นำมาด้วยถูกต้อง และรับทราบขอบเขตการตรวจสอบข้างต้น
        </span>
      </label>
    </section>
  );
};

export default MobileIntakeEvidenceFields;
