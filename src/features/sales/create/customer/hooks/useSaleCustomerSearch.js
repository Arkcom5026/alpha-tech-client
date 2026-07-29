import { useCallback, useState } from 'react';

const normalizeResultList = (result) => {
  if (Array.isArray(result?.results)) return result.results;
  if (Array.isArray(result)) return result;
  return result ? [result] : [];
};

export const useSaleCustomerSearch = ({
  searchByPhone,
  searchByName,
  onCustomerFound,
  onCustomerNotFound,
}) => {
  const [phone, setPhone] = useState('');
  const [rawPhone, setRawPhone] = useState('');
  const [searchMode, setSearchMode] = useState('phone');
  const [nameSearch, setNameSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearSearch = useCallback(() => {
    setPhone('');
    setRawPhone('');
    setNameSearch('');
    setResults([]);
    setSelectedResultId(null);
    setError('');
  }, []);

  const submitSearch = useCallback(async () => {
    setError('');
    setResults([]);
    setSelectedResultId(null);
    setLoading(true);

    try {
      if (searchMode === 'phone') {
        const cleanPhone = phone.replace(/-/g, '');
        if (!/^[0-9]{10}$/.test(cleanPhone)) {
          setError('กรุณากรอกเบอร์โทรให้ถูกต้อง (10 หลัก)');
          return;
        }

        setRawPhone(cleanPhone);
        const found = await searchByPhone(cleanPhone);
        if (found) {
          await onCustomerFound(found);
          return;
        }

        await onCustomerNotFound({ mode: 'phone', query: cleanPhone });
        return;
      }

      const query = nameSearch.trim();
      if (!query) {
        setError('กรุณากรอกชื่อหรือนามสกุลเพื่อค้นหา');
        return;
      }

      const resultList = normalizeResultList(await searchByName(query));
      if (resultList.length > 0) {
        setResults(resultList);
        return;
      }

      await onCustomerNotFound({ mode: 'name', query });
    } finally {
      setLoading(false);
    }
  }, [nameSearch, onCustomerFound, onCustomerNotFound, phone, searchByName, searchByPhone, searchMode]);

  return {
    phone,
    setPhone,
    rawPhone,
    setRawPhone,
    searchMode,
    setSearchMode,
    nameSearch,
    setNameSearch,
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
