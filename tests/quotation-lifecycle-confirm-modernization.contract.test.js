import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const pagePath = path.join(root, 'src/features/quotation/pages/QuotationPrintPage.jsx');
const source = fs.readFileSync(pagePath, 'utf8');

const expectContains = (token, message) => {
  if (!source.includes(token)) throw new Error(message || `Missing token: ${token}`);
};

if (/window\.confirm\s*\(/.test(source)) {
  throw new Error('Quotation lifecycle must not use native window.confirm');
}

expectContains('ConfirmActionDialog', 'Quotation lifecycle must use the canonical ConfirmActionDialog');
expectContains('pendingLifecycleAction', 'Quotation lifecycle confirmation must be state-driven');
expectContains('requestLifecycle', 'Quotation lifecycle buttons must request confirmation before execution');
expectContains('executeLifecycle', 'Quotation lifecycle execution must be separated from confirmation request');
expectContains("requestLifecycle('issue')", 'Issue action must use canonical confirmation');
expectContains("requestLifecycle('revision')", 'Revision action must use canonical confirmation');
expectContains("requestLifecycle('accept')", 'Accept action must use canonical confirmation');
expectContains("requestLifecycle('reject')", 'Reject action must use canonical confirmation');
expectContains("requestLifecycle('cancel')", 'Cancel action must use canonical confirmation');
expectContains("intent: 'destructive'", 'Destructive quotation lifecycle actions must use destructive dialog intent');
expectContains('loading={transitioning}', 'Confirmation dialog must reflect lifecycle transition loading state');

console.log('Quotation Lifecycle Confirm Modernization Contract: PASS');
