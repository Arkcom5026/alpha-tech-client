const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.join(process.cwd(), 'src/features/tax/inputFiling/pages/InputTaxFilingWorkspacePage.jsx'),
  'utf8',
);

const expectText = (text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

expectText('const mutationRef = useRef(false);', 'Input tax filing must keep synchronous mutation ownership.');
expectText("const load = useCallback(async ({ reportError = true } = {}) =>", 'Workspace load must expose an observable refresh outcome.');
expectText('return { ok: true, workspace: nextWorkspace };', 'Successful refresh must return an explicit success result.');
expectText("const branchIdSnapshot = branchId;", 'Mutation must snapshot branch authority before persistence.');
expectText("const taxPeriodIdSnapshot = taxPeriodId;", 'Mutation must snapshot tax-period authority before persistence.');
expectText(':refresh:error`', 'Post-success refresh failure must have a dedicated event identity.');
expectText('ดำเนินการภาษีซื้อสำเร็จแล้ว แต่รีเฟรชข้อมูลล่าสุดไม่สำเร็จ', 'Refresh failure after persistence must be reported as partial success.');
expectText('const readyDocumentIdsSnapshot = readyDocuments.map', 'Bulk select must snapshot the document command set before persistence.');
expectText('requestError.partialCompleted = completed;', 'Bulk select must preserve completed-count evidence when a later item fails.');
expectText(':partial:error`', 'Partial bulk completion must use a dedicated event identity.');
expectText('เพิ่มเอกสารเข้าชุดสำเร็จแล้ว ${completed} รายการ แต่รายการถัดไปไม่สำเร็จ', 'Partial bulk completion must tell the user how many items persisted.');
expectText('const reasonSnapshot = removalReason.trim();', 'Removal reason must be immutable once persistence begins.');

console.log('Input Tax Filing Partial-Success Authority Contract: PASS');
