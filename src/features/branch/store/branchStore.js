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

const ONLINE_LAST_BRANCH_KEY = 'online_last_branch_id';

const safeSetLastBranchId = (branchId) => {
  try {
    if (branchId) localStorage.setItem(ONLINE_LAST_BRANCH_KEY, String(branchId));
  } catch (_) {}
};

const safeGetLastBranchId = () => {
  try {
    const v = localStorage.getItem(ONLINE_LAST_BRANCH_KEY);
    return v ? Number(v) : null;
  } catch (_) {
    return null;
  }
};

const normalizeNumber = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

export const useBranchStore = create(
  persist(
    (set, get) => ({
      branches: [],
      currentBranch: null,
      selectedBranchId: null,
      version: 0,

      loadAllBranchesAction: async () => {
        try {
          const data = await getAllBranches();
          set({ branches: Array.isArray(data) ? data : [] });

          try {
            await get().ensureSelectedBranchAction();
          } catch (innerErr) {
            console.warn('ensureSelectedBranchAction failed:', innerErr);
          }
        } catch (err) {
          console.error('loadAllBranchesAction error:', err);
        }
      },

      fetchBranchesAction: async () => {
        await get().loadAllBranchesAction();
      },

      setCurrentBranch: (branch) => {
        if (!branch || !branch.id) {
          set({ currentBranch: null, selectedBranchId: null });
        } else {
          set({ currentBranch: branch, selectedBranchId: branch.id });
        }
      },

      clearBranch: () => {
        set({ currentBranch: null, selectedBranchId: null });
        localStorage.removeItem('branch-storage');
      },

      clearStorage: () => {
        set({ currentBranch: null, selectedBranchId: null });
        localStorage.removeItem('branch-storage');
      },

      loadAndSetBranchById: async (branchId) => {
        try {
          const targetId = normalizeNumber(branchId);
          if (!targetId) return null;

          const cachedBranch = get().currentBranch;
          if (cachedBranch?.id && Number(cachedBranch.id) === targetId) {
            set({ currentBranch: cachedBranch, selectedBranchId: targetId });

            Promise.resolve()
              .then(async () => {
                const freshBranch = await getBranchById(targetId);
                if (freshBranch?.id && Number(get().selectedBranchId) === targetId) {
                  set({ currentBranch: freshBranch, selectedBranchId: freshBranch.id });
                }
              })
              .catch((refreshErr) => {
                console.warn('background branch refresh failed:', refreshErr);
              });

            return cachedBranch;
          }

          const branch = await getBranchById(targetId);
          console.log('loadAndSetBranchById : ', branch);
          set({ currentBranch: branch, selectedBranchId: branch.id });
          return branch;
        } catch (err) {
          console.error('loadAndSetBranchById error:', err);
          return null;
        }
      },

      setSelectedBranchId: (id) =>
        set((state) => {
          const nextId = id ? Number(id) : null;
          const list = Array.isArray(state.branches) ? state.branches : [];
          const found = nextId ? list.find((b) => Number(b.id) === Number(nextId)) : null;

          if (nextId) safeSetLastBranchId(nextId);

          return {
            selectedBranchId: nextId,
            currentBranch: found || state.currentBranch || null,
            version: (state.version || 0) + 1,
          };
        }),

      getBranchNameById: (id) => {
        const { branches } = get();
        const found = branches.find((b) => Number(b.id) === Number(id));
        return found ? found.name : 'ไม่พบสาขา';
      },

      ensureSelectedBranchAction: async () => {
        const state = get();
        const list = Array.isArray(state.branches) ? state.branches : [];
        if (list.length === 0) return false;

        if (state.selectedBranchId && list.some((b) => Number(b.id) === Number(state.selectedBranchId))) {
          return true;
        }

        if (state.currentBranch?.id && list.some((b) => Number(b.id) === Number(state.currentBranch.id))) {
          state.setSelectedBranchId(state.currentBranch.id);
          return true;
        }

        const last = safeGetLastBranchId();
        if (last && list.some((b) => Number(b.id) === Number(last))) {
          state.setSelectedBranchId(last);
          return true;
        }

        try {
          const ok = await state.autoDetectAndSetBranchByGeo();
          if (ok && get().selectedBranchId) return true;
        } catch (_) {}

        state.setSelectedBranchId(list[0].id);
        return true;
      },

      autoDetectAndSetBranchByGeo: async () => {
        try {
          const { findNearestBranchByLocation, setSelectedBranchId } = get();
          if (!navigator.geolocation) return false;

          return await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const lat = normalizeNumber(pos.coords.latitude);
                const lng = normalizeNumber(pos.coords.longitude);

                if (lat == null || lng == null) {
                  resolve(false);
                  return;
                }

                const nearest = findNearestBranchByLocation(lat, lng);
                if (nearest) {
                  set({ currentBranch: nearest });
                  setSelectedBranchId(nearest.id);
                  resolve(true);
                } else {
                  resolve(false);
                }
              },
              () => resolve(false)
            );
          });
        } catch (err) {
          console.error('autoDetectAndSetBranchByGeo error:', err);
          return false;
        }
      },

      findNearestBranchByLocation: (lat, lng) => {
        const { branches } = get();
        if (!branches.length) return null;

        const userLat = normalizeNumber(lat);
        const userLng = normalizeNumber(lng);
        if (userLat == null || userLng == null) return null;

        const userLoc = { latitude: userLat, longitude: userLng };
        let nearest = null;
        let minDist = Infinity;

        branches.forEach((b) => {
          const bLat = normalizeNumber(b.latitude);
          const bLng = normalizeNumber(b.longitude);
          if (bLat == null || bLng == null) return;

          const branchLoc = { latitude: bLat, longitude: bLng };
          const dist = haversine(userLoc, branchLoc);
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
          console.error('getBranchByIdAction error:', err);
          return null;
        }
      },

      createBranchAction: async (data) => {
        try {
          const newBranch = await createBranch(data);
          set((state) => ({ branches: [...state.branches, newBranch] }));
          return newBranch;
        } catch (err) {
          console.error('createBranchAction error:', err);
          throw err;
        }
      },

      updateBranchAction: async (id, data) => {
        try {
          const updated = await updateBranch(id, data);
          set((state) => ({ branches: state.branches.map((b) => (b.id === id ? updated : b)) }));
          return updated;
        } catch (err) {
          console.error('updateBranchAction error:', err);
          throw err;
        }
      },

      deleteBranchAction: async (id) => {
        try {
          await deleteBranch(id);
          set((state) => ({ branches: state.branches.filter((b) => b.id !== id) }));
        } catch (err) {
          console.error('deleteBranchAction error:', err);
          throw err;
        }
      },
    }),
    {
      name: 'branch-storage',
      partialize: (state) => ({
        currentBranch: state.currentBranch,
        selectedBranchId: state.selectedBranchId,
        version: state.version,
      }),
    }
  )
);
