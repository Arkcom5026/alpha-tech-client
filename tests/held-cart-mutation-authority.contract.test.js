import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('held cart mutation authority', () => {
  const panel = read('src/features/sales/held-cart/components/PosHeldCartPanel.jsx');

  it('shares one synchronous lock across create and cancel mutations', () => {
    expect(panel).toContain("import React, { useEffect, useRef, useState } from 'react';");
    expect(panel).toContain('const mutationLockRef = useRef(false);');
    expect(panel).toContain('if (saving || cancellingId || mutationLockRef.current) return;');
    expect(panel).toContain('mutationLockRef.current = true;');
    expect(panel).toContain('mutationLockRef.current = false;');
  });

  it('snapshots the held cart payload before creating it', () => {
    expect(panel).toContain('const payload = {');
    expect(panel).toContain('items: [...currentItems],');
    expect(panel).toContain('const cart = await createPosHeldCart(payload);');
  });

  it('snapshots the cancellation reason and target before calling the API', () => {
    expect(panel).toContain('const reason = cancelReason.trim();');
    expect(panel).toContain('const targetId = heldCartId;');
    expect(panel).toContain('await cancelPosHeldCart(targetId, reason);');
  });

  it('locks panel interactions while either persistent mutation is active', () => {
    expect(panel).toContain('const interactionLocked = saving || Boolean(cancellingId);');
    expect(panel).toContain('disabled={interactionLocked}');
    expect(panel).toContain('disabled={!currentItems.length || interactionLocked}');
  });
});
