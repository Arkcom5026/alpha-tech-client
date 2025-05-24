// ✅ React Hook: useCreatePO (Frontend Integration)
// File: src/features/purchases/hooks/useCreatePO.js
import { useMutation } from '@tanstack/react-query';

import axios from 'axios';

export const useCreatePO = () => {
  return useMutation({
    mutationFn: async (poData) => {
      const response = await axios.post('/api/po', poData);
      return response.data;
    },
  });
};
