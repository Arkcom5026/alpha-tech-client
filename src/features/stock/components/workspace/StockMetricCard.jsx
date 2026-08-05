const TONES = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  blue: 'border-blue-200 bg-blue-50 text-blue-800',
  rose: 'border-rose-200 bg-rose-50 text-rose-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
};

const StockMetricCard = ({ label, value, tone = 'neutral', hint, onClick }) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      {...(onClick ? { type: 'button', onClick } : {})}
      className={`w-full rounded-2xl border p-4 text-left ${TONES[tone] || TONES.neutral} ${onClick ? 'transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2' : ''}`}
    >
      <p className="text-xs font-semibold">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      {hint && <p className="mt-2 text-xs leading-5 text-slate-600">{hint}</p>}
    </Component>
  );
};

export default StockMetricCard;
