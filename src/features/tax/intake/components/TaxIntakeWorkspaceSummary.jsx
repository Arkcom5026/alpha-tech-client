import React from 'react';

const TaxIntakeWorkspaceSummary = ({ candidateCount = 0, documentCount = 0 }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">Business Document Candidates</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{candidateCount}</p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">Tax Documents</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{documentCount}</p>
    </div>
  </div>
);

export default TaxIntakeWorkspaceSummary;
