// ✅ src/features/auth/api/loginEmployeeApi.js

import api from '@/lib/apiClient';

export const loginEmployee = async ({ email, password }) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });

  return response.data; // ✅ จะได้ { token, role, profile }
};
