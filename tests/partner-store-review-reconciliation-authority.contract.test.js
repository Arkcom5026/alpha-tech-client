import fs from 'node:fs';
import path from 'node:path';

const sourcePath = path.resolve('src/features/partnerStoreApplication/pages/PartnerStoreApplicationReviewPage.jsx');
const source = fs.readFileSync(sourcePath, 'utf8');

const expectSource = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

expectSource('const loadRequestRef = useRef(0);', 'review page must sequence async list loads');
expectSource('const statusRef = useRef(status);', 'review page must bind list results to the active status filter');
expectSource('return { ok: false, stale: true };', 'stale filter responses must be observable and ignored');
expectSource('const applicationIdSnapshot = item.id;', 'review mutations must snapshot application identity');
expectSource('const authorityKey = `${eventKey}:${applicationIdSnapshot}`;', 'feedback events must be entity-scoped');
expectSource("load({ reportError: false, statusSnapshot })", 'post-mutation refresh must have an observable reconciliation result');
expectSource('`${authorityKey}:refresh:error`', 'post-success refresh failure must use a partial-success event');
expectSource('const reviewNoteSnapshot = String(notes[applicationIdSnapshot] || \'\').trim();', 'approval/rejection note must be snapshotted before persistence');
expectSource('mutationLockRef.current || pendingActionLockRef.current', 'render controls must respect synchronous interaction authority');

console.log('Partner Store Review Reconciliation Authority Contract: PASS');
