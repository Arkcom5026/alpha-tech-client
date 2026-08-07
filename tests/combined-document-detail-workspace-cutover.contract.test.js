import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('combined document detail workspace cutover contract', () => {
  const page = read('src/features/combinedBilling/pages/CombinedDocumentDetailPage.jsx');
  const toolbar = read('src/features/combinedBilling/detail/workspace/components/CombinedDocumentToolbar.jsx');
  const shell = read('src/features/combinedBilling/detail/workspace/components/CombinedDocumentInvoiceShell.jsx');
  const state = read('src/features/combinedBilling/detail/workspace/components/CombinedDocumentState.jsx');
  const presentation = `${toolbar}\n${shell}\n${state}`;

  it('composes document detail presentation from workspace owners', () => {
    expect(page).toContain('CombinedDocumentState');
    expect(page).toContain('CombinedDocumentToolbar');
    expect(page).toContain('CombinedDocumentInvoiceShell');
    expect(page).toContain('<CombinedDocumentToolbar onBack={handleBack} onPrint={handlePrint} />');
    expect(page).toContain('<CombinedDocumentInvoiceShell documentDetail={documentDetail} customer={customer} />');
  });

  it('keeps route, store, and browser-print authority in the page', () => {
    expect(page).toContain('useParams');
    expect(page).toContain('useNavigate');
    expect(page).toContain('useCombinedBillingStore');
    expect(page).toContain('fetchDocumentById(id)');
    expect(page).toContain("navigate('/billing/combine')");
    expect(page).toContain('window.print()');
  });

  it('keeps workspace presentation free of runtime authority', () => {
    expect(presentation).not.toContain('useCombinedBillingStore');
    expect(presentation).not.toContain('fetchDocumentById');
    expect(presentation).not.toContain('react-router-dom');
    expect(presentation).not.toContain('useParams');
    expect(presentation).not.toContain('useNavigate');
    expect(presentation).not.toContain('window.print');
  });

  it('preserves state, navigation, print, and invoice intents through props', () => {
    expect(page).toContain('<CombinedDocumentState status="error" message={errorDetail.message} />');
    expect(toolbar).toContain('onClick={onBack}');
    expect(toolbar).toContain('onClick={onPrint}');
    expect(shell).toContain('documentDetail');
    expect(shell).toContain('customer');
  });
});
