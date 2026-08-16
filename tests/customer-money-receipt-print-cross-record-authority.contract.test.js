const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.join(process.cwd(), 'src/features/customerMoneyReceive/pages/CustomerMoneyReceiptPrintPage.jsx'),
  'utf8',
);

const required = [
  'const loadRequestRef = useRef(0);',
  'const recordContextRef = useRef(String(id || \'\'));',
  'recordContextRef.current = recordIdSnapshot;',
  'autoPrinted.current = false;',
  'setRecord(null);',
  'setError(\'\');',
  'const requestId = ++loadRequestRef.current;',
  'if (loadRequestRef.current !== requestId || recordContextRef.current !== recordIdSnapshot) return;',
  'customer-money-receive:print:${recordIdSnapshot}:load:error',
  'loadRequestRef.current += 1;',
  "if (String(record.id || '') !== String(id || '')) return;",
];

for (const token of required) {
  if (!source.includes(token)) {
    throw new Error(`Missing print cross-record authority contract token: ${token}`);
  }
}

if (!source.includes('[autoPrint, record, error, id]')) {
  throw new Error('Auto-print effect must be keyed to the current receipt id.');
}

console.log('Customer Money Receipt print cross-record authority contract: PASS');
