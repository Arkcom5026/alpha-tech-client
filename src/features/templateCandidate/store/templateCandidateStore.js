import { create } from 'zustand';

import {
  listTemplateCandidatesApi,
  getTemplateCandidateApi,
  createTemplateCandidateApi,
  startTemplateCandidateReviewApi,
  promoteTemplateCandidateApi,
  rejectTemplateCandidateApi,
  mergeTemplateCandidateApi,
} from '../api/templateCandidateApi';
import { mapCandidateListResponse, mapCandidateResponse } from '../utils/candidateMapper';

const initialState = {
  candidates: [],
  selectedCandidate: null,
  pagination: null,
  summary: { total: 0, byStatus: {} },
  reviewerWorkload: [],
  loading: false,
  mutating: false,
  error: null,
};

const replaceCandidate = (items, candidate) =>
  candidate?.id
    ? items.map((item) => (Number(item.id) === Number(candidate.id) ? { ...item, ...candidate } : item))
    : items;

const useTemplateCandidateStore = create((set) => ({
  ...initialState,

  clearTemplateCandidateError: () => set({ error: null }),
  resetTemplateCandidateState: () => set({ ...initialState }),

  fetchTemplateCandidates: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const mapped = mapCandidateListResponse(await listTemplateCandidatesApi(params));
      set({ ...mapped, loading: false });
      return mapped;
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  fetchTemplateCandidateById: async (id) => {
    set({ loading: true, error: null });
    try {
      const candidate = mapCandidateResponse(await getTemplateCandidateApi(id));
      set({ selectedCandidate: candidate, loading: false });
      return candidate;
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  createTemplateCandidateAction: async (payload) => {
    set({ mutating: true, error: null });
    try {
      const candidate = mapCandidateResponse(await createTemplateCandidateApi(payload));
      set((state) => ({
        mutating: false,
        selectedCandidate: candidate,
        candidates: candidate?.id
          ? [candidate, ...state.candidates.filter((item) => Number(item.id) !== Number(candidate.id))]
          : state.candidates,
      }));
      return candidate;
    } catch (error) {
      set({ error, mutating: false });
      throw error;
    }
  },

  startTemplateCandidateReviewAction: async (id) => {
    set({ mutating: true, error: null });
    try {
      const candidate = mapCandidateResponse(await startTemplateCandidateReviewApi(id));
      set((state) => ({
        mutating: false,
        selectedCandidate: candidate,
        candidates: replaceCandidate(state.candidates, candidate),
      }));
      return candidate;
    } catch (error) {
      set({ error, mutating: false });
      throw error;
    }
  },

  rejectTemplateCandidateAction: async (id, payload = {}) => {
    set({ mutating: true, error: null });
    try {
      const candidate = mapCandidateResponse(await rejectTemplateCandidateApi(id, payload));
      set((state) => ({
        mutating: false,
        selectedCandidate: candidate,
        candidates: replaceCandidate(state.candidates, candidate),
      }));
      return candidate;
    } catch (error) {
      set({ error, mutating: false });
      throw error;
    }
  },

  mergeTemplateCandidateAction: async (id, payload = {}) => {
    set({ mutating: true, error: null });
    try {
      const candidate = mapCandidateResponse(await mergeTemplateCandidateApi(id, payload));
      set((state) => ({
        mutating: false,
        selectedCandidate: candidate,
        candidates: replaceCandidate(state.candidates, candidate),
      }));
      return candidate;
    } catch (error) {
      set({ error, mutating: false });
      throw error;
    }
  },

  promoteTemplateCandidateAction: async (id, payload = {}) => {
    set({ mutating: true, error: null });
    try {
      const candidate = mapCandidateResponse(await promoteTemplateCandidateApi(id, payload));
      set((state) => ({
        mutating: false,
        selectedCandidate: candidate,
        candidates: replaceCandidate(state.candidates, candidate),
      }));
      return candidate;
    } catch (error) {
      set({ error, mutating: false });
      throw error;
    }
  },
}));

export default useTemplateCandidateStore;
