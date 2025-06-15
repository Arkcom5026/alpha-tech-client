import apiClient from '@/utils/apiClient';

export const getAllOnlineProducts = async () => {
  try {
    const res = await apiClient.get('/products/online');
    //console.log('getAllOnlineProducts : ',res)
    return res.data;
  } catch (err) {
    console.error('❌ getAllOnlineProducts error:', err);
    throw err;
  }
};

export const getProductById = async (id) => {
  try {
    const res = await apiClient.get(`/products/online/${id}`);
    console.log('getProductById : ',res)
    return res.data;
  } catch (err) {
    console.error(`❌ getProductById error (id: ${id}):`, err);
    throw err;
  }
};

export const searchOnlineProducts = async (query) => {
  try {
    const res = await apiClient.get(`/products/online/search?query=${encodeURIComponent(query)}`);
    return res.data;
  } catch (err) {
    console.error(`❌ searchOnlineProducts error (query: ${query}):`, err);
    throw err;
  }
};

export const clearOnlineProductCache = async () => {
  try {
    const res = await apiClient.post('/products/online/clear-cache');
    return res.data;
  } catch (err) {
    console.error('❌ clearOnlineProductCache error:', err);
    throw err;
  }
};
