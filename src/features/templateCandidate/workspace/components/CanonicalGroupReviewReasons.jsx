const CanonicalGroupReviewReasons = ({ reasons = [] }) => {
  if (!reasons.length) return null;
  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">Review Reasons</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {reasons.map((reason) => <span key={reason} className="rounded-full bg-white px-3 py-1 text-xs font-black text-amber-800">{reason}</span>)}
      </div>
    </section>
  );
};

export default CanonicalGroupReviewReasons;
