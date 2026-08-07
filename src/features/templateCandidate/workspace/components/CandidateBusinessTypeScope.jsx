const CandidateBusinessTypeScope = ({ options, businessType, hasBusinessType, onSelect }) => (
  <section className="rounded-3xl border border-orange-200 bg-orange-50/60 p-5 shadow-sm">
    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-600">Business Type Scope</p>
    <h2 className="mt-1 text-lg font-black text-slate-900">เลือกกลุ่มธุรกิจที่ต้องการดำเนินการ</h2>
    <div className="mt-4 flex flex-wrap gap-2">
      {options.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onSelect(item.value)}
          className={`min-h-11 rounded-2xl border px-4 text-sm font-black transition ${
            businessType === item.value
              ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
              : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
    {!hasBusinessType && (
      <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-slate-600">
        Queue จะยังไม่โหลดจนกว่าจะเลือกประเภทธุรกิจ เพื่อป้องกันการจัดการ Candidate ข้าม Catalog โดยไม่ตั้งใจ
      </p>
    )}
  </section>
);

export default CandidateBusinessTypeScope;
