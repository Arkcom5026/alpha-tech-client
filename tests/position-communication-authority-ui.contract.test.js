import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Communication position authority UI contract', () => {
  it('exposes communication use and profile management capabilities in PositionForm', () => {
    const groupSource = read('src/features/position/components/communicationCapabilityGroup.js');
    const formSource = read('src/features/position/components/PositionForm.jsx');

    expect(groupSource).toContain("USE: 'communication.use'");
    expect(groupSource).toContain("PROFILE_MANAGE: 'communication.profile.manage'");
    expect(groupSource).toContain("key: 'communication'");
    expect(groupSource).toContain("title: 'การสื่อสารกับลูกค้า'");
    expect(formSource).toContain("import { COMMUNICATION_CAPABILITY_GROUP } from './communicationCapabilityGroup';");
    expect(formSource).toContain('COMMUNICATION_CAPABILITY_GROUP,');
  });
});
