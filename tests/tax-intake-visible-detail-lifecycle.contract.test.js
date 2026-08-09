import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/tax/intake/pages/TaxIntakeWorkspacePage.jsx');
const list = read('src/features/tax/intake/components/TaxIntakeDocumentList.jsx');

const detailIndex = page.indexOf('<TaxIntakeDocumentDetailPanel');
const listGridIndex = page.indexOf('xl:grid-cols-2');

describe('tax intake visible detail lifecycle contract', () => {
  it('renders selected document detail before the long candidate/document lists', () => {
    expect(detailIndex).toBeGreaterThan(-1);
    expect(listGridIndex).toBeGreaterThan(-1);
    expect(detailIndex).toBeLessThan(listGridIndex);
    expect(page).toContain('{selectedDocument && (');
  });

  it('passes selected document identity into the document list', () => {
    expect(page).toContain('selectedDocumentId={selectedDocument?.id || null}');
  });

  it('visually marks the selected tax document row', () => {
    expect(list).toContain('aria-pressed={selected}');
    expect(list).toContain("String(item.id) === String(selectedDocumentId || '')");
    expect(list).toContain('bg-blue-50');
  });
});
