import React from 'react';

const PurchaseInsightPlaceholder = ({ title, description }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
    <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
  </div>
);

export default PurchaseInsightPlaceholder;
