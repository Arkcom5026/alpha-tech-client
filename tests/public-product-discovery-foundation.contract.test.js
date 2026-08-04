import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('src/features/storefront/pages/PublicStorefrontPage.jsx', 'utf8');

assert(source.includes('useSearchParams'));
assert(source.includes("searchParams.get('q')"));
assert(source.includes("searchParams.get('categoryId')"));
assert(source.includes("searchParams.get('brandId')"));
assert(source.includes("searchParams.get('sort')"));
assert(source.includes('facets.categories'));
assert(source.includes('facets.brands'));
assert(source.includes('ราคาต่ำไปสูง'));
assert(source.includes('หน้า {pagination.page} จาก {pagination.totalPages}'));
assert(source.includes('ล้างคำค้นและตัวกรอง'));

console.log('public product discovery foundation ui contract: PASS');
