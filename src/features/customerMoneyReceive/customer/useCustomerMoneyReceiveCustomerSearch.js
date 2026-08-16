import { useCallback, useRef, useState } from 'react';
import useCustomerStore from '@/features/customer/store/customerStore';

const normalizeResults = (payload) => (
  Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : []
);

export const useCustomerMoneyReceiveCustomerSearch = () => {
  const searchCustomers = useCustomerStore((state) => state.searchStoreCustomersAction);
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef(0);

  const setQuery = useCallback((value) => {
    requestRef.current += 1;
    setQueryState(value);
    setLoading(false);
  }, []);

  const submit = useCallback(async () => {
    const text = String(query || '').trim();
    const requestId = ++requestRef.current;
    const ownsRequest = () => requestRef.current === requestId;
    setError('');
    setSelectedCustomer(null);
    if (!text) {
      setResults([]);
      setError('กรุณากรอกชื่อ เบอร์โทร บริษัท หน่วยงาน อีเมล หรือเลขผู้เสียภาษี');
      return;
    }
    setLoading(true);
    try {
      const payload = await searchCustomers(text);
      if (!ownsRequest()) return;
      const next = normalizeResults(payload);
      setResults(next);
      if (next.length === 0) setError('ไม่พบลูกค้าในร้านนี้');
    } catch (err) {
      if (!ownsRequest()) return;
      setResults([]);
      setError(err?.message || 'ค้นหาลูกค้าไม่สำเร็จ');
    } finally {
      if (ownsRequest()) setLoading(false);
    }
  }, [query, searchCustomers]);

  const select = useCallback((customer) => {
    requestRef.current += 1;
    setSelectedCustomer(customer);
    setResults([]);
    setError('');
    setLoading(false);
  }, []);

  const clear = useCallback(() => {
    requestRef.current += 1;
    setQueryState('');
    setResults([]);
    setSelectedCustomer(null);
    setError('');
    setLoading(false);
  }, []);

  return { query, setQuery, results, selectedCustomer, loading, error, submit, select, clear };
};
