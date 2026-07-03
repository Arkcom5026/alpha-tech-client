// src/features/product/templateCandidate/store/templateCandidateStore.js
import { create } from 'zustand';

import {
  listTemplateCandidatesApi,
  getTemplateCandidateApi,
  submitTemplateCandidateApi,
  promoteTemplateCandidateApi,
  rejectTemplateCandidateApi,
  requestTemplateCandidateRevisionApi,
  mergeTemplateCandidateApi,
} from '../api/templateCandidateApi';

import { mapCandidateListResponse, mapCandidateResponse } from '../utils/candidateMapper';

const initialState = {
  candidates: [],
  selectedCandidate: null,
  pagination: null,
  loading: false,
  submitting: false,
  promoting: false,
  error: null,
};

const useTemplateCandidateStore = create((set, get) => ({
  ...initialState,

  clearTemplateCandidateError: () => set({ error: null }),

  resetTemplateCandidateState: () => set({ ...initialState }),

  fetchTemplateCandidates: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await listTemplateCandidatesApi(params);
      const { candidates, pagination } = mapCandidateListResponse(response);
      set({ candidates, pagination, loading: false });
      return candidates;
    } catch (err) {
      set({ error: err, loading: false });
      throw err;
    }
  },

  fetchTemplateCandidateById: async (id) => {
    set({ loading: true, error: null });
    try {
      const candidate = mapCandidateResponse(await getTemplateCandidateApi(id));
      set({ selectedCandidate: candidate, loading: false });
      return candidate;
    } catch (err) {
      set({ error: err, loading: false });
      throw err;
    }
  },

  submitTemplateCandidateAction: async (payload) => {
    set({ submitting: true, error: null });
    try {
      const candidate = mapCandidateResponse(await submitTemplateCandidateApi(payload));
      set((state) => ({
        submitting: false,
        selectedCandidate: candidate,
        candidates: candidate?.id
          ? [candidate, ...state.candidates.filter((item) => Number(item.id) !== Number(candidate.id))]
          : state.candidates,
      }));
      return candidate;
    } catch (err) {
      set({ error: err, submitting: false });
      throw err;
    }
  },

  promoteTemplateCandidateAction: async (id, payload = {}) => {
    set({ promoting: true, error: null });
    try {
      const candidate = mapCandidateResponse(await promoteTemplateCandidateApi(id, payload));
      set((state) => ({
        promoting: false,
        selectedCandidate: candidate,
        candidates: state.candidates.map((item) =>
          Number(item.id) === Number(id) ? { ...item, ...candidate } : item
        ),
      }));
      return candidate;
    } catch (err) {
      set({ error: err, promoting: false });
      throw err;
    }
  },

  rejectTemplateCandidateAction: async (id, payload = {}) => {
    set({ loading: true, error: null });
    try {
      const candidate = mapCandidateResponse(await rejectTemplateCandidateApi(id, payload));
      set((state) => ({
        loading: false,
        selectedCandidate: candidate,
        candidates: state.candidates.map((item) =>
          Number(item.id) === Number(id) ? { ...item, ...candidate } : item
        ),
      }));
      return candidate;
    } catch (err) {
      set({ error: err, loading: false });
      throw err;
    }
  },

  requestTemplateCandidateRevisionAction: async (id, payload = {}) => {
    set({ loading: true, error: null });
    try {
      const candidate = mapCandidateResponse(await requestTemplateCandidateRevisionApi(id, payload));
      set((state) => ({
        loading: false,
        selectedCandidate: candidate,
        candidates: state.candidates.map((item) =>
          Number(item.id) === Number(id) ? { ...item, ...candidate } : item
        ),
      }));
      return candidate;
    } catch (err) {
      set({ error: err, loading: false });
      throw err;
    }
  },

  mergeTemplateCandidateAction: async (id, payload = {}) => {
    set({ loading: true, error: null });
    try {
      const candidate = mapCandidateResponse(await mergeTemplateCandidateApi(id, payload));
      set((state) => ({
        loading: false,
        selectedCandidate: candidate,
        candidates: state.candidates.map((item) =>
          Number(item.id) === Number(id) ? { ...item, ...candidate } : item
        ),
      }));
      return candidate;
    } catch (err) {
      set({ error: err, loading: false });
      throw err;
    }
  },
}));

export default useTemplateCandidateStore;
