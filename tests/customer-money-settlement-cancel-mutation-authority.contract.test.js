import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementDetailPage.jsx'),
  'utf8',
);

const requireMatch = (pattern, message) => {
  if (!pattern.test(source)) throw new Error(message);
};

requireMatch(
  /useRef, useState|useMemo, useRef, useState/,
  'settlement detail must import useRef for synchronous cancel ownership',
);
requireMatch(
  /const cancellingRef = useRef\(false\);/,
  'settlement cancellation must expose synchronous ownership',
);
requireMatch(
  /if \(!reason \|\| cancelling \|\| cancellingRef\.current \|\| !id\) return;/,
  'settlement cancellation must reject duplicate same-tick commands',
);
requireMatch(
  /const settlementIdSnapshot = id;[\s\S]*const reasonSnapshot = reason;/,
  'settlement cancellation must snapshot id and reason before persistence',
);
requireMatch(
  /cancelDeliveryCreditSettlement\(settlementIdSnapshot, reasonSnapshot\)/,
  'settlement cancellation must persist the immutable command snapshot',
);
requireMatch(
  /cancellingRef\.current = true;[\s\S]*finally \{[\s\S]*cancellingRef\.current = false;/,
  'settlement cancellation must own and release the synchronous boundary',
);
requireMatch(
  /disabled=\{cancelling\}[\s\S]*navigate\('\.\.'\)/,
  'navigation must be frozen while settlement cancellation is active',
);
requireMatch(
  /textarea disabled=\{cancelling\}/,
  'cancel reason must be frozen while the command is persisted',
);
requireMatch(
  /customer-money-settlement:cancel:\$\{settlementIdSnapshot\}:success/,
  'success feedback must be tied to the immutable settlement id',
);
requireMatch(
  /customer-money-settlement:cancel:\$\{settlementIdSnapshot\}:error/,
  'error feedback must be tied to the immutable settlement id',
);

console.log('Customer Money Settlement Cancel Mutation Authority Contract: PASS');
