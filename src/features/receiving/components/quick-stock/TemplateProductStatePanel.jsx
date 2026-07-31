import React from "react";

const TemplateProductStatePanel = ({
  selectedTemplateProduct,
  runtimeStatus = "IDLE",
  onClearProduct,
}) => (
  <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="font-semibold text-amber-900">ยังไม่มี Operational Product ของร้าน</div>
        <div className="mt-1 text-amber-950 text-base font-bold truncate">
          {selectedTemplateProduct.name}
        </div>
        <div className="mt-2 text-xs text-amber-800 leading-relaxed">
          รายการนี้มาจาก Template Catalog (T01) ใช้สำหรับค้นหาและ Clone เท่านั้น
          จึงไม่แสดง/ไม่แก้ไขรายละเอียดสินค้าและราคาเดิมของร้านในส่วนนี้
        </div>
      </div>

      <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-white border border-amber-200 text-amber-700">
        {runtimeStatus === "LOADING" ? "LOADING" : "NOT CREATED"}
      </span>
    </div>

    <div className="rounded-xl border border-amber-200 bg-white/70 p-3 text-xs text-amber-900 space-y-1">
      <div>สถานะปัจจุบัน:</div>
      <div>สินค้านี้ยังเป็น Template เท่านั้น และยังไม่ใช่ Operational Product ของร้าน</div>
      <div className="pt-1">ก่อนรับเข้า Stock ต้องมีขั้นตอนถัดไป:</div>
      <div>✓ สร้างหรือ Clone Product เข้า Branch ปัจจุบัน</div>
      <div>✓ สร้าง/บันทึก BranchPrice ของร้าน</div>
      <div>✓ จากนั้นจึงรับสินค้าเข้า Stock Runtime ได้</div>
    </div>

    <button type="button" className="text-xs text-red-600 hover:underline" onClick={onClearProduct}>
      เปลี่ยนสินค้า
    </button>
  </section>
);

export default TemplateProductStatePanel;
