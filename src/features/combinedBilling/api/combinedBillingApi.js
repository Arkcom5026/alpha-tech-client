import apiClient from '@/utils/apiClient';

// ✅ ดึงใบส่งของที่สามารถรวมบิลได้
export const getCombinableSales = async () => {
  try {
    const res = await apiClient.get('/combined-billing/combinable-sales');
    return res.data;
  } catch (error) {
    console.error('getCombinableSales error:', error);
    throw error;
  }
};

// ✅ สร้าง Combined Billing Document
export const createCombinedBillingDocument = async (saleIds, note = '') => {
  try {
    const res = await apiClient.post('/combined-billing/create', {
      saleIds,
      note,
    });
    return res.data;
  } catch (error) {
    console.error('createCombinedBillingDocument error:', error);
    throw error;
  }
};

// ✅ ดึงรายละเอียด Combined Billing Document
export const getCombinedBillingById = async (id) => {
  try {
    const res = await apiClient.get(`/combined-billing/${id}`);
    return res.data;
  } catch (error) {
    console.error('getCombinedBillingById error:', error);
    throw error;
  }
};

// ✅ ดึงรายชื่อลูกค้าที่มีใบส่งของค้างรวมบิล
export const getCustomersWithPendingSales = async () => {
  try {
    const res = await apiClient.get('/combined-billing/with-pending-sales');
    console.log('getCustomersWithPendingSales : ',res)
    return res.data;
  } catch (error) {
    console.error('getCustomersWithPendingSales error:', error);
    throw error;
  }
};
