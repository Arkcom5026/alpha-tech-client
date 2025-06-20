// stores/branchStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import haversine from 'haversine-distance';
import {
  createBranch,
  deleteBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
} from '../api/branchApi';

export const useBranchStore = create(
  persist(
    (set, get) => ({
      branches: [],
      currentBranch: null,
      selectedBranchId: null,

      loadAllBranchesAction: async () => {
        try {
          const data = await getAllBranches();
          set({ branches: data });
        } catch (err) {
          console.error('❌ loadAllBranchesAction error:', err);
        }
      },

      setCurrentBranch: (branch) => {
        if (!branch || !branch.id) {
          set({ currentBranch: null, selectedBranchId: null });
        } else {
          set({
            currentBranch: branch,
            selectedBranchId: branch.id,
          });
        }
      },

      setSelectedBranchId: (id) => set({ selectedBranchId: id }),

      getBranchNameById: (id) => {
        const { branches } = get();
        const found = branches.find((b) => b.id === id);
        return found ? found.name : 'ไม่พบสาขา';
      },

      autoDetectAndSetBranchByGeo: async () => {
        try {
          console.log('🌐 [DEBUG] เริ่มตรวจหาสาขาจากพิกัด...');
          const { findNearestBranchByLocation, setSelectedBranchId } = get();
          if (!navigator.geolocation) return false;

          return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                console.log('📍 [DEBUG] พิกัดผู้ใช้:', { lat, lng });

                const nearest = get().findNearestBranchByLocation(lat, lng);
                console.log('🏬 [DEBUG] สาขาใกล้ที่สุด:', nearest);

                if (nearest) {
                  set({
                    currentBranch: nearest,
                    selectedBranchId: nearest.id,
                  });
                  console.log('✅ [DEBUG] ตั้งค่าสาขา:', nearest.id);
                  resolve(true);
                } else {
                  console.warn('⚠️ [DEBUG] ไม่พบสาขาใกล้เคียง');
                  resolve(false);
                }
              },
              (err) => {
                console.warn('📍 ไม่สามารถใช้ตำแหน่ง:', err);
                resolve(false);
              }
            );
          });
        } catch (err) {
          console.error('❌ autoDetectAndSetBranchByGeo error:', err);
          return false;
        }
      },

      findNearestBranchByLocation: (lat, lng) => {
        const { branches } = get();
        console.log('📦 [DEBUG] findNearestBranchByLocation → branches:', branches);
        if (!branches.length) return null;

        const userLoc = { latitude: lat, longitude: lng };
        let nearest = null;
        let minDist = Infinity;

        branches.forEach((b) => {
          if (!b.latitude || !b.longitude) return;
          const branchLoc = { latitude: b.latitude, longitude: b.longitude };
          const dist = haversine(userLoc, branchLoc);
          console.log(`📏 [DEBUG] ${b.name} ห่าง ${Math.round(dist)} เมตร`);
          if (dist < minDist) {
            minDist = dist;
            nearest = b;
          }
        });

        return nearest;
      },

      findBranchByDistrict: (districtName) => {
        const { branches } = get();
        return branches.find((b) => b.district?.includes(districtName));
      },

      getBranchByIdAction: async (id) => {
        try {
          return await getBranchById(id);
        } catch (err) {
          console.error('❌ getBranchByIdAction error:', err);
          return null;
        }
      },

      createBranchAction: async (data) => {
        try {
          const newBranch = await createBranch(data);
          set((state) => ({ branches: [...state.branches, newBranch] }));
          return newBranch;
        } catch (err) {
          console.error('❌ createBranchAction error:', err);
          throw err;
        }
      },

      updateBranchAction: async (id, data) => {
        try {
          const updated = await updateBranch(id, data);
          set((state) => ({
            branches: state.branches.map((b) => (b.id === id ? updated : b)),
          }));
          return updated;
        } catch (err) {
          console.error('❌ updateBranchAction error:', err);
          throw err;
        }
      },

      deleteBranchAction: async (id) => {
        try {
          await deleteBranch(id);
          set((state) => ({
            branches: state.branches.filter((b) => b.id !== id),
          }));
        } catch (err) {
          console.error('❌ deleteBranchAction error:', err);
          throw err;
        }
      },
    }),
    {
      name: 'branch-storage',
      partialize: (state) => ({
        selectedBranchId: state.selectedBranchId,
      }),
    }
  )
);
