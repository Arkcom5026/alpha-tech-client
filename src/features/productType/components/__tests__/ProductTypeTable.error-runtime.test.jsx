// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import useProductTypeStore from '@/features/productType/store/productTypeStore.js';
import ProductTypeTable from '../ProductTypeTable';

vi.mock('@/features/productType/store/productTypeStore.js', () => ({
  default: vi.fn(),
}));

describe('ProductTypeTable ADS runtime error projection', () => {
  beforeEach(() => {
    useProductTypeStore.mockReturnValue({
      archiveProductTypeAction: vi.fn(),
      restoreProductTypeAction: vi.fn(),
      isSubmitting: false,
    });
  });

  afterEach(() => cleanup());

  it('renders the normalized runtime error message instead of object coercion', () => {
    render(
      <ProductTypeTable
        data={[]}
        loading={false}
        error={{
          kind: 'conflict',
          message: 'ประเภทสินค้านี้มีอยู่แล้ว',
          status: 409,
          code: 'PRODUCT_TYPE_CONFLICT',
          retryable: false,
        }}
        canManage
      />,
    );

    expect(screen.getByText('ประเภทสินค้านี้มีอยู่แล้ว')).toBeTruthy();
    expect(screen.queryByText('[object Object]')).toBeNull();
  });
});
