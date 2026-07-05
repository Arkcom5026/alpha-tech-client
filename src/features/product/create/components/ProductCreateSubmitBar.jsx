// src/features/product/create/components/ProductCreateSubmitBar.jsx

const ProductCreateSubmitBar = ({
  disabled = false,
  loading = false,
  submitLabel = 'บันทึกสินค้า',
  onCancel,
}) => {
  return (
    <div className="sticky bottom-0 z-10 mt-6 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">พร้อมบันทึกสินค้า</div>
          <div className="text-xs text-slate-500">
            ตรวจสอบประเภทสินค้า แบรนด์ หน่วยนับ และราคาก่อนบันทึก
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ยกเลิก
            </button>
          ) : null}

          <button
            type="submit"
            disabled={disabled || loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'กำลังบันทึก...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCreateSubmitBar;
