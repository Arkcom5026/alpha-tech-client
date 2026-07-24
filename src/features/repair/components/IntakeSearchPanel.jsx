import React from 'react';

const IntakeSearchPanel = ({ value, loading, onChange, onSearch, onReset }) => {
  const submit = (event) => {
    event.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-black text-slate-800">ค้นหาอุปกรณ์เพื่อเริ่มงานบริการ</p>
      <p className="mt-1 text-xs text-slate-500">
        ระบบจะค้นหาสินค้า ลูกค้า ประกัน งานซ่อม และงานเคลมที่เกี่ยวข้อง
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="บาร์โค้ด, Serial Number, IMEI หรือ Service Tag"
          className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-12 rounded-xl bg-blue-700 px-7 font-black text-white disabled:opacity-50"
        >
          {loading ? 'กำลังค้นหา' : 'ค้นหา'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-12 rounded-xl border border-slate-300 px-5 font-black text-slate-700"
        >
          ล้าง
        </button>
      </div>
    </form>
  );
};

export default IntakeSearchPanel;
