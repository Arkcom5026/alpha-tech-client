import React from 'react';

const ProductTraceStatePanel = ({
  loading,
  searched,
  error,
  errorCode,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8 text-center">
        <div className="text-sm font-bold text-blue-700">กำลังโหลดประวัติสินค้า...</div>
        <div className="mt-2 text-xs text-blue-600">
          ระบบกำลังเชื่อมโยงข้อมูลรับเข้า การขาย การคืน เคลม และงานซ่อม
        </div>
      </div>
    );
  }

  if (error) {
    const notFound = errorCode === 'STOCK_ITEM_NOT_FOUND';

    return (
      <div
        className={`rounded-2xl border p-8 text-center ${
          notFound
            ? 'border-amber-200 bg-amber-50'
            : 'border-rose-200 bg-rose-50'
        }`}
      >
        <div
          className={`text-sm font-bold ${
            notFound ? 'text-amber-800' : 'text-rose-700'
          }`}
        >
          {error}
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl border border-current bg-white px-4 py-2 text-sm font-semibold"
        >
          ลองอีกครั้ง
        </button>
      </div>
    );
  }

  if (!searched) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h3 className="text-base font-bold text-slate-800">เริ่มค้นหาประวัติสินค้า</h3>
        <p className="mt-2 text-sm text-slate-500">
          สแกนบาร์โค้ดหรือกรอก Serial Number เพื่อเปิด Digital Passport ของสินค้า
        </p>
      </div>
    );
  }

  return null;
};

export default ProductTraceStatePanel;
