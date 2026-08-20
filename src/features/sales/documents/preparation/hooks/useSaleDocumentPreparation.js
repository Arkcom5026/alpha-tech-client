import { useCallback, useEffect, useRef, useState } from 'react';
import { feedback as toast } from '@/design-system';
import {
  createSaleDocumentPreparation,
  getSaleDocumentPreparation,
  lockSaleDocumentPreparation,
  replaceSaleDocumentPreparationLines,
} from '../api/saleDocumentPreparationApi';

const errorMessage = (error) => (
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'ไม่สามารถดำเนินการแบบร่างเอกสารได้'
);

export const useSaleDocumentPreparation = ({ saleId, enabled = true } = {}) => {
  const [preparation, setPreparation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef(0);

  const load = useCallback(async ({ reportError = false } = {}) => {
    if (!enabled || !saleId) {
      setPreparation(null);
      return null;
    }

    const requestId = ++requestRef.current;
    setLoading(true);
    setError('');
    try {
      const next = await getSaleDocumentPreparation(saleId);
      if (requestId === requestRef.current) setPreparation(next);
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
    setPreparation(null);
    setError('');
    if (enabled && saleId) load();
  }, [enabled, load, saleId]);

  const ensure = useCallback(async () => {
    if (!enabled || !saleId || saving) return null;
    setSaving(true);
    setError('');
    try {
      const next = await createSaleDocumentPreparation(saleId);
      setPreparation(next);
      toast.actionSuccess('เริ่มแบบร่างเอกสารแล้ว', `sale-document-preparation:${saleId}:create:success`);
      return next;
    } catch (requestError) {
      const message = errorMessage(requestError);
      setError(message);
      toast.actionError(requestError, message, `sale-document-preparation:${saleId}:create:error`);
      return null;
    } finally {
      setSaving(false);
    }
  }, [enabled, saleId, saving]);

  const saveLines = useCallback(async (lines) => {
    if (!enabled || !saleId || saving) return null;
    setSaving(true);
    setError('');
    try {
      const next = await replaceSaleDocumentPreparationLines(saleId, lines);
      setPreparation(next);
      toast.actionSuccess('บันทึกแบบร่างเอกสารแล้ว', `sale-document-preparation:${saleId}:lines:success`);
      return next;
    } catch (requestError) {
      const message = errorMessage(requestError);
      setError(message);
      toast.actionError(requestError, message, `sale-document-preparation:${saleId}:lines:error`);
      return null;
    } finally {
      setSaving(false);
    }
  }, [enabled, saleId, saving]);

  const lock = useCallback(async () => {
    if (!enabled || !saleId || saving) return null;
    setSaving(true);
    setError('');
    try {
      const result = await lockSaleDocumentPreparation(saleId);
      setPreparation(result?.preparation || null);
      toast.actionSuccess('ยืนยันแบบร่างเอกสารแล้ว', `sale-document-preparation:${saleId}:lock:success`);
      return result;
    } catch (requestError) {
      const message = errorMessage(requestError);
      setError(message);
      toast.actionError(requestError, message, `sale-document-preparation:${saleId}:lock:error`);
      return null;
    } finally {
      setSaving(false);
    }
  }, [enabled, saleId, saving]);

  return {
    preparation,
    loading,
    saving,
    error,
    actions: {
      load,
      ensure,
      saveLines,
      lock,
      clearError: () => setError(''),
    },
  };
};
