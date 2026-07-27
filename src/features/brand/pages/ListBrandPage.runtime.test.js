import { beforeEach, describe, expect, it, vi } from 'vitest';

import { confirmation } from '@/runtime';
import {
  BRAND_CONFIRMATION_KEYS,
  buildDetachBrandConfirmationMessage,
  confirmDetachBrandFromProductType,
  projectBrandRuntimeError,
} from './ListBrandPage.runtime';

describe('ListBrandPage runtime bridge', () => {
  beforeEach(() => {
    confirmation.reset();
  });

  it('registers detach confirmation in ADS runtime and resolves accepted native confirmation', async () => {
    const confirmAdapter = vi.fn(() => true);
    const link = { id: 31, brand: { name: 'Canon' } };
    const productType = { id: 7, name: 'เครื่องพิมพ์' };

    const result = await confirmDetachBrandFromProductType({
      link,
      productType,
      confirmAdapter,
    });

    expect(result).toBe(true);
    expect(confirmAdapter).toHaveBeenCalledWith(
      'ต้องการถอด "Canon" ออกจากประเภทสินค้า "เครื่องพิมพ์" หรือไม่?'
    );
    expect(
      confirmation.hasPending(`${BRAND_CONFIRMATION_KEYS.DETACH_PRODUCT_TYPE_LINK}:31`)
    ).toBe(false);
  });

  it('resolves rejection without leaving a pending confirmation', async () => {
    const result = await confirmDetachBrandFromProductType({
      link: { id: 31, name: 'Epson' },
      productType: { name: 'สแกนเนอร์' },
      confirmAdapter: () => false,
    });

    expect(result).toBe(false);
    expect(
      confirmation.hasPending(`${BRAND_CONFIRMATION_KEYS.DETACH_PRODUCT_TYPE_LINK}:31`)
    ).toBe(false);
  });

  it('rejects invalid links before opening confirmation authority', async () => {
    const confirmAdapter = vi.fn(() => true);

    const result = await confirmDetachBrandFromProductType({
      link: { id: '' },
      productType: { name: 'เครื่องพิมพ์' },
      confirmAdapter,
    });

    expect(result).toBe(false);
    expect(confirmAdapter).not.toHaveBeenCalled();
  });

  it('cancels runtime confirmation when the UI adapter throws', async () => {
    const key = `${BRAND_CONFIRMATION_KEYS.DETACH_PRODUCT_TYPE_LINK}:31`;

    await expect(
      confirmDetachBrandFromProductType({
        link: { id: 31, name: 'Brother' },
        productType: { name: 'เครื่องพิมพ์' },
        confirmAdapter: () => {
          throw new Error('CONFIRM_UI_FAILED');
        },
      })
    ).rejects.toThrow('CONFIRM_UI_FAILED');

    expect(confirmation.hasPending(key)).toBe(false);
  });

  it('builds the legacy Thai message and projects normalized runtime errors', () => {
    expect(
      buildDetachBrandConfirmationMessage({
        link: { name: 'HP' },
        productType: { name: 'โน้ตบุ๊ก' },
      })
    ).toBe('ต้องการถอด "HP" ออกจากประเภทสินค้า "โน้ตบุ๊ก" หรือไม่?');

    expect(
      projectBrandRuntimeError({
        response: { status: 409, data: { message: 'แบรนด์นี้ยังถูกใช้งานอยู่' } },
      })
    ).toBe('แบรนด์นี้ยังถูกใช้งานอยู่');
  });
});
