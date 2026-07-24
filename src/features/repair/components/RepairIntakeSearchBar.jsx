import React from 'react';

const RepairIntakeSearchBar = ({ value, loading, onChange, onSearch, onReset }) => {
  const submit = (event) => {
    event.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="text-sm font-black text-slate-800">บาร์โค้ด / หมายเลขซีเรียล</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="สแกนหรือกรอกข้อมูลสินค้า"
          className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-12 rounded-xl bg-blue-700 px-6 font-black text-white disabled:opacity-50"
        >
          {loading ? 'กำลังค้นหา' : 'ค้นหา'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-12 rounded-xl border border-slate-300 px-5 font-bold text-slate-700"
        >
          ล้าง
        </button>
      </div>
    </form>
  );
};

export default RepairIntakeSearchBar;
