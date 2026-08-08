import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import {
  filterRepairJobs,
  getRepairQueueSearchValues,
  projectRepairQueue,
} from '../src/features/repair/queue/workspace/policies/repairQueuePolicy.js';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const workspaceSource = read(
  'src/features/repair/queue/workspace/components/RepairQueueWorkspace.jsx'
);
const policySource = read(
  'src/features/repair/queue/workspace/policies/repairQueuePolicy.js'
);

const sampleJobs = [
  {
    id: 1,
    jobNo: 'REP-001',
    status: 'INTAKE',
    customerName: 'Kanjana',
    deviceModel: 'Notebook A',
    reportedSymptoms: 'No power',
    stockItem: { barcode: 'BC-001', serialNumber: 'SN-001' },
    device: { barcode: 'DV-001', serialNumber: 'DSN-001', imei: 'IMEI-001' },
  },
  {
    id: 2,
    jobNo: 'REP-002',
    status: 'REPAIRING',
    customerName: 'Somchai',
    deviceModel: 'Phone B',
    reportedSymptoms: 'Broken display',
  },
];

describe('repair queue workspace foundation contract', () => {
  it('keeps queue projection policy pure and runtime-independent', () => {
    expect(policySource).not.toContain('react');
    expect(policySource).not.toContain('useRepairRuntimeStore');
    expect(policySource).not.toContain('react-router-dom');
    expect(policySource).not.toContain('useEffect');
  });

  it('preserves repair queue search identity semantics', () => {
    const values = getRepairQueueSearchValues(sampleJobs[0]);
    expect(values).toContain('REP-001');
    expect(values).toContain('SN-001');
    expect(values).toContain('IMEI-001');
    expect(filterRepairJobs(sampleJobs, 'imei-001')).toEqual([sampleJobs[0]]);
    expect(filterRepairJobs(sampleJobs, 'somchai')).toEqual([sampleJobs[1]]);
    expect(filterRepairJobs(sampleJobs, '')).toBe(sampleJobs);
  });

  it('preserves lane projection through the established repair runtime policy', () => {
    const projection = projectRepairQueue(sampleJobs, 'REP-001');
    expect(projection.filtered).toEqual([sampleJobs[0]]);
    expect(projection.lanes).toEqual(expect.any(Array));
    expect(projection.lanes.flatMap((lane) => lane.items)).toContain(sampleJobs[0]);
    expect(projection.lanes.flatMap((lane) => lane.items)).not.toContain(sampleJobs[1]);
  });

  it('keeps workspace presentation free of store, route, and lifecycle authority', () => {
    expect(workspaceSource).not.toContain('useRepairRuntimeStore');
    expect(workspaceSource).not.toContain('react-router-dom');
    expect(workspaceSource).not.toContain('useEffect');
    expect(workspaceSource).not.toContain('useNavigate');
    expect(workspaceSource).not.toContain('useParams');
  });

  it('preserves queue state, search, refresh, retry, and open intents through props', () => {
    expect(workspaceSource).toContain('onQueryChange(event.target.value)');
    expect(workspaceSource).toContain('onClick={onRefresh}');
    expect(workspaceSource).toContain('onRetry={onRetry}');
    expect(workspaceSource).toContain('lanes={lanes}');
    expect(workspaceSource).toContain('onOpen={onOpenJob}');
    expect(workspaceSource).toContain('emptyText="ยังไม่มีงานซ่อมในระบบ"');
  });
});
