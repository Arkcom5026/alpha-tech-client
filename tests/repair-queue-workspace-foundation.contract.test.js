import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import {
  filterRepairJobs,
  getRepairQueueSearchValues,
  projectRepairQueue,
  projectRepairQueueItem,
} from '../src/features/repair/queue/workspace/policies/repairQueuePolicy.js';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const workspaceSource = read(
  'src/features/repair/queue/workspace/components/RepairQueueWorkspace.jsx'
);
const policySource = read(
  'src/features/repair/queue/workspace/policies/repairQueuePolicy.js'
);
const runtimeSource = read('src/features/repair/utils/repairRuntime.js');
const boardSource = read('src/features/repair/components/QueueBoard.jsx');

const sampleJobs = [
  {
    id: 1,
    jobNo: 'REP-001',
    status: 'RECEIVED',
    customerName: 'Kanjana',
    deviceModel: 'Notebook A',
    reportedSymptoms: 'No power',
    stockItem: { barcode: 'BC-001', serialNumber: 'SN-001' },
    device: { barcode: 'DV-001', serialNumber: 'DSN-001', imei: 'IMEI-001' },
  },
  {
    id: 2,
    jobNo: 'REP-002',
    status: 'IN_PROGRESS',
    customerName: 'Somchai',
    deviceModel: 'Phone B',
    reportedSymptoms: 'Broken display',
  },
  {
    id: 8,
    jobNo: 'REP-008',
    status: 'IN_PROGRESS',
    customerName: 'External Customer',
    deviceModel: 'Notebook C',
    activeSubcontract: {
      id: 77,
      active: true,
      status: 'SENT',
      providerName: 'ช่างวา',
      workScope: 'ซ่อมเมนบอร์ด',
      sentAt: '2026-08-11T16:15:23.000Z',
    },
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
    expect(filterRepairJobs(sampleJobs, 'ช่างวา')).toEqual([sampleJobs[2]]);
    expect(filterRepairJobs(sampleJobs, '')).toBe(sampleJobs);
  });

  it('routes active subcontract custody to external repair lane without replacing repair status', () => {
    const projected = projectRepairQueueItem(sampleJobs[2]);
    expect(projected.status).toBe('IN_PROGRESS');
    expect(projected.queueStatus).toBe('EXTERNAL_REPAIR');

    const projection = projectRepairQueue(sampleJobs, '');
    const externalLane = projection.lanes.find((lane) => lane.key === 'EXTERNAL_REPAIR');
    const internalLane = projection.lanes.find((lane) => lane.key === 'IN_PROGRESS');
    expect(externalLane?.items.map((item) => item.id)).toContain(8);
    expect(internalLane?.items.map((item) => item.id)).not.toContain(8);
    expect(internalLane?.items.map((item) => item.id)).toContain(2);
  });

  it('preserves lane projection through the established repair runtime policy', () => {
    const projection = projectRepairQueue(sampleJobs, 'REP-001');
    expect(projection.filtered).toEqual([sampleJobs[0]]);
    expect(projection.lanes).toEqual(expect.any(Array));
    expect(projection.lanes.flatMap((lane) => lane.items).map((item) => item.id)).toContain(sampleJobs[0].id);
    expect(projection.lanes.flatMap((lane) => lane.items).map((item) => item.id)).not.toContain(sampleJobs[1].id);
  });

  it('declares and presents the external repair lane with provider context', () => {
    expect(runtimeSource).toContain("key: 'EXTERNAL_REPAIR'");
    expect(runtimeSource).toContain("label: 'ส่งซ่อมภายนอก'");
    expect(boardSource).toContain("lane.key === 'EXTERNAL_REPAIR'");
    expect(boardSource).toContain("external.providerName || '-'");
    expect(boardSource).toContain('external.workScope');
    expect(boardSource).toContain('ส่งออก {formatDateTime(external.sentAt)}');
    expect(boardSource).toContain("min-w-[1420px] grid-cols-6");
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
