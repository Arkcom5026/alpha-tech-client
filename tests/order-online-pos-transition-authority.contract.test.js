import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('Order Online POS transition authority', () => {
  const store = read('src/features/orderOnlinePos/store/orderOnlinePosStore.js');
  const table = read('src/features/orderOnlinePos/components/OrderOnlinePosTable.jsx');
  const detail = read('src/features/orderOnlinePos/pages/OrderOnlinePosDetailPage.jsx');

  it('serializes persistent transitions in the store', () => {
    expect(store).toContain('mutationAction: null');
    expect(store).toContain('if (get().mutationAction) throw mutationBusyError()');
    expect(store).toContain('mutationAction: `approve:${idSnapshot}`');
    expect(store).toContain('mutationAction: `reject:${idSnapshot}`');
    expect(store).toContain('mutationAction: `delete:${idSnapshot}`');
  });

  it('keeps persistence success separate from refresh failure', () => {
    expect(store).toContain('let refreshError = null');
    expect(store).toContain('return { result, refreshError }');
    expect(store).toContain('return { result: true, refreshError }');
    expect(table).toContain(':refresh:error`');
    expect(detail).toContain(':refresh:error`');
  });

  it('uses the canonical approval action from both table and detail', () => {
    expect(table).toContain('approveOrderOnlinePaymentSlipAction');
    expect(detail).toContain('approveOrderOnlinePaymentSlipAction');
    expect(table).not.toContain('approveOrderOnlineSlipAction,');
  });

  it('closes the first-render duplicate-submit gap in UI owners', () => {
    expect(table).toContain('const actionRef = useRef(false)');
    expect(table).toContain('const command = {');
    expect(detail).toContain('const actionRef = useRef(false)');
    expect(detail).toContain('const orderIdSnapshot = Number(id)');
  });
});
