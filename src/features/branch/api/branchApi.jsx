
// api/branchApi.js
import apiClient from '@/utils/apiClient';

export const getAllBranches = async () => {
  try {
    const res = await apiClient.get('/branches');
    
    return res.data;
  } catch (err) {
    console.error('❌ getAllBranches error:', err);
    throw err;
  }
};

export const getBranchById = async (id) => {
  try {
    const res = await apiClient.get(`/branches/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ getBranchById error:', err);
    throw err;
  }
};

export const createBranch = async (data) => {
  try {
    const res = await apiClient.post('/branches', data);
    return res.data;
  } catch (err) {
    console.error('❌ createBranch error:', err);
    throw err;
  }
};

export const updateBranch = async (id, data) => {
  try {
    const res = await apiClient.put(`/branches/${id}`, data);
    return res.data;
  } catch (err) {
    console.error('❌ updateBranch error:', err);
    throw err;
  }
};

export const deleteBranch = async (id) => {
  try {
    const res = await apiClient.delete(`/branches/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ deleteBranch error:', err);
    throw err;
  }
};

export const cloneBranchPrice = async ({ sourceBranchId, targetBranchId }) => {
  try {
    const res = await apiClient.post('/branch-prices/clone', {
      sourceBranchId,
      targetBranchId,
    });
    return res.data;
  } catch (err) {
    console.error('❌ cloneBranchPrice error:', err);
    throw err;
  }
};  

