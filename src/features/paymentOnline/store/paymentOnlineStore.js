// src/features/paymentOnline/store/paymentOnlineStore.js

import { create } from 'zustand';
import { feedback } from '@/design-system/feedback';
import {
  getOrderOnlineById,
  uploadPaymentSlip,
  submitOrderOnlinePaymentSlip,
  approveOrderOnlineSlip,
  rejectOrderOnlineSlip,
} from '../api/paymentOnlineApi';

export const usePaymentOnlineStore = create((set, get) => ({
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
      return order;
    } catch (error) {
      console.error('loadOrderAction error:', error);
      feedback.actionError(
        error,
        'ไม่สามารถโหลดข้อมูลการชำระเงินได้',
        `payment-online:${orderId}:load:error`,
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  uploadSlipAction: async (orderId, formData) => {
    if (get().isSubmitting) {
      throw new Error('กำลังดำเนินการชำระเงินอยู่ กรุณารอสักครู่');
    }
    try {
      set({ isSubmitting: true });
      const uploadedSlipUrl = await uploadPaymentSlip(orderId, formData);
      return uploadedSlipUrl;
    } catch (error) {
      console.error('uploadSlipAction error:', error);
      feedback.actionError(
        error,
        'อัปโหลดสลิปไม่สำเร็จ',
        `payment-online:${orderId}:upload:error`,
      );
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  submitSlipInfoAction: async (orderId, payload) => {
    if (get().isSubmitting) {
      throw new Error('กำลังดำเนินการชำระเงินอยู่ กรุณารอสักครู่');
    }
    try {
      set({ isSubmitting: true });
      const result = await submitOrderOnlinePaymentSlip(orderId, payload);
      feedback.actionSuccess(
        'ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว',
        `payment-online:${orderId}:submit:success`,
      );
      return result;
    } catch (error) {
      console.error('submitSlipInfoAction error:', error);
      feedback.actionError(
        error,
        'เกิดข้อผิดพลาดในการส่งข้อมูลการชำระเงิน',
        `payment-online:${orderId}:submit:error`,
      );
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  submitPaymentSlipAction: async (orderId, payload) => {
    return usePaymentOnlineStore.getState().submitSlipInfoAction(orderId, payload);
  },

  approveSlipAction: async (orderId) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });
    try {
      await approveOrderOnlineSlip(orderId);
      feedback.actionSuccess(
        'อนุมัติสลิปเรียบร้อยแล้ว',
        `payment-online:${orderId}:approve:success`,
      );
    } catch (error) {
      console.error('approveSlipAction error:', error);
      feedback.actionError(
        error,
        'ไม่สามารถอนุมัติสลิปได้',
        `payment-online:${orderId}:approve:error`,
      );
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  rejectSlipAction: async (orderId) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });
    try {
      await rejectOrderOnlineSlip(orderId);
      feedback.actionSuccess(
        'ปฏิเสธสลิปเรียบร้อยแล้ว',
        `payment-online:${orderId}:reject:success`,
      );
    } catch (error) {
      console.error('rejectSlipAction error:', error);
      feedback.actionError(
        error,
        'ไม่สามารถปฏิเสธสลิปได้',
        `payment-online:${orderId}:reject:error`,
      );
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
