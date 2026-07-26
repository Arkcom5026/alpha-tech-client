import { beforeEach, describe, expect, it } from 'vitest';
import { confirmation } from '../confirmationController';

describe('confirmation runtime', () => {
  beforeEach(() => {
    confirmation.reset();
  });

  it('resolves accepted confirmation', async () => {
    const promise = confirmation.confirm({ key: 'delete-product' });

    confirmation.resolve('delete-product', true);

    await expect(promise).resolves.toBe(true);
  });

  it('resolves cancelled confirmation', async () => {
    const promise = confirmation.confirm({ key: 'delete-product' });

    confirmation.cancel('delete-product');

    await expect(promise).resolves.toBe(false);
  });

  it('isolates multiple confirmation requests', () => {
    confirmation.confirm({ key: 'delete-product' });
    confirmation.confirm({ key: 'cancel-sale' });

    confirmation.resolve('delete-product', true);

    expect(confirmation.hasPending('delete-product')).toBe(false);
    expect(confirmation.hasPending('cancel-sale')).toBe(true);
  });
});
