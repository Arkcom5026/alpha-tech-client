import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = [
  'src/features/sales/create/pages/CreateSalePage.jsx',
  'src/features/sales/create/components/CustomerSection.jsx',
  'src/features/sales/create/components/PaymentSection.jsx',
  'src/features/sales/create/components/SaleItemTable.jsx',
];

const legacyImport = "import useSalesStore from '@/features/sales/store/salesStore';";
const createImport = "import useSaleCreateStore from '@/features/sales/create/store/saleCreateStore';";
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const write = (relative, content) => fs.writeFileSync(path.join(root, relative), content, 'utf8');

const staged = new Map(targets.map((relative) => [relative, read(relative)]));

for (const relative of targets) {
  let content = staged.get(relative);
  if (content.includes(legacyImport)) content = content.replace(legacyImport, createImport);
  else if (!content.includes(createImport)) throw new Error(`Sales store import not found in ${relative}`);
  content = content.replaceAll('useSalesStore()', 'useSaleCreateStore()');
  staged.set(relative, content);
}

const pagePath = 'src/features/sales/create/pages/CreateSalePage.jsx';
let page = staged.get(pagePath);

const lotRejectionPattern = /\s*if \(foundItem\.kind === 'LOT' \|\| foundItem\.simpleLotId \|\| !foundItem\.id \|\| !foundItem\.barcode\) \{[\s\S]*?\n\s*\}\r?\n\r?\n/;
if (lotRejectionPattern.test(page)) page = page.replace(lotRejectionPattern, '\n');

const legacyDuplicate = "      const duplicated = saleItemKeySet.has(`SID:${String(foundItem.id)}`) || (foundItem.barcode && saleItemKeySet.has(`BC:${String(foundItem.barcode).trim()}`));";
const mixedDuplicate = "      const foundLineType = (foundItem.kind === 'LOT' || foundItem.simpleLotId || foundItem.product?.mode === 'SIMPLE') ? 'SIMPLE' : 'STOCK_ITEM';\n      const foundProductId = Number(foundItem.productId ?? foundItem.product?.id ?? foundItem.simpleLot?.productId ?? 0) || null;\n      const foundStockItemId = foundLineType === 'STOCK_ITEM' ? Number(foundItem.stockItemId ?? foundItem.id ?? foundItem.stockItem?.id ?? 0) || null : null;\n      const foundSimpleLotId = foundLineType === 'SIMPLE' ? Number(foundItem.simpleLotId ?? foundItem.simpleLot?.id ?? foundItem.id ?? 0) || null : null;\n      const foundLineId = foundLineType === 'STOCK_ITEM'\n        ? `stock-${foundStockItemId}`\n        : foundSimpleLotId\n          ? `simple-${foundProductId}-lot-${foundSimpleLotId}`\n          : `simple-${foundProductId}`;\n      const duplicated = saleItemKeySet.has(`LINE:${foundLineId}`) || (foundItem.barcode && saleItemKeySet.has(`BC:${String(foundItem.barcode).trim()}`));";
if (page.includes(legacyDuplicate)) page = page.replace(legacyDuplicate, mixedDuplicate);
else if (!page.includes('const foundLineId = foundLineType')) throw new Error('Expected source not found: duplicate detection');

const legacyPrepared = /      const preparedItem = \{\r?\n        stockItemId: foundItem\.id,[\s\S]*?        billShare: 0,\r?\n      \};/;
const mixedPrepared = "      const selectedPrice = Number(foundItem.prices?.[selectedPriceType] ?? foundItem.price ?? foundItem.product?.prices?.[selectedPriceType] ?? 0) || 0;\n      const preparedItem = {\n        lineId: foundLineId,\n        lineType: foundLineType,\n        stockItemId: foundStockItemId,\n        productId: foundProductId,\n        simpleLotId: foundSimpleLotId,\n        quantity: 1,\n        unitPrice: selectedPrice,\n        barcode: foundItem.barcode || foundItem.simpleLot?.barcode || '',\n        productName: foundItem.product?.name || foundItem.productName || '',\n        model: foundItem.product?.model || foundItem.model || '',\n        kind: foundItem.kind || (foundLineType === 'SIMPLE' ? 'LOT' : 'SN'),\n        price: selectedPrice,\n        originalPrice: selectedPrice,\n        sellingPrice: selectedPrice,\n        discount: 0,\n        discountWithoutBill: 0,\n        billShare: 0,\n      };";
if (legacyPrepared.test(page)) page = page.replace(legacyPrepared, mixedPrepared);
else if (!page.includes('lineId: foundLineId')) throw new Error('Expected source not found: prepared cart item');

if (!page.includes('s.add(`LINE:${String(lineId)}`)')) {
  const keyPattern = /       const sid = it\?\.stockItemId;\r?\n       const bc = it\?\.barcode;\r?\n       if \(sid != null\) s\.add\(`SID:\$\{String\(sid\)\}`\);/;
  if (!keyPattern.test(page)) throw new Error('Expected source not found: sale item key set');
  page = page.replace(keyPattern, "       const lineId = it?.lineId || (it?.stockItemId ? `stock-${it.stockItemId}` : null);\n       const sid = it?.stockItemId;\n       const bc = it?.barcode;\n       if (lineId) s.add(`LINE:${String(lineId)}`);\n       if (sid != null) s.add(`SID:${String(sid)}`);");
}

staged.set(pagePath, page);
for (const [relative, content] of staged) write(relative, content);
console.log('Mixed sale runtime wiring applied successfully.');
