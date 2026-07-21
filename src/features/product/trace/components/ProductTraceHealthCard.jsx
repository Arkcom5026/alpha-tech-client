import React from 'react';
import { buildProductTraceHealth } from '../utils/productTraceHealth';

const ProductTraceHealthCard = ({
  identity,
  returns = [],
  claims = [],
  repairs = [],
}) => {
  const health = buildProductTraceHealth({
    identity,
    returns,
    claims,
    repairs,
  });

  const stars =
    health.level === 'HEALTHY'
      ? 5
      : health.level === 'WATCH'
        ? 3
        : 1;

  return (
    <section className={`rounded-2xl border p-5 shadow-sm ${health.className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">
            Product Health
          </p>
          <h3 className="mt-1 text-lg font-black">{health.label}</h3>
          <div className="mt-2 tracking-[0.18em]">
            {'★'.repeat(stars)}
            <span className="opacity-25">{'★'.repeat(5 - stars)}</span>
          </div>
          <p className="mt-2 text-sm opacity-80">{health.description}</p>
        </div>
        <div className="rounded-full border border-current/20 bg-white/70 px-3 py-1 text-xs font-black">
          {health.level}
        </div>
      </div>
    </section>
  );
};

export default ProductTraceHealthCard;
