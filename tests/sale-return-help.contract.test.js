import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Sale Return Help contract', () => {
  const guidePath = 'docs/workflows/sale-return-operational-user-guide.md';
  const contentPath = 'src/features/sales/return/help/saleReturnHelpContent.js';
  const drawerPath = 'src/features/sales/return/help/SaleReturnHelpDrawer.jsx';
  const searchPagePath = 'src/features/sales/return/pages/ReturnSearchPage.jsx';
  const createPagePath = 'src/features/sales/return/pages/CreateReturnPage.jsx';

  test('operational guide exists and preserves the canonical Sale Return boundary', () => {
    const guide = read(guidePath);
    expect(guide).toContain('src/features/sales/return');
    expect(guide).toContain('Safe Retry');
    expect(guide).toContain('Credit Note');
    expect(guide).toContain('Tax');
  });

  test('module-owned help content covers the critical operator decisions', () => {
    const content = read(contentPath);
    [
      'SERIALIZED',
      'SIMPLE',
      'sourcePaymentItemId',
      'หัก',
      'command',
      'Credit Note',
      'Tax',
    ].forEach((token) => expect(content).toContain(token));
  });

  test('drawer consumes module-owned content and exposes a close boundary', () => {
    const drawer = read(drawerPath);
    expect(drawer).toContain("from './saleReturnHelpContent'");
    expect(drawer).toContain('onClose');
    expect(drawer).toContain('คู่มือคืนสินค้าและคืนเงิน');
  });

  test('both canonical runtime pages expose the Sale Return Help Drawer', () => {
    const searchPage = read(searchPagePath);
    const createPage = read(createPagePath);

    [searchPage, createPage].forEach((source) => {
      expect(source).toContain('SaleReturnHelpDrawer');
      expect(source).toContain('คู่มือ');
    });
  });

  test('help integration does not replace canonical API or completion workflow ownership', () => {
    const searchPage = read(searchPagePath);
    const createPage = read(createPagePath);

    expect(searchPage).toContain('getReturnableSales');
    expect(createPage).toContain('getSaleReturnEligibility');
    expect(createPage).toContain('runCompleteSaleReturn');
    expect(createPage).toContain('ยืนยันคืนสินค้าและคืนเงิน');
  });

  test('legacy top-level feature is not imported into canonical runtime pages', () => {
    const searchPage = read(searchPagePath);
    const createPage = read(createPagePath);

    expect(searchPage).not.toContain('@/features/saleReturn');
    expect(createPage).not.toContain('@/features/saleReturn');
  });
});
