import React from 'react';
import { buildProductTraceRisk } from '../utils/productTraceInsights';

const ProductTraceRiskCard = ({
  identity,
  returns = [],
  claims = [],
  repairs = [],
  timeline = [],
}) => {
  const risk = buildProductTraceRisk({
    identity,
    returns,
    claims,
    repairs,
    timeline,
  });

  const stars =
    risk.level === 'LOW'
      ? 5
      : risk.level === 'MEDIUM'
        ? 3
        : 1;

  return (
    <section className={`rounded-2xl border p-5 shadow-sm ${risk.className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">
            Risk Level
          </p>
          <h3 className="mt-1 text-lg font-black">{risk.label}</h3>
          <div className="mt-2 tracking-[0.18em]">
            {'★'.repeat(stars)}
            <span className="opacity-25">{'★'.repeat(5 - stars)}</span>
          </div>
          <p className="mt-2 text-sm opacity-80">{risk.description}</p>
        </div>
        <div className="rounded-full border border-current/20 bg-white/70 px-3 py-1 text-xs font-black">
          {risk.level}
        </div>
      </div>
    </section>
  );
};

export default ProductTraceRiskCard;
