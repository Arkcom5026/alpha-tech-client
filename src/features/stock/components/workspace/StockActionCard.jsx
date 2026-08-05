import { ArrowRight } from 'lucide-react';
import StockWorkspaceButton from './StockWorkspaceButton';

const TONES = {
  critical: 'border-rose-200 bg-rose-50',
  warning: 'border-amber-200 bg-amber-50',
  warn: 'border-amber-200 bg-amber-50',
  neutral: 'border-slate-200 bg-white',
};

const StockActionCard = ({
  title,
  description,
  tone = 'neutral',
  actionLabel = 'เปิดดู',
  onAction,
  disabled = false,
}) => (
  <article className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${TONES[tone] || TONES.neutral}`}>
    <div className="min-w-0">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
    </div>
    <StockWorkspaceButton variant="secondary" onClick={onAction} disabled={disabled}>
      {actionLabel}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </StockWorkspaceButton>
  </article>
);

export default StockActionCard;
