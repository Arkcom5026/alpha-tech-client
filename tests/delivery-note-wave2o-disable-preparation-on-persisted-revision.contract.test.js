import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const pagePath = path.resolve(
  currentDir,
  '../src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx',
);
const source = fs.readFileSync(pagePath, 'utf8');

describe('Delivery Note Wave 2O persisted revision preparation guard', () => {
  it('waits for current delivery-note authority before enabling legacy preparation', () => {
    expect(source).toContain('const preparationEnabled = !isConsolidated');
    expect(source).toContain('&& Boolean(currentSale)');
    expect(source).toContain('&& !persistedRevisionActive;');
  });

  it('does not call the preparation hook for a persisted current revision', () => {
    expect(source).toContain('saleId: preparationEnabled ? sourceId : null');
    expect(source).toContain('enabled: preparationEnabled');
  });

  it('does not render legacy preparation or replacement workspaces for a persisted revision', () => {
    expect(source).toContain('{preparationEnabled ? (');
    expect(source).toContain("const replacementEnabled = preparationEnabled && preparation?.status === 'LOCKED';");
    expect(source).toContain('const legacyEditorEnabled = preparationEnabled && !preparation;');
    expect(source).not.toContain('{!isConsolidated ? (\n        <DeliveryNotePreparationPanel');
  });
});
