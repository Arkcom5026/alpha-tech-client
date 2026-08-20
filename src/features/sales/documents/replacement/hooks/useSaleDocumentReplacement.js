import { useCallback, useEffect, useRef, useState } from 'react';
import { feedback as toast } from '@/design-system';
import {
  createSaleDocumentReplacement,
  getSaleDocumentReplacement,
  lockSaleDocumentReplacement,
  replaceSaleDocumentReplacementLines,
} from '../api/saleDocumentReplacementApi';

const errorMessage = (error) => (
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'ไม่สามารถดำเนินการเอกสารฉบับทดแทนได้'
);

export const useSaleDocumentReplacement = ({ saleId, enabled = true, onLocked } = {}) => {
  const [replacement, setReplacement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef(0);

  const load = useCallback(async ({ reportError = false } = {}) => {
    if (!enabled || !saleId) {
      setReplacement(null);
      return null;
    }
    const requestId = ++requestRef.current;
    setLoading(true);
    setError('');
    try {
      const next = await getSaleDocumentReplacement(saleId);
      if (requestId === requestRef.current) setReplacement(next);
      return next;
    } catch (requestError) {
      const message = errorMessage(requestError);
      if (requestId === requestRef.current) setError(message);
      if (reportError) toast.error(message);
      return null;
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [enabled, saleId]);

  useEffect(() => {
    setReplacement(null);
    setError('');
    if (enabled && saleId) load();
  }, [enabled, load, saleId]);

  const create = useCallback(async (reason) => {
    if (!enabled || !saleId || saving) return null;
    setSaving(true);
    setError('');
    try {
      const result = await createSaleDocumentReplacement(saleId, reason);
      setReplacement(result?.replacement || null);
      toast.actionSuccess(
        result?.replayed ? 'เปิดแบบร่างฉบับทดแทนเดิมแล้ว' : 'สร้างแบบร่างฉบับทดแทนแล้ว',
        `sale-document-replacement:${saleId}:create:success`
      );
      return result;
    } catch (requestError) {
      const message = errorMessage(requestError);
      setError(message);
      toast.actionError(requestError, message, `sale-document-replacement:${saleId}:create:error`);
      return null;
    } finally {
      setSaving(false);
    }
  }, [enabled, saleId, saving]);

  const saveLines = useCallback(async ({ inBudgetLines, outOfBudgetLines }) => {
    if (!enabled || !saleId || saving || replacement?.status !== 'DRAFT') return null;
    setSaving(true);
    setError('');
    try {
      const next = await replaceSaleDocumentReplacementLines(saleId, { inBudgetLines, outOfBudgetLines });
      setReplacement(next);
      toast.actionSuccess('บันทึกรายการฉบับทดแทนแล้ว', `sale-document-replacement:${saleId}:lines:success`);
      return next;
    } catch (requestError) {
      const message = errorMessage(requestError);
      setError(message);
      toast.actionError(requestError, message, `sale-document-replacement:${saleId}:lines:error`);
      return null;
    } finally {
      setSaving(false);
    }
  }, [enabled, replacement?.status, saleId, saving]);

  const lock = useCallback(async () => {
    if (!enabled || !saleId || saving || replacement?.status !== 'DRAFT') return null;
    setSaving(true);
    setError('');
    try {
      const result = await lockSaleDocumentReplacement(saleId);
      setReplacement(result?.replacement || null);
      toast.actionSuccess('ยืนยันเอกสารฉบับทดแทนแล้ว', `sale-document-replacement:${saleId}:lock:success`);
      await onLocked?.(result);
      return result;
    } catch (requestError) {
      const message = errorMessage(requestError);
      setError(message);
      toast.actionError(requestError, message, `sale-document-replacement:${saleId}:lock:error`);
      return null;
    } finally {
      setSaving(false);
    }
  }, [enabled, onLocked, replacement?.status, saleId, saving]);

  return {
    replacement,
    loading,
    saving,
    error,
    actions: {
      load,
      create,
      saveLines,
      lock,
      clearError: () => setError(''),
    },
  };
};
