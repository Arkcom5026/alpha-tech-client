import axios from 'axios';
import { getRuntimeBaseURL } from '@/utils/apiClient';

const normalizeError = (error) => {
  const payload = error?.response?.data;
  const normalized = new Error(
    payload?.message || error?.message || 'ไม่สามารถโหลดสถานะงานซ่อมได้'
  );
  normalized.code = payload?.code || 'REPAIR_TRACKING_FAILED';
  normalized.status = error?.response?.status || null;
  return normalized;
};

export async function getPublicRepairTracking(token) {
  try {
    const baseURL = getRuntimeBaseURL();
    const response = await axios.get(
      `${baseURL}repairs/public/tracking/${encodeURIComponent(String(token || '').trim())}`,
      {
        timeout: 30000,
        withCredentials: false,
        headers: { Accept: 'application/json' },
      }
    );
    return response?.data?.data ?? null;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function decidePublicRepairEstimate(token, payload) {
  try {
    const baseURL = getRuntimeBaseURL();
    const response = await axios.post(
      `${baseURL}repairs/public/tracking/${encodeURIComponent(String(token || '').trim())}/estimate-decision`,
      payload,
      {
        timeout: 30000,
        withCredentials: false,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    return response?.data?.data ?? null;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function confirmPublicRepairPickup(token, payload) {
  try {
    const baseURL = getRuntimeBaseURL();
    const response = await axios.post(
      `${baseURL}repairs/public/tracking/${encodeURIComponent(String(token || '').trim())}/pickup-confirmation`,
      payload,
      { timeout: 30000, withCredentials: false, headers: { 'Content-Type': 'application/json' } }
    );
    return response?.data?.data ?? null;
  } catch (error) {
    throw normalizeError(error);
  }
}
