// src/features/product/create/components/ProductCreateExistingModelsPanel.jsx

const ProductCreateExistingModelsPanel = ({
  items = [],
  loading = false,
  productTypeId,
  brandId,
  onSelect,
  onRefresh,
}) => {
  const ready = !!productTypeId;

  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">รายการรุ่นสินค้าที่มีอยู่แล้ว</h3>
          <p className="text-xs text-slate-500">
            เลือกประเภทสินค้าและแบรนด์ก่อน ระบบจะแสดงชื่อรุ่นที่มีอยู่แล้วเพื่อช่วยป้องกันการเพิ่มซ้ำ
          </p>
        </div>

        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            disabled={!ready || loading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'กำลังโหลด...' : 'ตรวจซ้ำ'}
          </button>
        ) : null}
      </div>

      {!ready ? (
        <p className="text-sm text-slate-500">เลือกประเภทสินค้าก่อน</p>
      ) : loading ? (
        <p className="text-sm text-slate-500">กำลังโหลดรายการรุ่นสินค้า...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">
          ยังไม่พบรุ่นสินค้าที่ซ้ำในเงื่อนไขนี้ {brandId ? '' : '(ยังไม่ได้เลือกแบรนด์)'}
        </p>
      ) : (
        <div className="max-h-56 overflow-auto rounded-lg border border-slate-200">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect?.(item)}
              className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50 last:border-b-0"
            >
              <div className="font-medium text-slate-900">{item.name}</div>
              <div className="text-xs text-slate-500">
                {item.productType?.name || '-'} · {item.brand?.name || '-'}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductCreateExistingModelsPanel;
