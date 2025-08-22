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

// ✅ อัปเดตข้อมูลลูกค้า (Online)
export const updateCustomerProfileOnline = async (data) => {
  try {
    const res = await apiClient.patch('/customers/me-online', data);
    return res.data;
  } catch (error) {
    console.error('❌ [updateCustomerProfileOnline] error:', error);
    throw error;
  }
};

// ✅ อัปเดตข้อมูลลูกค้า (POS)
export const updateCustomerProfilePos = async (data) => {
  try {
    const res = await apiClient.patch('/customers/me-pos', data);
    return res.data;
  } catch (error) {
    console.error('❌ [updateCustomerProfilePos] error:', error);
    throw error;
  }
};

// ✅ ดึงข้อมูลลูกค้าที่ login (Online)
export const getMyCustomerProfileOnline = async () => {
  try {
    const res = await apiClient.get('/customers/me');
    return res.data;
  } catch (error) {
    console.error('❌ [getMyCustomerProfileOnline] error:', error);
    throw error;
  }
};

// ✅ ดึงข้อมูลลูกค้าที่ login (POS)
export const getMyCustomerProfilePos = async () => {
  try {
    const res = await apiClient.get('/customers/me');
    return res.data;
  } catch (error) {
    console.error('❌ [getMyCustomerProfilePos] error:', error);
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
