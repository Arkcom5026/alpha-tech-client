import { describe, expect, it, vi } from 'vitest';

vi.mock('../api/saleDocumentWorkspaceApi', () => ({
  saveSaleDocumentLines: vi.fn(),
}));

import { saveSaleDocumentLines } from '../api/saleDocumentWorkspaceApi';
import { executeSaleDocumentLineUpdate } from './saleDocumentLineUpdateController';

describe('sale document line update controller', () => {
  it('rejects an empty grouped-line identity before sending a mutation', async () => {
    const result = await executeSaleDocumentLineUpdate({ saleId: 1 });

    expect(result).toMatchObject({
      ok: false,
      code: 'SALE_DOCUMENT_LINE_IDS_REQUIRED',
    });
    expect(saveSaleDocumentLines).not.toHaveBeenCalled();
  });

  it('preserves the mutation outcome when authoritative reload fails', async () => {
    saveSaleDocumentLines.mockResolvedValueOnce({ updated: true });

    const result = await executeSaleDocumentLineUpdate({
      saleId: 1,
      saleItemIds: [5],
      draft: { documentDescriptionRaw: 'updated description' },
      reload: vi.fn().mockRejectedValueOnce(new Error('reload unavailable')),
    });

    expect(result).toMatchObject({
      ok: false,
      mutationApplied: true,
      code: 'SALE_DOCUMENT_LINE_RELOAD_FAILED',
    });
    expect(saveSaleDocumentLines).toHaveBeenCalledWith({
      saleId: 1,
      payload: {
        items: [{
          id: 5,
          documentPrefix: null,
          documentDescription: 'updated description',
          documentSuffix: null,
        }],
        simpleItems: [],
      },
    });
  });
});
