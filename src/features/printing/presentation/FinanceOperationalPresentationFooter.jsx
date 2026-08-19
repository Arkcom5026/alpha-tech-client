import React from 'react';

const clean = (value) => String(value || '').trim();

const FinanceOperationalPresentationFooter = ({
  notes,
  customFooter,
  systemNotices = [],
  compact = false,
}) => {
  const normalizedNotes = clean(notes);
  const normalizedFooter = clean(customFooter);
  const notices = (Array.isArray(systemNotices) ? systemNotices : [])
    .map(clean)
    .filter(Boolean);

  if (!normalizedNotes && !normalizedFooter && notices.length === 0) return null;

  return (
    <footer
      data-testid="finance-operational-presentation-footer"
      className={compact ? 'space-y-1 text-[10px] leading-tight' : 'space-y-2 text-xs leading-tight'}
    >
      {normalizedNotes ? (
        <div data-testid="finance-operational-custom-notes" className="whitespace-pre-line">
          <b>หมายเหตุ:</b> {normalizedNotes}
        </div>
      ) : null}
      {normalizedFooter ? (
        <div data-testid="finance-operational-custom-footer" className="whitespace-pre-line">
          {normalizedFooter}
        </div>
      ) : null}
      {notices.length ? (
        <div
          data-testid="finance-operational-system-notice"
          className="border-t border-current pt-2 text-center"
        >
          {notices.map((notice, index) => <div key={`${index}-${notice}`}>{notice}</div>)}
        </div>
      ) : null}
    </footer>
  );
};

export default FinanceOperationalPresentationFooter;
