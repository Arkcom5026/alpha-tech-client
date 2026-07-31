import React from 'react';
import { FileSearch } from 'lucide-react';
import TaxIntakeReconciliationCard from './TaxIntakeReconciliationCard';
import {
  formatTaxIntakeDateTime,
  formatTaxIntakeMoney,
  getTaxIntakeBadgeClass,
  taxDocumentLifecycleActions,
} from '../presentation/taxIntakePresentation';

const DetailMetric = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-black">{value}</p>
  </div>
);

const TaxIntakeDocumentDetailPanel = ({
  document,
  transitioning,
  transitionError,
  onTransition,
}) => {
  if (!document) return null;

  const actions = taxDocumentLifecycleActions[document.status] || [];
  const reconciliation = document.inputTaxReconciliation;
  const approvalBlocked = Boolean(reconciliation && !reconciliation.canApprove);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSearch size={18} className="text-blue-600" />
          <div>
            <h2 className="font-black text-slate-900">
              รายละเอียดเอกสาร {document.documentNumber}
            </h2>
            <p className="text-xs text-slate-500">
              {document.documentType} · {formatTaxIntakeDateTime(document.occurredAt)}
            </p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${getTaxIntakeBadgeClass(document.status)}`}>
          {document.status}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <DetailMetric label="ยอดก่อน VAT" value={formatTaxIntakeMoney(document.subtotalAmount)} />
        <DetailMetric label="VAT" value={formatTaxIntakeMoney(document.vatAmount ?? document.taxAmount)} />
        <DetailMetric label="ยอดรวม" value={formatTaxIntakeMoney(document.totalAmount)} />
      </div>

      <TaxIntakeReconciliationCard reconciliation={reconciliation} />

      {transitionError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-black">{transitionError.message}</p>
          {transitionError.details && (
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs">
              {JSON.stringify(transitionError.details, null, 2)}
            </pre>
          )}
        </div>
      )}

      {approvalBlocked && actions.some((action) => action.status === 'APPROVED') && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          ต้องตรวจสอบและปรับยอดที่ผูกให้ตรงกับใบกำกับภาษีก่อนอนุมัติเอกสาร
        </div>
      )}

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const disabled = transitioning || (action.status === 'APPROVED' && approvalBlocked);

            return (
              <button
                key={action.status}
                type="button"
                onClick={() => onTransition(action.status)}
                disabled={disabled}
                className={action.primary
                  ? 'rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50'
                  : 'rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50'}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaxIntakeDocumentDetailPanel;
