import React, { useMemo, useState } from 'react';

const getTemplateId = (item) => Number(item?.templateProductId ?? item?.id) || null;

const ProductCreateTemplateAssistantPanel = ({
  items = [],
  selectedTemplate,
  loading = false,
  cloning = false,
  disabled = false,
  preflight,
  onSearch,
  onSelect,
  onUseTemplate,
  onOpenExistingProduct,
  onClear,
}) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const selectedId = getTemplateId(selectedTemplate);
  const hasResults = Array.isArray(items) && items.length > 0;
  const checking = preflight?.checking === true;
  const checked = preflight?.checked === true;
  const exactLinkedProduct = preflight?.exactLinkedProduct || null;
  const potentialDuplicates = Array.isArray(preflight?.potentialDuplicates)
    ? preflight.potentialDuplicates
    : [];

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
    setHasSearched(true);
    onSearch?.(query);
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setHasSearched(false);
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
          onChange={handleQueryChange}
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

      {!selectedTemplate && hasSearched && !loading && Array.isArray(items) && items.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-500">
          ไม่พบ Template จากคำค้นนี้ คุณยังสามารถสร้างสินค้าเองได้ตามปกติ
        </div>
      ) : null}

      {selectedTemplate ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
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
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="text-sm font-semibold text-slate-900">ตรวจสอบกับสินค้าในร้านก่อนสร้าง</div>

            {checking ? (
              <div className="mt-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-sky-800">
                กำลังเปรียบเทียบ Template กับ Operational Product ในร้าน...
              </div>
            ) : null}

            {!checking && checked && exactLinkedProduct ? (
              <div className="mt-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                <div className="font-semibold">มี Product ที่สร้างจาก Template นี้อยู่ในร้านแล้ว</div>
                <div className="mt-1">#{exactLinkedProduct.id} · {exactLinkedProduct.name || 'ไม่ระบุชื่อสินค้า'}</div>
                <button
                  type="button"
                  onClick={() => onOpenExistingProduct?.(exactLinkedProduct)}
                  className="mt-3 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-amber-100"
                >
                  เปิด Product เดิม
                </button>
              </div>
            ) : null}

            {!checking && checked && !exactLinkedProduct && potentialDuplicates.length > 0 ? (
              <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                <div className="text-sm font-semibold text-amber-900">พบสินค้าในร้านที่อาจซ้ำหรือใกล้เคียง</div>
                <p className="mt-1 text-xs text-amber-800">
                  รายการเหล่านี้เป็นเพียงคำเตือนจากความคล้ายกัน ไม่ได้ถูกผูกกับ Template อัตโนมัติ
                </p>
                <div className="mt-3 space-y-2">
                  {potentialDuplicates.map(({ product, reasons }) => (
                    <div key={`potential-${product.id}`} className="rounded-lg border border-amber-200 bg-white p-3">
                      <div className="text-sm font-medium text-slate-900">#{product.id} · {product.name || 'ไม่ระบุชื่อสินค้า'}</div>
                      <div className="mt-1 text-xs text-slate-500">{reasons.join(' · ')}</div>
                      <button
                        type="button"
                        onClick={() => onOpenExistingProduct?.(product)}
                        className="mt-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                      >
                        เปิดดู Product นี้
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {!checking && checked && !exactLinkedProduct && potentialDuplicates.length === 0 ? (
              <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
                ยังไม่พบ Product ในร้านที่ตรงหรือใกล้เคียงกับ Template นี้
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              ความคล้ายกันไม่ใช่การผูกข้อมูลอัตโนมัติ ร้านยังเลือกสร้าง Product ใหม่จาก Template ได้เอง
            </p>
            <button
              type="button"
              onClick={() => onUseTemplate?.(selectedTemplate)}
              disabled={disabled || cloning || checking || !checked || !selectedId}
              className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cloning ? 'กำลังสร้างจาก Template...' : checking ? 'กำลังตรวจสอบ...' : 'ใช้ Template นี้'}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ProductCreateTemplateAssistantPanel;
