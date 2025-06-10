import apiClient from '@/utils/apiClient';

// ค้นหาลูกค้าด้วยเบอร์โทร
export const getCustomerByPhone = async (phone) => {
  try {
    const res = await apiClient.get(`/customers/by-phone/${phone}`);
    return res.data;
  } catch (error) {
    console.error('❌ [getCustomerByPhone] error:', error);
    throw error;
  }
};

// สร้างลูกค้าใหม่แบบด่วน
export const createCustomer = async (data) => {
  try {
    const res = await apiClient.post('/customers', data);
    return res.data;
  } catch (error) {
    console.error('❌ [createCustomer] error:', error);
    throw error;
  }
};

// ✅ อัปเดตข้อมูลลูกค้า (name, address, email)
export const updateCustomer = async (id, data) => {
  try {
    const res = await apiClient.put(`/customers/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('❌ [updateCustomer] error:', error);
    throw error;
  }
};
