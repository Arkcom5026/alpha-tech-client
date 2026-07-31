import { describe, expect, it } from 'vitest';
import warrantyClaimHelpSection from '../src/features/repair/help/warrantyClaimHelpContent.js';

describe('Warranty Claim Help DDWD contract', () => {
  it('documents the complete claim lifecycle', () => {
    const statusCodes = warrantyClaimHelpSection.statusTable.map(([code]) => code);
    const requiredStatuses = [
      'DRAFT',
      'SUBMITTED',
      'IN_TRANSIT',
      'RECEIVED_BY_PROVIDER',
      'INSPECTING',
      'APPROVED',
      'REJECTED',
      'REPAIRING',
      'REPLACEMENT_PENDING',
      'CREDIT_PENDING',
      'RESOLVED',
      'CANCELLED',
    ];

    for (const status of requiredStatuses) {
      expect(statusCodes, `missing claim status guidance: ${status}`).toContain(status);
    }
  });

  it('provides complete operational guidance', () => {
    expect(warrantyClaimHelpSection.id).toBe('claim');
    expect(warrantyClaimHelpSection.steps.length).toBeGreaterThanOrEqual(7);
    expect(warrantyClaimHelpSection.checklist.length).toBeGreaterThanOrEqual(8);
    expect(warrantyClaimHelpSection.faq.length).toBeGreaterThanOrEqual(5);
  });

  it('preserves claim authority and tenant-isolation terminology', () => {
    const fullText = JSON.stringify(warrantyClaimHelpSection);
    for (const requiredText of [
      'Active Claim',
      'StockItem',
      'Device',
      'Replacement Stock Item',
      'Credit Amount',
      'ร้านเดียวกัน',
      'RESOLVED',
      'CANCELLED',
    ]) {
      expect(fullText, `missing claim authority guidance: ${requiredText}`).toContain(requiredText);
    }
  });
});
