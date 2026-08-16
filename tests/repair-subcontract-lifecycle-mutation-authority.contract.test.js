import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Repair subcontract lifecycle mutation authority', () => {
  it('serializes lifecycle mutations and emits ADS action outcomes', () => {
    const source = read('src/features/repair/components/RepairSubcontractPanel.jsx');

    expect(source).toContain("import { feedback } from '@/design-system'");
    expect(source).toContain('const mutationRef = useRef(false)');
    expect(source).toContain('if (mutationRef.current || mutationBusy) return false');
    expect(source).toContain('feedback.actionSuccess');
    expect(source).toContain('feedback.actionError');
    expect(source).toContain('repair:subcontract:${job.id}:${key}:success');
    expect(source).toContain('repair:subcontract:${job.id}:${key}:error');
  });

  it('freezes mutable payloads before send, update, return request, and return receipt', () => {
    const source = read('src/features/repair/components/RepairSubcontractPanel.jsx');

    expect(source).toContain('const sendFormSnapshot = { ...sendForm }');
    expect(source).toContain('const updateFormSnapshot = { ...updateForm }');
    expect(source).toContain('const returnNoteSnapshot = returnNote.trim()');
    expect(source).toContain('const receiveFormSnapshot = { ...receiveForm }');
    expect(source).toContain("action: 'REQUEST_RETURN'");
    expect(source).toContain("action: 'RECEIVE_RETURN'");
  });

  it('keeps all subcontract lifecycle controls locked while one mutation owns the boundary', () => {
    const source = read('src/features/repair/components/RepairSubcontractPanel.jsx');

    expect(source).toContain('const interactionLocked = loading || mutationBusy');
    expect(source).toContain('<fieldset disabled={interactionLocked}');
    expect(source).toContain("mutationAction === 'send'");
    expect(source).toContain("mutationAction === 'update'");
    expect(source).toContain("mutationAction === 'request-return'");
    expect(source).toContain("mutationAction === 'receive-return'");
  });
});
