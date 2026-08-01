import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import {
  projectSaleSettlementFailure,
  projectSaleSettlementSuccess,
} from '../src/features/sales/history/services/saleSettlementResult';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeSlicePath = path.join(
  root,
  'src/features/sales/history/store/saleHistoryRuntimeSlice.js'
);

const runtimeSource = fs.readFileSync(runtimeSlicePath, 'utf8');

describe('Sale settlement error authority contract', () => {
  test('projects canonical success', () => {
    expect(projectSaleSettlementSuccess({ success: true })).toEqual({
      ok: true,
      data: { success: true },
      error: '',
      code: null,
      status: 200,
      detail: null,
    });
  });

  test('preserves deterministic payment evidence failure', () => {
    const result = projectSaleSettlementFailure({
      response: {
        status: 409,
        data: {
          message: 'ยอดชำระยังไม่ครบ ไม่สามารถปิดบิลได้',
          code: 'PAYMENT_EVIDENCE_INSUFFICIENT',
          detail: {
            totalAmount: 1000,
            paidAmount: 400,
            balanceAmount: 600,
          },
        },
      },
    });

    expect(result).toEqual({
      ok: false,
      data: null,
      error: 'ยอดชำระยังไม่ครบ ไม่สามารถปิดบิลได้',
      code: 'PAYMENT_EVIDENCE_INSUFFICIENT',
      status: 409,
      detail: {
        totalAmount: 1000,
        paidAmount: 400,
        balanceAmount: 600,
      },
    });
  });

  test('projects network or unknown failure without false success', () => {
    expect(projectSaleSettlementFailure(new Error('Network Error'))).toEqual({
      ok: false,
      data: null,
      error: 'Network Error',
      code: null,
      status: 0,
      detail: null,
    });
  });

  test('runtime action returns projector results instead of swallowing errors', () => {
    expect(runtimeSource).toContain('return projectSaleSettlementSuccess(data);');
    expect(runtimeSource).toContain('return projectSaleSettlementFailure(err);');
    expect(runtimeSource).not.toContain("await markSaleAsPaid(saleId);\n    } catch (err)");
  });
});
