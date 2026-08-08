import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import {
  filterWarrantyClaims,
  getWarrantyClaimSearchValues,
  projectWarrantyClaimQueue,
} from '../src/features/repair/claimQueue/workspace/policies/warrantyClaimQueuePolicy.js';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const workspaceSource = read(
  'src/features/repair/claimQueue/workspace/components/WarrantyClaimQueueWorkspace.jsx'
);
const policySource = read(
  'src/features/repair/claimQueue/workspace/policies/warrantyClaimQueuePolicy.js'
);
const pageSource = read('src/features/repair/pages/WarrantyClaimsPage.jsx');

const sampleClaims = [
  {
    id: 1,
    claimNo: 'CLM-001',
    status: 'SUBMITTED',
    reason: 'Display issue',
    externalClaimRef: 'EXT-001',
    trackingNumber: 'TRACK-001',
    supplier: { name: 'Supplier One' },
    serviceProvider: 'Provider A',
    repairJob: {
      jobNo: 'REP-001',
      customerName: 'Kanjana',
      customer: { name: 'Kanjana', phone: '0800000000', email: 'k@example.com' },
    },
    claimAsset: {
      displayName: 'Notebook A',
      brand: 'Brand A',
      category: 'Notebook',
      model: 'Model A',
      barcode: 'ASSET-001',
      serialNumber: 'SN-001',
      imei: 'IMEI-001',
    },
  },
  {
    id: 2,
    claimNo: 'CLM-002',
    status: 'RESOLVED',
    reason: 'Battery issue',
    device: { brand: 'Brand B', model: 'Phone B', imei: 'IMEI-002' },
  },
];

describe('warranty claim queue workspace foundation contract', () => {
  it('keeps claim queue projection policy pure and runtime-independent', () => {
    expect(policySource).not.toContain('react');
    expect(policySource).not.toContain('useRepairRuntimeStore');
    expect(policySource).not.toContain('react-router-dom');
    expect(policySource).not.toContain('useEffect');
  });

  it('preserves warranty claim search identity semantics', () => {
    const values = getWarrantyClaimSearchValues(sampleClaims[0]);
    expect(values).toContain('CLM-001');
    expect(values).toContain('SN-001');
    expect(values).toContain('IMEI-001');
    expect(values).toContain('Supplier One');
    expect(filterWarrantyClaims(sampleClaims, 'imei-001')).toEqual([sampleClaims[0]]);
    expect(filterWarrantyClaims(sampleClaims, 'battery')).toEqual([sampleClaims[1]]);
    expect(filterWarrantyClaims(sampleClaims, '')).toBe(sampleClaims);
  });

  it('preserves active-lane projection through the established claim runtime policy', () => {
    const projection = projectWarrantyClaimQueue(sampleClaims, 'CLM-001');
    expect(projection.filtered).toEqual([sampleClaims[0]]);
    expect(projection.activeLanes).toHaveLength(1);
    expect(projection.activeLanes[0].key).toBe('SUBMITTED');
    expect(projection.activeLanes[0].items).toEqual([sampleClaims[0]]);
  });

  it('keeps workspace presentation free of store, route, and lifecycle authority', () => {
    expect(workspaceSource).not.toContain('useRepairRuntimeStore');
    expect(workspaceSource).not.toContain('react-router-dom');
    expect(workspaceSource).not.toContain('useEffect');
    expect(workspaceSource).not.toContain('useNavigate');
    expect(workspaceSource).not.toContain('useParams');
  });

  it('preserves queue state, search, refresh, retry, and open intents through props before cutover', () => {
    expect(workspaceSource).toContain('onQueryChange(event.target.value)');
    expect(workspaceSource).toContain('onClick={onRefresh}');
    expect(workspaceSource).toContain('onRetry={onRetry}');
    expect(workspaceSource).toContain('lanes={activeLanes}');
    expect(workspaceSource).toContain('onOpen={onOpenClaim}');
    expect(pageSource).toContain('useRepairRuntimeStore');
    expect(pageSource).toContain('loadClaims');
    expect(pageSource).toContain('groupByStatus(filtered, CLAIM_LANES)');
  });
});
