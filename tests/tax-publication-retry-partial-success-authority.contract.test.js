import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(__dirname, '../src/features/tax/publicationRetry/pages/TaxPublicationRetryPage.jsx');
const source = fs.readFileSync(sourcePath, 'utf8');

const expectSource = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

expectSource('const mutationRef = useRef(false);', 'publication retry must own mutations synchronously');
expectSource('if (busy || mutationRef.current) return false;', 'retry mutations must reject same-tick duplicate commands');
expectSource('const saleIdSnapshot = Number(saleId);', 'single-sale retry must snapshot sale identity before persistence');
expectSource("const command = { limit: 500 };", 'retry-all must snapshot its server command');
expectSource('return { ok: false, error: requestError, message };', 'gap refresh must expose an observable failure result');
expectSource('const refresh = await load({ reportError: false });', 'post-success reconciliation must inspect refresh outcome');
expectSource('ส่งรายการขายเข้าทะเบียนภาษีสำเร็จแล้ว แต่รีเฟรชรายการตกหล่นล่าสุดไม่สำเร็จ', 'single retry needs partial-success feedback');
expectSource('tax-publication-retry:all:refresh:error', 'retry-all needs a dedicated refresh-after-success event');
expectSource('mutationRef.current = false;', 'mutation ownership must be released after the whole lifecycle');

console.log('Tax Publication Retry Partial-Success Authority Contract: PASS');
