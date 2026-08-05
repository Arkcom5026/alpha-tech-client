const StockDataChip = ({ label, value, onClick }) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      {...(onClick ? { type: 'button', onClick } : {})}
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 ${onClick ? 'transition hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2' : ''}`}
    >
      <span>{label}</span>
      <span className="font-semibold text-teal-800">{value}</span>
    </Component>
  );
};

export default StockDataChip;
