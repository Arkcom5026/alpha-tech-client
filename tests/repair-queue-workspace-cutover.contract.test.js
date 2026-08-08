import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const pageSource = read('src/features/repair/pages/RepairJobsPage.jsx');
const workspaceSource = read(
  'src/features/repair/queue/workspace/components/RepairQueueWorkspace.jsx'
);
const policySource = read(
  'src/features/repair/queue/workspace/policies/repairQueuePolicy.js'
);

describe('repair queue workspace cutover contract', () => {
  it('composes queue presentation through the repair queue workspace', () => {
    expect(pageSource).toContain('RepairQueueWorkspace');
    expect(pageSource).toContain('projectRepairQueue(jobs, query)');
    expect(pageSource).toContain('lanes={lanes}');
    expect(pageSource).toContain('onOpenJob={(job) =>');
  });

  it('keeps store lifecycle and route navigation authority in the page', () => {
    expect(pageSource).toContain('useRepairRuntimeStore');
    expect(pageSource).toContain('useEffect');
    expect(pageSource).toContain('loadJobs();');
    expect(pageSource).toContain('useNavigate');
    expect(pageSource).toContain('useParams');
    expect(pageSource).toContain('/pos/services/repairs/${job.id}');
  });

  it('removes duplicated queue projection and presentation implementation from the page', () => {
    expect(pageSource).not.toContain('REPAIR_LANES');
    expect(pageSource).not.toContain('groupByStatus');
    expect(pageSource).not.toContain('job.stockItem?.serialNumber');
    expect(pageSource).not.toContain('job.device?.imei');
    expect(pageSource).not.toContain('RepairShellHeader');
    expect(pageSource).not.toContain('RuntimeStatePanel');
    expect(pageSource).not.toContain('QueueBoard');
  });

  it('keeps policy and presentation free of store and router authority', () => {
    for (const source of [workspaceSource, policySource]) {
      expect(source).not.toContain('useRepairRuntimeStore');
      expect(source).not.toContain('react-router-dom');
      expect(source).not.toContain('useNavigate');
      expect(source).not.toContain('useParams');
    }
    expect(policySource).not.toContain('react');
  });
});
