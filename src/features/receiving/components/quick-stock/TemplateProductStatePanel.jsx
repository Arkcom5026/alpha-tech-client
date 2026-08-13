import React from "react";

const TemplateProductStatePanel = ({
  selectedTemplateProduct,
  runtimeStatus = "IDLE",
  onClearProduct,
}) => {
  const isMaterializing = runtimeStatus === "MATERIALIZING";

  return (
    <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-amber-900">
            {isMaterializing ? "กำลังเตรียมสินค้าในร้าน" : "กำลังรอ Operational Product ของร้าน"}
          </div>
          <div className="mt-1 text-amber-950 text-base font-bold truncate">
            {selectedTemplateProduct.name}
          </div>
          <div className="mt-2 text-xs text-amber-800 leading-relaxed">
            รายการนี้มาจาก Template Catalog ระบบ Quick Receipt จะ materialize เป็น Local Product
            ของร้านให้อัตโนมัติ โดยไม่ต้องยืนยันการ Clone แยกอีกขั้น
          </div>
        </div>

        <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-white border border-amber-200 text-amber-700">
          {isMaterializing ? "MATERIALIZING" : runtimeStatus}
        </span>
      </div>

      <div className="rounded-xl border border-amber-200 bg-white/70 p-3 text-xs text-amber-900 space-y-1">
        <div>ระบบกำลังดำเนินการ:</div>
        <div>✓ resolve หรือสร้าง Local Product ของสาขาจาก Template</div>
        <div>✓ ใช้ Product authority กลางเพื่อป้องกันการสร้างซ้ำ</div>
        <div>✓ เมื่อพร้อมแล้ว Quick Receipt จะทำงานต่อด้วย Local productId เท่านั้น</div>
      </div>

      <button type="button" className="text-xs text-red-600 hover:underline" onClick={onClearProduct}>
        เปลี่ยนสินค้า
      </button>
    </section>
  );
};

export default TemplateProductStatePanel;
