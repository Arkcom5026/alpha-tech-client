// ✅ React Hook: useCreatePO (Frontend Integration)
// File: src/features/purchases/hooks/useCreatePO.js
import { useMutation } from '@tanstack/react-query';

import apiClient from '@/utils/apiClient';

export const useCreatePO = () => {
  return useMutation({
    mutationFn: async (poData) => {
      const response = await apiClient.post('/api/po', poData);
      return response.data;
    },
  });
};
