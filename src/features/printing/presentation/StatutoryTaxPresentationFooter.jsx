import React from 'react';

const StatutoryTaxPresentationFooter = ({ notes, customFooter, compact = false }) => {
  const normalizedNotes = String(notes || '').trim();
  const normalizedFooter = String(customFooter || '').trim();
  if (!normalizedNotes && !normalizedFooter) return null;

  return (
    <div
      data-testid="statutory-tax-presentation-footer"
      className={compact ? 'space-y-1 text-[10px] leading-tight' : 'space-y-1 text-[11px] leading-tight'}
    >
      {normalizedNotes ? <p className="whitespace-pre-line"><b>หมายเหตุ:</b> {normalizedNotes}</p> : null}
      {normalizedFooter ? <p className="whitespace-pre-line">{normalizedFooter}</p> : null}
    </div>
  );
};

export default StatutoryTaxPresentationFooter;
