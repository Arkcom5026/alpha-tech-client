import { useCallback, useState } from 'react';

import { executeSaleDocumentLineUpdate } from '../controllers/saleDocumentLineUpdateController';

export const useSaleDocumentLineEditor = ({ saleId, reload } = {}) => {
  const [editingLineKey, setEditingLineKey] = useState(null);
  const [lineDrafts, setLineDrafts] = useState({});
  const [savingLineKey, setSavingLineKey] = useState(null);
  const [error, setError] = useState('');

  const toggle = useCallback((item) => {
    const key = item?.documentLineKey || item?.id;
    if (!key) return;

    setEditingLineKey((current) => {
      if (current === key) return null;
      setLineDrafts((previous) => ({
        ...previous,
        [key]: {
          documentPrefix: item?.documentPrefix || '',
          documentDescriptionRaw: item?.documentDescriptionRaw || '',
          documentSuffix: item?.documentSuffix || '',
        },
      }));
      return key;
    });
  }, []);

  const change = useCallback((item, field, value) => {
    const key = item?.documentLineKey || item?.id;
    if (!key) return;

    setLineDrafts((previous) => ({
      ...previous,
      [key]: {
        documentPrefix: item?.documentPrefix || '',
        documentDescriptionRaw: item?.documentDescriptionRaw || '',
        documentSuffix: item?.documentSuffix || '',
        ...(previous?.[key] || {}),
        [field]: value,
      },
    }));
  }, []);

  const save = useCallback(async (item) => {
    const key = item?.documentLineKey || item?.id;
    if (!key) return { ok: false, error: 'ไม่พบรายการเอกสาร' };

    const draft = {
      documentPrefix: item?.documentPrefix || '',
      documentDescriptionRaw: item?.documentDescriptionRaw || '',
      documentSuffix: item?.documentSuffix || '',
      ...(lineDrafts?.[key] || {}),
    };

    setSavingLineKey(key);
    setError('');

    try {
      const result = await executeSaleDocumentLineUpdate({
        saleId,
        saleItemIds: item?.saleItemIds,
        simpleItemIds: item?.simpleItemIds,
        draft,
        reload,
      });

      if (!result?.ok) {
        setError(result?.error || 'บันทึกข้อความก่อน/หลังสินค้าไม่สำเร็จ');
        return result;
      }

      setEditingLineKey(null);
      setLineDrafts((previous) => {
        const next = { ...(previous || {}) };
        delete next[key];
        return next;
      });
      return result;
    } finally {
      setSavingLineKey(null);
    }
  }, [lineDrafts, reload, saleId]);

  return {
    editingLineKey,
    lineDrafts,
    savingLineKey,
    error,
    actions: { toggle, change, save, clearError: () => setError('') },
  };
};
