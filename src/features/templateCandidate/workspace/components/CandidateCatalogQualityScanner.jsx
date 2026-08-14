import React from 'react';

const SCAN_OPTIONS = [
  ['DUPLICATE', 'ค้นหาสินค้าต้นแบบที่อาจซ้ำ'],
  ['QUALITY', 'ตรวจคุณภาพข้อมูลสินค้า'],
  ['ORPHAN', 'ค้นหาสินค้าที่ไม่มีร้านอ้างอิง'],
];

const CandidateCatalogQualityScanner = ({
  businessType,
  busy,
  onScanDuplicates,
  onScanQuality,
  onScanOrphans,
  onRefresh,
}) => {
  const [templateBranchId, setTemplateBranchId] = React.useState('');
  const [scanType, setScanType] = React.useState('DUPLICATE');
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);

  const run = async (apply) => {
    if (!templateBranchId) return;
    setError(null);
    setResult(null);

    const payload = {
      templateBranchId: Number(templateBranchId),
      businessType,
      apply,
    };

    try {
      const action = scanType === 'ORPHAN'
        ? onScanOrphans
        : scanType === 'QUALITY'
          ? onScanQuality
          : onScanDuplicates;
      const response = await action(payload);
      setResult(response);
      if (apply) await onRefresh();
    } catch (scanError) {
      setError(scanError);
    }
  };

  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">Catalog Quality Scanner</p>
          <h2 className="mt-2 text-lg font-black text-slate-900">สแกน Template Catalog ของ {businessType}</h2>
          <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-600">
            Dry run ใช้ตรวจผลก่อน ส่วน Apply จะสร้าง Candidate เฉพาะรายการที่พบ โดยไม่แก้ Product ของร้านหรือธุรกรรมย้อนหลัง
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[180px_minmax(220px,1fr)_auto_auto]">
          <input
            type="number"
            min="1"
            value={templateBranchId}
            onChange={(event) => setTemplateBranchId(event.target.value)}
            placeholder="Template Branch ID"
            className="min-h-11 rounded-xl border border-emerald-200 bg-white px-3 text-sm font-bold text-slate-800"
          />
          <select
            value={scanType}
            onChange={(event) => setScanType(event.target.value)}
            className="min-h-11 rounded-xl border border-emerald-200 bg-white px-3 text-sm font-bold text-slate-800"
          >
            {SCAN_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy || !templateBranchId}
            onClick={() => run(false)}
            className="min-h-11 rounded-xl border border-emerald-300 bg-white px-4 text-sm font-black text-emerald-800 disabled:opacity-40"
          >
            Dry run
          </button>
          <button
            type="button"
            disabled={busy || !templateBranchId}
            onClick={() => run(true)}
            className="min-h-11 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white disabled:opacity-40"
          >
            สร้าง Candidate
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {error.message || String(error)}
        </p>
      )}

      {result && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4">
          <div className="flex flex-wrap gap-3 text-xs font-black text-slate-700">
            <span>Mode: {result.mode || '-'}</span>
            <span>Scanned: {result.scannedProductCount ?? result.total ?? result.items?.length ?? '-'}</span>
            <span>Candidate: {result.duplicatePairCount ?? result.candidateCount ?? result.items?.length ?? '-'}</span>
            <span>Created: {result.created?.length ?? '-'}</span>
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-black text-emerald-700">ดูผลการสแกน</summary>
            <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </section>
  );
};

export default CandidateCatalogQualityScanner;
