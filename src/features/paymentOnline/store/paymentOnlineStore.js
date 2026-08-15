// src/features/paymentOnline/store/paymentOnlineStore.js

import { create } from 'zustand';
import { feedback } from '@/design-system';
import {
  getOrderOnlineById,
  uploadPaymentSlip,
  submitOrderOnlinePaymentSlip,
  approveOrderOnlineSlip,
  rejectOrderOnlineSlip,
} from '../api/paymentOnlineApi';

export const usePaymentOnlineStore = create((set) => ({
  order: null,
  isLoading: false,
  isSubmitting: false,

  loadOrderAction: async (orderId) => {
    try {
      set({ isLoading: true });
      const order = await getOrderOnlineById(orderId);

      const subtotal = order.items?.reduce((sum, item) => {
        return sum + (Number(item.totalPrice) || 0);
      }, 0) || 0;

      const vat = subtotal * 0.07;
      const total = subtotal + vat;

      set({
        order: {
          ...order,
          amount: total,
          summary: {
            subtotal,
            vat,
            total,
          },
        },
      });
    } catch (error) {
      console.error('loadOrderAction error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  uploadSlipAction: async (orderId, formData) => {
    try {
      set({ isSubmitting: true });
      const uploadedSlipUrl = await uploadPaymentSlip(orderId, formData);
      return uploadedSlipUrl;
    } catch (error) {
      console.error('uploadSlipAction error:', error);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  submitSlipInfoAction: async (orderId, payload) => {
    try {
      set({ isSubmitting: true });
      await submitOrderOnlinePaymentSlip(orderId, payload);
    } catch (error) {
      console.error('submitSlipInfoAction error:', error);
    } finally {
      set({ isSubmitting: false });
    }
  },

  submitPaymentSlipAction: async (orderId, payload) => {
    return usePaymentOnlineStore.getState().submitSlipInfoAction(orderId, payload);
  },

  approveSlipAction: async (orderId) => {
    try {
      await approveOrderOnlineSlip(orderId);
      feedback.success('อนุมัติสลิปเรียบร้อยแล้ว');
    } catch (error) {
      console.error('approveSlipAction error:', error);
      feedback.error(error, { fallback: 'ไม่สามารถอนุมัติสลิปได้' });
    }
  },

  rejectSlipAction: async (orderId) => {
    try {
      await rejectOrderOnlineSlip(orderId);
      feedback.success('ปฏิเสธสลิปเรียบร้อยแล้ว');
    } catch (error) {
      console.error('rejectSlipAction error:', error);
      feedback.error(error, { fallback: 'ไม่สามารถปฏิเสธสลิปได้' });
    }
  },
}));
