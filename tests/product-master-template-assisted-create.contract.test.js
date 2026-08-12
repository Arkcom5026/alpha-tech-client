import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const read = (relativePath) => fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8');

const pageSource = read('src/features/product/create/pages/CreateProductPage.jsx');
const assistantSource = read('src/features/product/create/components/ProductCreateTemplateAssistantPanel.jsx');
const hookSource = read('src/features/product/create/hooks/useProductCreateTemplateAssistant.js');
const editPageSource = read('src/features/product/pages/EditProductPage.jsx');
const runtimeControllerSource = read('src/features/product/create/hooks/useProductCreateRuntimeController.js');
const productApiSource = read('src/features/product/api/productApi.js');

assert.match(pageSource, /ProductCreateTemplateAssistantPanel/);
assert.match(pageSource, /useProductCreateTemplateAssistant/);
assert.match(pageSource, /preflight=\{templateAssistant\.preflight\}/);
assert.match(pageSource, /onOpenExistingProduct=\{templateAssistant\.openExistingProduct\}/);
assert.match(pageSource, /หรือสร้าง Product เอง/);
assert.match(pageSource, /<ProductCreateSubmitBar/);

assert.match(assistantSource, /ใช้ Template ช่วยสร้างสินค้า/);
assert.match(assistantSource, /ตรวจสอบกับสินค้าในร้านก่อนสร้าง/);
assert.match(assistantSource, /มี Product ที่สร้างจาก Template นี้อยู่ในร้านแล้ว/);
assert.match(assistantSource, /พบสินค้าในร้านที่อาจซ้ำหรือใกล้เคียง/);
assert.match(assistantSource, /ความคล้ายกันไม่ใช่การผูกข้อมูลอัตโนมัติ/);
assert.match(assistantSource, /ใช้ Template นี้/);

assert.match(hookSource, /searchTemplateProducts/);
assert.match(hookSource, /getProductsForPos/);
assert.match(hookSource, /buildOperationalSearchTerms/);
assert.match(hookSource, /replace\(\/\\\(\[\^\)\]\*\\\)\/g/);
assert.match(hookSource, /name\.match\(\/\[A-Za-z0-9\]/);
assert.match(hookSource, /DUPLICATE_SEARCH_NOISE_TOKENS/);
assert.match(hookSource, /const searches = searchTerms\.map/);
assert.match(hookSource, /scorePotentialDuplicate/);
assert.match(hookSource, /Number\(product\?\.templateProductId\) === templateProductId/);
assert.match(hookSource, /potentialDuplicates/);
assert.match(hookSource, /if \(!preflight\.checked \|\| preflight\.checking\)/);
assert.match(hookSource, /createOperationalProductFromTemplateApi/);
assert.match(hookSource, /useLocation/);
assert.match(hookSource, /buildStoreScopedPath/);
assert.match(hookSource, /currentPath\.indexOf\('\/pos\/'\)/);
assert.match(hookSource, /buildStoreScopedPath\(location\.pathname, `\/pos\/stock\/products\/edit\/\$\{product\.id\}`\)/);
assert.match(hookSource, /buildStoreScopedPath\(location\.pathname, `\/pos\/stock\/products\/edit\/\$\{productId\}`\)/);
assert.match(hookSource, /clonedProductSnapshot:\s*product/);
assert.doesNotMatch(hookSource, /quick-stock|QuickStock|quickStock/);

assert.match(editPageSource, /useLocation/);
assert.match(editPageSource, /location\.state\?\.clonedProductSnapshot/);
assert.match(editPageSource, /Number\(snapshot\?\.id\) === Number\(id\)/);
assert.match(editPageSource, /normalizeProductForEdit\(snapshot\)/);
assert.match(editPageSource, /setProduct\(normalizedSnapshot\)/);
assert.match(editPageSource, /fetchedProductIdRef\.current === String\(id\)/);
assert.match(editPageSource, /const data = await getProductById\(id\)/);
assert.match(editPageSource, /setProduct\(normalized\)/);

assert.match(runtimeControllerSource, /createLocalOperationalProductCreateApi/);
assert.match(runtimeControllerSource, /const response = await createLocalOperationalProductCreateApi\(payload\)/);

assert.match(productApiSource, /apiClient\.get\('products\/pos\/search'/);
assert.match(productApiSource, /apiClient\.get\('products\/template\/search'/);
assert.match(productApiSource, /apiClient\.post\('products\/pos\/create-from-template'/);

console.log('Product Master Template-assisted Create Contract: PASS');
