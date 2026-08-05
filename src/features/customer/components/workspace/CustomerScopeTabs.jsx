const TABS = [
  { key: 'STORE', label: 'ลูกค้าของร้าน' },
  { key: 'UNASSIGNED', label: 'ลูกค้ากลางรอจัดสรร' },
];

const CustomerScopeTabs = ({ scope, onChange }) => (
  <div className="flex flex-wrap gap-2 border-b border-slate-200 p-3">
    {TABS.map((tab) => {
      const active = scope === tab.key;
      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
            active
              ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
              : 'border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100'
          }`}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);

export default CustomerScopeTabs;
