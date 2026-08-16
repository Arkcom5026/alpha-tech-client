const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.resolve(__dirname, '../src/features/tax/outputFilings/pages/SalesTaxFilingPage.jsx'), 'utf8');

const expectSource = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message || `Missing: ${needle}`);
};

expectSource('const mutationRef = useRef(false);', 'Sales filing must own mutations synchronously.');
expectSource('return { ok: true, batches: nextBatches, error: null };', 'Sales filing load must expose success outcome.');
expectSource('return { ok: false, batches: null, error: requestError };', 'Sales filing load must expose refresh failure.');
expectSource('const branchIdSnapshot = branchId;', 'Prepare must snapshot branch authority.');
expectSource('const yearSnapshot = year;', 'Prepare must snapshot filing year.');
expectSource('const monthSnapshot = month;', 'Prepare must snapshot filing month.');
expectSource('const batchIdSnapshot = pendingSubmit.id;', 'Submit must snapshot batch identity.');
expectSource('sales-tax-filing:prepare:refresh:error', 'Prepare refresh failure needs dedicated partial-success event.');
expectSource('sales-tax-filing:submit:refresh:error', 'Submit refresh failure needs dedicated partial-success event.');
expectSource('เตรียมชุดยื่นภาษีขายสำเร็จแล้ว แต่โหลดรายการล่าสุดไม่สำเร็จ', 'Prepare partial success must be explicit.');
expectSource('ยืนยันชุดยื่นภาษีขาย ${String(batchMonthSnapshot).padStart(2, \'0\')}/${batchYearSnapshot} สำเร็จแล้ว แต่โหลดรายการล่าสุดไม่สำเร็จ', 'Submit partial success must be explicit.');
expectSource('if (mutationRef.current || busy || !branchId) return;', 'Prepare must close same-tick duplicate window.');
expectSource('if (!pendingSubmit || mutationRef.current || busy) return;', 'Submit must close same-tick duplicate window.');
expectSource('if (!busy && !mutationRef.current) setPendingSubmit(null);', 'Confirm dialog must respect synchronous ownership.');

console.log('Sales Tax Filing Partial-Success Authority Contract: PASS');
