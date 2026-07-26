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

const replaceRequired = (content, before, after, label) => {
  if (!content.includes(before)) {
    throw new Error(`Expected source not found: ${label}`);
  }
  return content.replace(before, after);
};

for (const relative of targets) {
  let content = read(relative);
  if (content.includes(legacyImport)) {
    content = content.replace(legacyImport, createImport);
  } else if (!content.includes(createImport)) {
    throw new Error(`Sales store import not found in ${relative}`);
  }
  content = content.replaceAll('useSalesStore()', 'useSaleCreateStore()');
  write(relative, content);
}

const pagePath = 'src/features/sales/create/pages/CreateSalePage.jsx';
let page = read(pagePath);

page = replaceRequired(
  page,
  "      if (foundItem.kind === 'LOT' || foundItem.simpleLotId || !foundItem.id || !foundItem.barcode) {\n        setBarcodeError('❌ สินค้าประเภทจำนวน/LOT ยังไม่รองรับในหน้าขายนี้ กรุณาใช้สินค้าที่มี SN ก่อน');\n        e.target.value = '';\n        barcodeInputRef.current?.focus();\n        return;\n      }\n\n",
  '',
  'legacy LOT rejection block'
);

page = replaceRequired(
  page,
  "      const duplicated = saleItemKeySet.has(`SID:${String(foundItem.id)}`) || (foundItem.barcode && saleItemKeySet.has(`BC:${String(foundItem.barcode).trim()}`));",
  "      const foundLineType = (foundItem.kind === 'LOT' || foundItem.simpleLotId || foundItem.product?.mode === 'SIMPLE') ? 'SIMPLE' : 'STOCK_ITEM';\n      const foundProductId = Number(foundItem.productId ?? foundItem.product?.id ?? foundItem.simpleLot?.productId ?? 0) || null;\n      const foundStockItemId = foundLineType === 'STOCK_ITEM' ? Number(foundItem.stockItemId ?? foundItem.id ?? foundItem.stockItem?.id ?? 0) || null : null;\n      const foundSimpleLotId = foundLineType === 'SIMPLE' ? Number(foundItem.simpleLotId ?? foundItem.simpleLot?.id ?? foundItem.id ?? 0) || null : null;\n      const foundLineId = foundLineType === 'STOCK_ITEM'\n        ? `stock-${foundStockItemId}`\n        : foundSimpleLotId\n          ? `simple-${foundProductId}-lot-${foundSimpleLotId}`\n          : `simple-${foundProductId}`;\n      const duplicated = saleItemKeySet.has(`LINE:${foundLineId}`) || (foundItem.barcode && saleItemKeySet.has(`BC:${String(foundItem.barcode).trim()}`));",
  'duplicate detection'
);

page = replaceRequired(
  page,
  "      const preparedItem = {\n        stockItemId: foundItem.id,\n        barcode: foundItem.barcode,\n        productName: foundItem.product?.name || '',\n        model: foundItem.product?.model || '',\n        price: foundItem.prices?.[selectedPriceType] || 0,\n        originalPrice: foundItem.prices?.[selectedPriceType] || 0,\n        sellingPrice: foundItem.prices?.[selectedPriceType] || 0,\n        discount: 0,\n        discountWithoutBill: 0,\n        billShare: 0,\n      };",
  "      const selectedPrice = Number(foundItem.prices?.[selectedPriceType] ?? foundItem.price ?? foundItem.product?.prices?.[selectedPriceType] ?? 0) || 0;\n      const preparedItem = {\n        lineId: foundLineId,\n        lineType: foundLineType,\n        stockItemId: foundStockItemId,\n        productId: foundProductId,\n        simpleLotId: foundSimpleLotId,\n        quantity: foundLineType === 'SIMPLE' ? 1 : 1,\n        unitPrice: selectedPrice,\n        barcode: foundItem.barcode || foundItem.simpleLot?.barcode || '',\n        productName: foundItem.product?.name || foundItem.productName || '',\n        model: foundItem.product?.model || foundItem.model || '',\n        kind: foundItem.kind || (foundLineType === 'SIMPLE' ? 'LOT' : 'SN'),\n        price: selectedPrice,\n        originalPrice: selectedPrice,\n        sellingPrice: selectedPrice,\n        discount: 0,\n        discountWithoutBill: 0,\n        billShare: 0,\n      };",
  'prepared cart item'
);

page = page.replace(
  "       const sid = it?.stockItemId;\n       const bc = it?.barcode;\n       if (sid != null) s.add(`SID:${String(sid)}`);",
  "       const lineId = it?.lineId || (it?.stockItemId ? `stock-${it.stockItemId}` : null);\n       const sid = it?.stockItemId;\n       const bc = it?.barcode;\n       if (lineId) s.add(`LINE:${String(lineId)}`);\n       if (sid != null) s.add(`SID:${String(sid)}`);"
);

write(pagePath, page);

console.log('Mixed sale runtime wiring applied successfully.');
