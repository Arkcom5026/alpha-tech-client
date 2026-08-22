import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Operational residual position authority UI contract', () => {
  it('exposes communication, store experience and product trace authority in PositionForm', () => {
    const groupSource = read('src/features/position/components/operationalResidualCapabilityGroups.js');
    const formSource = read('src/features/position/components/PositionForm.jsx');

    expect(groupSource).toContain("USE: 'communication.use'");
    expect(groupSource).toContain("PROFILE_MANAGE: 'communication.profile.manage'");
    expect(groupSource).toContain("READ: 'store-experience.read'");
    expect(groupSource).toContain("MANAGE: 'store-experience.manage'");
    expect(groupSource).toContain("PUBLISH: 'store-experience.publish'");
    expect(groupSource).toContain("FINANCIAL: 'product.trace.financial'");
    expect(groupSource).toContain("title: 'การสื่อสารกับลูกค้า'");
    expect(groupSource).toContain("title: 'หน้าร้านออนไลน์และประสบการณ์ร้าน'");
    expect(groupSource).toContain("title: 'ประวัติสินค้าและข้อมูลต้นทุน'");

    expect(formSource).toContain('COMMUNICATION_CAPABILITY_GROUP,');
    expect(formSource).toContain('STORE_EXPERIENCE_CAPABILITY_GROUP,');
    expect(formSource).toContain('PRODUCT_TRACE_CAPABILITY_GROUP,');
  });
});
