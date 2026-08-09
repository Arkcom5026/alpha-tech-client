import { useCallback, useState } from 'react';
import useCustomerStore from '@/features/customer/store/customerStore';

const normalizeResults = (payload) => (
  Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : []
);

export const useCustomerMoneyReceiveCustomerSearch = () => {
  const searchCustomers = useCustomerStore((state) => state.searchStoreCustomersAction);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = useCallback(async () => {
    const text = String(query || '').trim();
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
      const next = normalizeResults(payload);
      setResults(next);
      if (next.length === 0) setError('ไม่พบลูกค้าในร้านนี้');
    } catch (err) {
      setResults([]);
      setError(err?.message || 'ค้นหาลูกค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [query, searchCustomers]);

  const select = useCallback((customer) => {
    setSelectedCustomer(customer);
    setResults([]);
    setError('');
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelectedCustomer(null);
    setError('');
  }, []);

  return { query, setQuery, results, selectedCustomer, loading, error, submit, select, clear };
};
