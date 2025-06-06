import apiClient from '@/utils/apiClient';

// ค้นหาลูกค้าด้วยเบอร์โทร
export const getCustomerByPhone = async (phone) => {
  const res = await apiClient.get(`/customers/by-phone/${phone}`);
  return res.data;
};

// สร้างลูกค้าใหม่แบบด่วน
export const createCustomer = async (data) => {
  const res = await apiClient.post('/customers', data);
  return res.data;
};
