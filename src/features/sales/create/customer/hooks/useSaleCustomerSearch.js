import { useCallback, useState } from 'react';

const normalizeResultList = (payload) => (
  Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : []
);

export const useSaleCustomerSearch = ({
  searchCustomers,
  onCustomerNotFound,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelectedResultId(null);
    setError('');
  }, []);

  const submitSearch = useCallback(async () => {
    const text = String(query || '').trim();
    setError('');
    setResults([]);
    setSelectedResultId(null);

    if (!text) {
      setError('กรุณากรอกชื่อ เบอร์โทร บริษัท หน่วยงาน อีเมล หรือเลขผู้เสียภาษี');
      return;
    }

    setLoading(true);
    try {
      const payload = await searchCustomers(text);
      const resultList = normalizeResultList(payload);
      if (resultList.length > 0) {
        setResults(resultList);
        return;
      }

      const digits = text.replace(/\D/g, '');
      await onCustomerNotFound({
        mode: /^\d+$/.test(digits) && digits.length >= 4 ? 'phone' : 'name',
        query: /^\d+$/.test(digits) ? digits : text,
      });
    } catch (searchError) {
      setError(
        searchError?.response?.data?.message ||
        searchError?.message ||
        'ค้นหาลูกค้าไม่สำเร็จ'
      );
    } finally {
      setLoading(false);
    }
  }, [onCustomerNotFound, query, searchCustomers]);

  return {
    query,
    setQuery,
    results,
    setResults,
    selectedResultId,
    setSelectedResultId,
    loading,
    error,
    setError,
    clearSearch,
    submitSearch,
  };
};
