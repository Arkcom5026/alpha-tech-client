import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pagePath = path.resolve('src/features/settings/pages/DocumentFormatSettingsPage.jsx');
const source = fs.readFileSync(pagePath, 'utf8');

const workspaceKeys = [
  'STORE_HEADER',
  'QUOTATION',
  'DELIVERY_NOTE',
  'CUSTOMER_RECEIPT',
  'CUSTOMER_MONEY_RECEIPT',
  'DELIVERY_CREDIT_SETTLEMENT',
  'REFUND_RECEIPT',
  'PURCHASE_ORDER',
  'COMBINED_BILLING',
  'FULL_TAX_INVOICE',
  'CREDIT_NOTE',
  'SHORT_TAX_INVOICE',
];

describe('Document format settings single-workspace selector', () => {
  it('owns one active document workspace at a time from a selector', () => {
    expect(source).toContain("const [activeWorkspace, setActiveWorkspace] = useState('STORE_HEADER')");
    expect(source).toContain('id="document-format-workspace-selector"');
    expect(source).toContain('value={activeWorkspace}');
    expect(source).toContain('onChange={(event) => setActiveWorkspace(event.target.value)}');
  });

  it('keeps the complete supported document catalog selectable', () => {
    for (const key of workspaceKeys) {
      expect(source).toContain(`value: '${key}'`);
    }
    expect(source).toContain('<optgroup key={group} label={group}>');
  });

  it('renders the store header only inside its selected workspace', () => {
    expect(source).toContain("{activeWorkspace === 'STORE_HEADER' && (");
    expect(source).toContain('ตัวอย่างหัวเอกสาร');
  });

  it('gates every document-specific settings owner by the selected workspace', () => {
    expect(source).toContain("activeWorkspace === 'QUOTATION'");
    expect(source).toContain("activeWorkspace === 'DELIVERY_NOTE'");
    expect(source).toContain("activeWorkspace === 'CUSTOMER_RECEIPT'");
    expect(source).toContain("activeWorkspace === 'CUSTOMER_MONEY_RECEIPT'");
    expect(source).toContain("activeWorkspace === 'DELIVERY_CREDIT_SETTLEMENT'");
    expect(source).toContain("activeWorkspace === 'REFUND_RECEIPT'");
    expect(source).toContain("activeWorkspace === 'PURCHASE_ORDER'");
    expect(source).toContain("activeWorkspace === 'COMBINED_BILLING'");
    expect(source).toContain("activeWorkspace === 'FULL_TAX_INVOICE'");
    expect(source).toContain("activeWorkspace === 'CREDIT_NOTE'");
    expect(source).toContain("activeWorkspace === 'SHORT_TAX_INVOICE'");
  });

  it('does not create a second presentation authority while simplifying navigation', () => {
    expect(source).toContain('documentPurpose="FULL_TAX_INVOICE"');
    expect(source).toContain('documentPurpose="CREDIT_NOTE"');
    expect(source).toContain('documentPurpose="SHORT_TAX_INVOICE"');
    expect(source).toContain('documentPurpose="CUSTOMER_MONEY_RECEIPT"');
    expect(source).toContain('documentPurpose="DELIVERY_CREDIT_SETTLEMENT"');
    expect(source).toContain('documentPurpose="REFUND_RECEIPT"');
  });
});
