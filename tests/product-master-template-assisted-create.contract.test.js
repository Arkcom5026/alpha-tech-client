const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (relativePath) => fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8');

const pageSource = read('src/features/product/create/pages/CreateProductPage.jsx');
const assistantSource = read('src/features/product/create/components/ProductCreateTemplateAssistantPanel.jsx');
const hookSource = read('src/features/product/create/hooks/useProductCreateTemplateAssistant.js');
const runtimeControllerSource = read('src/features/product/create/hooks/useProductCreateRuntimeController.js');
const productApiSource = read('src/features/product/api/productApi.js');

assert.match(pageSource, /ProductCreateTemplateAssistantPanel/);
assert.match(pageSource, /useProductCreateTemplateAssistant/);
assert.match(pageSource, /หรือสร้าง Product เอง/);
assert.match(pageSource, /<ProductCreateSubmitBar/);

assert.match(assistantSource, /ใช้ Template ช่วยสร้างสินค้า/);
assert.match(assistantSource, /ตัวเลือกเสริมสำหรับลดงานกรอกข้อมูล/);
assert.match(assistantSource, /ใช้ Template นี้/);
assert.match(assistantSource, /Review\/Edit/);

assert.match(hookSource, /searchTemplateProducts/);
assert.match(hookSource, /createOperationalProductFromTemplateApi/);
assert.match(hookSource, /templateProductId:\s*productTypeId/);
assert.match(hookSource, /navigate\(`\/pos\/stock\/products\/edit\/\$\{product\.id\}`/);
assert.doesNotMatch(hookSource, /quick-stock|QuickStock|quickStock/);

assert.match(runtimeControllerSource, /createLocalOperationalProductCreateApi/);
assert.match(runtimeControllerSource, /const response = await createLocalOperationalProductCreateApi\(payload\)/);

assert.match(productApiSource, /apiClient\.get\('products\/template\/search'/);
assert.match(productApiSource, /apiClient\.post\('products\/pos\/create-from-template'/);

console.log('Product Master Template-assisted Create Contract: PASS');
