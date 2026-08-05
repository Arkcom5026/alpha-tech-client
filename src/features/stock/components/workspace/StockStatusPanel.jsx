const TONES = {
  critical: { surface: 'border-rose-200 bg-rose-50', dot: 'bg-rose-500' },
  warning: { surface: 'border-amber-200 bg-amber-50', dot: 'bg-amber-500' },
  warn: { surface: 'border-amber-200 bg-amber-50', dot: 'bg-amber-500' },
  success: { surface: 'border-emerald-200 bg-emerald-50', dot: 'bg-emerald-500' },
  neutral: { surface: 'border-slate-200 bg-white', dot: 'bg-slate-400' },
};

const StockStatusPanel = ({ tone = 'neutral', title, description }) => {
  const resolvedTone = TONES[tone] || TONES.neutral;

  return (
    <section className={`rounded-2xl border p-5 ${resolvedTone.surface}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${resolvedTone.dot}`} aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
        </div>
      </div>
    </section>
  );
};

export default StockStatusPanel;
