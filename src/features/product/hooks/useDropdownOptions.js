// ✅ Frontend Hook: useDropdownOptions.js
// ตำแหน่งไฟล์: src/features/product/hooks/useDropdownOptions.js

import { useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';

export default function useDropdownOptions() {
  const [data, setData] = useState({
    categories: [],
    productTypes: [],
    productTemplates: [],
    productProfiles: [],
    units: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/products/dropdowns');
        setData(res.data);
      } catch (err) {
        console.error('โหลด dropdown ล้มเหลว:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { ...data, loading, error };
}
