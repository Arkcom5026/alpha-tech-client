import { describe, expect, test } from 'vitest';

import {
  isPhoneLikeQuery,
} from '../src/features/sales/create/customer/hooks/useSaleCustomerSearch';

describe('Sale customer unified query classification', () => {
  test('accepts phone formatting without classifying alphanumeric customer fields as phone', () => {
    expect(isPhoneLikeQuery('081-234-5678')).toBe(true);
    expect(isPhoneLikeQuery('+66 81 234 5678')).toBe(true);
    expect(isPhoneLikeQuery('user123@example.com')).toBe(false);
    expect(isPhoneLikeQuery('Company 123')).toBe(false);
    expect(isPhoneLikeQuery('Tax-ABC-123')).toBe(false);
  });
});
