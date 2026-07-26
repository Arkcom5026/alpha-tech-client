import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pagePath = path.join(root, 'src/features/sales/create/pages/CreateSalePage.jsx');
const source = fs.readFileSync(pagePath, 'utf8');
let next = source;

const legacySimpleLot = "      const foundSimpleLotId = foundLineType === 'SIMPLE' ? Number(foundItem.simpleLotId ?? foundItem.simpleLot?.id ?? foundItem.id ?? 0) || null : null;";
const resolvedSimpleLot = "      const foundSimpleLotId = foundLineType === 'SIMPLE'\n        ? Number(foundItem.simpleLotId ?? foundItem.simpleLot?.id ?? (foundItem.kind === 'LOT' ? foundItem.id : 0)) || null\n        : null;";

if (next.includes(legacySimpleLot)) {
  next = next.replace(legacySimpleLot, resolvedSimpleLot);
} else if (!next.includes("foundItem.kind === 'LOT' ? foundItem.id : 0")) {
  throw new Error('Expected SIMPLE lot identity source not found');
}

const legacyKind = "        kind: foundItem.kind || (foundLineType === 'SIMPLE' ? 'LOT' : 'SN'),";
const resolvedKind = "        kind: foundItem.kind || (foundLineType === 'SIMPLE' ? 'SIMPLE' : 'SN'),\n        inventoryBehavior: foundItem.inventoryBehavior || (foundLineType === 'SIMPLE' ? 'TRACKED' : 'TRACKED'),\n        qtyRemaining: foundItem.qtyRemaining ?? null,";

if (next.includes(legacyKind)) {
  next = next.replace(legacyKind, resolvedKind);
} else if (!next.includes('inventoryBehavior: foundItem.inventoryBehavior')) {
  throw new Error('Expected prepared item kind source not found');
}

if (next === source) {
  console.log('Sale catalog resolution already wired.');
} else {
  fs.writeFileSync(pagePath, next, 'utf8');
  console.log('Sale catalog resolution wired successfully.');
}
