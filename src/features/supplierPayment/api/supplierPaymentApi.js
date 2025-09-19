// supplierPaymentApi.js (refined)
// - ใช้ apiClient กลาง (#37, #61)
// - Getters: คืน []/null เมื่อพลาด; Mutations: throw ให้ Store จัดการ
// - ใช้ query params แทน string concatenation

import apiClient from '@/utils/apiClient.js';

// ────────────────────────────────────────────────────────────────────────────────
// Create / Delete (Mutations)
// ────────────────────────────────────────────────────────────────────────────────
export const createSupplierPayment = async (data) => {
  try {
    const res = await apiClient.post('/supplier-payments', {
      supplierId: data.supplierId,
      paymentDate: data.paymentDate,
      amount: data.amount,
      method: data.method,
      paymentType: data.paymentType,
      note: data.note,
      debitAmount: data.debitAmount,
      creditAmount: data.creditAmount,
      receipts: data.receiptItems || [], // ชื่อฟิลด์ตาม BE
    });
    return res.data;
  } catch (err) {
    console.error('❌ [createSupplierPayment] error:', err);
    throw err;
  }
};

export const deleteSupplierPayment = async (paymentId) => {
  try {
    const res = await apiClient.delete(`/supplier-payments/${paymentId}`);
    return res.data;
  } catch (err) {
    console.error('❌ [deleteSupplierPayment] error:', err);
    throw err;
  }
};

// ────────────────────────────────────────────────────────────────────────────────
// Reads (Getters)
// ────────────────────────────────────────────────────────────────────────────────
export const getAllSupplierPayments = async () => {
  try {
    const res = await apiClient.get('/supplier-payments');
    return res.data;
  } catch (err) {
    console.error('❌ [getAllSupplierPayments] error:', err);
    return [];
  }
};

export const getSupplierPaymentsByPO = async (poId) => {
  try {
    const res = await apiClient.get(`/supplier-payments/by-po/${poId}`);
    return res.data;
  } catch (err) {
    console.error('❌ [getSupplierPaymentsByPO] error:', err);
    return [];
  }
};

export const getSupplierPaymentsBySupplier = async (supplierId) => {
  try {
    const res = await apiClient.get(`/supplier-payments/by-supplier/${supplierId}`);
    return res.data;
  } catch (error) {
    console.error('❌ [getSupplierPaymentsBySupplier] error:', error);
    return [];
  }
};

// ✅ ดึงยอดมัดจำที่ยังไม่ได้ผูกกับเอกสารอื่น ของ Supplier ที่ระบุ
export const getAdvancePaymentsBySupplier = async (supplierId) => {
  try {
    const res = await apiClient.get('/supplier-payments/advance', {
      params: { supplierId },
    });
    return res.data;
  } catch (error) {
    console.error('❌ [getAdvancePaymentsBySupplier] error:', error);
    return [];
  }
};
