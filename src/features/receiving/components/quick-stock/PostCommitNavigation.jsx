import React from "react";

const PostCommitNavigation = ({ selectedProduct, onResetQueue }) => {
  if (!selectedProduct?.id) return null;

  const productDetailHref = `/pos/stock/products/view/${selectedProduct.id}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
      <div className="text-xs text-slate-600">ทางเลือกหลังจบรอบนี้</div>
      <div className="flex flex-wrap gap-2">
        <a className="text-xs rounded-lg border bg-white px-3 py-1.5 hover:bg-slate-100" href={productDetailHref}>
          เปิดรายละเอียดสินค้า
        </a>
        <a className="text-xs rounded-lg border bg-white px-3 py-1.5 hover:bg-slate-100" href="/pos/stock/products">
          ไป Product List
        </a>
        <button type="button" className="text-xs rounded-lg border bg-white px-3 py-1.5 hover:bg-slate-100" onClick={onResetQueue}>
          เริ่มรอบถัดไป
        </button>
      </div>
    </div>
  );
};

export default PostCommitNavigation;
