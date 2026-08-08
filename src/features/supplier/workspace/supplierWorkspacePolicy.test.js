import { describe, expect, it } from 'vitest';

import {
  SUPPLIER_CREATE_DEFAULT_VALUES,
  createSupplierPaths,
  filterSuppliersBySearch,
  getSupplierPagination,
  normalizeSupplierForForm,
  normalizeSupplierMutationPayload,
  resolveSupplierShopSlug,
  sanitizeLegacySupplierUpdatePayload,
} from './supplierWorkspacePolicy';

describe('supplier workspace behavior lock', () => {
  it('preserves the legacy shop slug fallback and route shapes', () => {
    expect(resolveSupplierShopSlug()).toBe('advancetech');
    const paths = createSupplierPaths('store-a');
    expect(paths.list).toBe('/store-a/pos/purchases/suppliers');
    expect(paths.create).toBe('/store-a/pos/purchases/suppliers/create');
    expect(paths.view(12)).toBe('/store-a/pos/purchases/suppliers/view/12');
    expect(paths.edit(12)).toBe('/store-a/pos/purchases/suppliers/edit/12');
  });

  it('locks create/edit payload normalization', () => {
    expect(normalizeSupplierMutationPayload({
      name: 'Supplier',
      creditLimit: '1250.50',
      creditBalance: '',
      paymentTerms: '30',
      notes: '',
    })).toEqual({
      name: 'Supplier',
      creditLimit: 1250.5,
      creditBalance: 0,
      paymentTerms: 30,
      notes: null,
    });
  });

  it('keeps the legacy update payload contract distinct', () => {
    expect(sanitizeLegacySupplierUpdatePayload({
      name: 'Supplier',
      branchId: 4,
      createdAt: 'old',
      updatedAt: 'new',
      creditLimit: '900',
    })).toEqual({ name: 'Supplier', creditLimit: '900' });
  });

  it('normalizes bankId without mutating fetched supplier data', () => {
    const supplier = { id: 7, bankId: 3 };
    const normalized = normalizeSupplierForForm(supplier);
    expect(normalized).toEqual({ id: 7, bankId: '3' });
    expect(supplier.bankId).toBe(3);
  });

  it('locks list search and pagination behavior', () => {
    const suppliers = [
      { name: 'Alpha', phone: '0811111111', email: 'a@example.com' },
      { name: 'Beta', phone: '0822222222', email: 'b@example.com' },
    ];
    expect(filterSuppliersBySearch(suppliers, '082')).toEqual([suppliers[1]]);
    expect(getSupplierPagination({ total: 21, page: 5, limit: 20 })).toEqual({
      totalPages: 2,
      safePage: 2,
      startIndex: 20,
      endIndex: 21,
    });
  });

  it('preserves create defaults', () => {
    expect(SUPPLIER_CREATE_DEFAULT_VALUES.country).toBe('Thailand');
    expect(SUPPLIER_CREATE_DEFAULT_VALUES.creditLimit).toBe(0);
    expect(SUPPLIER_CREATE_DEFAULT_VALUES.paymentTerms).toBe(0);
  });
});
