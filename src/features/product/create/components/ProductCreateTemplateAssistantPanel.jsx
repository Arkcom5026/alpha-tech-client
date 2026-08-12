import React, { useMemo, useState } from 'react';

const getTemplateId = (item) => Number(item?.templateProductId ?? item?.id) || null;

const ProductCreateTemplateAssistantPanel = ({
  items = [],
  selectedTemplate,
  loading = false,
  cloning = false,
  disabled = false,
  onSearch,
  onSelect,
  onUseTemplate,
  onClear,
}) => {
  const [query, setQuery] = useState('');

  const selectedId = getTemplateId(selectedTemplate);
  const hasResults = Array.isArray(items) && items.length > 0;

  const previewRows = useMemo(() => {
    if (!selectedTemplate) return [];

    return [
      ['ประเภทสินค้า', selectedTemplate.productTypeName || selectedTemplate.productType || '-'],
      ['แบรนด์', selectedTemplate.brandName || selectedTemplate.brand?.name || '-'],
      ['หน่วยนับ', selectedTemplate.unitName || selectedTemplate.unit?.name || '-'],
      ['ราคาทุน', selectedTemplate.costPrice ?? '-'],
      ['ราคาขายปลีก', selectedTemplate.priceRetail ?? '-'],
    ];
  }, [selectedTemplate]);

  const submitSearch = (event) => {
    event?.preventDefault?.();
    onSearch?.(query);
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">ใช้ Template ช่วยสร้างสินค้า</h3>
          <p className="mt-1 text-sm text-slate-600">
            ตัวเลือกเสริมสำหรับลดงานกรอกข้อมูล คุณยังสามารถสร้างสินค้าเองด้วยฟอร์มด้านล่างได้ตามปกติ
          </p>
        </div>
        {selectedTemplate ? (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled || cloning}
            className="mt-2 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0"
          >
            ยกเลิก Template
          </button>
        ) : null}
      </div>

      <form onSubmit={submitSearch} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ค้นหาชื่อสินค้า แบรนด์ รุ่น หรือข้อมูลจาก Template Store"
          disabled={disabled || cloning}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-200 focus:border-emerald-500 focus:ring-2 disabled:bg-slate-100"
        />
        <button
          type="submit"
          disabled={disabled || cloning || loading}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'กำลังค้นหา...' : 'ค้นหา Template'}
        </button>
      </form>

      {!selectedTemplate && hasResults ? (
        <div className="mt-3 max-h-72 space-y-2 overflow-auto pr-1">
          {items.map((item) => {
            const templateId = getTemplateId(item);
            return (
              <button
                key={`template-${templateId}`}
                type="button"
                onClick={() => onSelect?.(item)}
                disabled={disabled || cloning}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="font-medium text-slate-900">{item?.name || 'ไม่ระบุชื่อสินค้า'}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {[item?.productTypeName, item?.brandName].filter(Boolean).join(' · ') || 'Template Product'}
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {!selectedTemplate && !loading && Array.isArray(items) && items.length === 0 && query.trim() ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-500">
          ไม่พบ Template จากคำค้นนี้ คุณยังสามารถสร้างสินค้าเองได้ตามปกติ
        </div>
      ) : null}

      {selectedTemplate ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Template Preview</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{selectedTemplate.name}</div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {previewRows.map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="mt-0.5 font-medium text-slate-800">{String(value)}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                เมื่อใช้ Template ระบบจะสร้าง Operational Product ของร้าน แล้วพาไปหน้าแก้ไขเพื่อ Review/Edit ก่อนใช้งานต่อ
              </p>
            </div>

            <button
              type="button"
              onClick={() => onUseTemplate?.(selectedTemplate)}
              disabled={disabled || cloning || !selectedId}
              className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cloning ? 'กำลังสร้างจาก Template...' : 'ใช้ Template นี้'}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ProductCreateTemplateAssistantPanel;
