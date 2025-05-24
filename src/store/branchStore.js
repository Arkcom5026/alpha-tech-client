// ✅ src/store/branchStore.js
import { create } from 'zustand';
import { listBranch } from '@/features/admin/api/branch';

const useBranchStore = create((set) => ({
  branches: [],

  getBranch: async () => {
    try {
      const res = await listBranch();
      set({ branches: res.data });
    } catch (err) {
      console.log(err);
    }
  },
}));

export default useBranchStore;