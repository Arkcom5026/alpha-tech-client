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

// ✅ อัปเดตข้อมูลลูกค้า (name, address, email) แบบใหม่จาก token
export const updateCustomer = async (data) => {
  try {
    const res = await apiClient.put('/customers/profile', data);
    return res.data;
  } catch (error) {
    console.error('❌ [updateCustomer] error:', error);
    throw error;
  }
};

// 🔍 ค้นหาลูกค้าด้วยชื่อหรือนามสกุล
export const getCustomerByName = async (keyword) => {
  try {
    const res = await apiClient.get(`/customers/by-name`, {
      params: { q: keyword }
    });
    return res.data;
  } catch (error) {
    console.error('❌ [getCustomerByName] error:', error);
    throw error;
  }
};
