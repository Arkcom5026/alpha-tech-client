import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(path.join(process.cwd(), 'src/features/communication/api/communicationApi.js'), 'utf8');

describe('communication foundation client boundary', () => {
  it('uses a shared communication API instead of provider-specific repair APIs', () => {
    expect(source).toContain("apiClient.get('/communication/profiles')");
    expect(source).toContain('/communication/customers/${customerId}/channels');
    expect(source).toContain('/communication/repairs/${repairJobId}/preference');
    expect(source).not.toContain('lineSdk');
    expect(source).not.toContain('facebookSdk');
    expect(source).not.toContain('/repairs/send-message');
  });
});
