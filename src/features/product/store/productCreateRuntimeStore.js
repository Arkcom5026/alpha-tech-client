import { create } from 'zustand';

const initialState = {
  isProcessing: false,
  showSuccess: false,
  saveLocked: false,
  createdProduct: null,
  formResetKey: 0,
  errorMessage: '',
  selectedFiles: [],
  previewUrls: [],
  captions: [],
  coverIndex: null,
};

const normalizeFiles = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof FileList !== 'undefined' && input instanceof FileList) return Array.from(input);
  return [input];
};

const useProductCreateRuntimeStore = create((set, get) => ({
  ...initialState,

  beginCreate: () =>
    set({
      isProcessing: true,
      showSuccess: false,
      saveLocked: false,
      createdProduct: null,
      errorMessage: '',
    }),

  finishCreateSuccess: (createdProduct) =>
    set({
      isProcessing: false,
      showSuccess: true,
      saveLocked: true,
      createdProduct: createdProduct || null,
      errorMessage: '',
    }),

  finishCreateError: (message) =>
    set({
      isProcessing: false,
      errorMessage: message || 'Save failed',
    }),

  clearError: () => set({ errorMessage: '' }),

  unlockAfterChange: () =>
    set({
      showSuccess: false,
      saveLocked: false,
      createdProduct: null,
      errorMessage: '',
    }),

  closeSuccessDialog: () =>
    set({
      showSuccess: false,
    }),

  setSelectedFiles: (updaterOrValue) => {
    if (typeof updaterOrValue === 'function') {
      const prevArr = normalizeFiles(get().selectedFiles);
      const next = updaterOrValue(prevArr);
      set({ selectedFiles: normalizeFiles(next) });
      return;
    }

    set({ selectedFiles: normalizeFiles(updaterOrValue) });
  },

  setPreviewUrls: (updaterOrValue) => {
    if (typeof updaterOrValue === 'function') {
      set((state) => ({ previewUrls: updaterOrValue(state.previewUrls) }));
      return;
    }
    set({ previewUrls: Array.isArray(updaterOrValue) ? updaterOrValue : [] });
  },

  setCaptions: (updaterOrValue) => {
    if (typeof updaterOrValue === 'function') {
      set((state) => ({ captions: updaterOrValue(state.captions) }));
      return;
    }
    set({ captions: Array.isArray(updaterOrValue) ? updaterOrValue : [] });
  },

  setCoverIndex: (coverIndex) => set({ coverIndex }),

  resetUploadRuntime: () =>
    set({
      selectedFiles: [],
      previewUrls: [],
      captions: [],
      coverIndex: null,
    }),

  resetForNextCreate: () =>
    set((state) => ({
      isProcessing: false,
      showSuccess: false,
      saveLocked: false,
      createdProduct: null,
      formResetKey: state.formResetKey + 1,
      errorMessage: '',
      selectedFiles: [],
      previewUrls: [],
      captions: [],
      coverIndex: null,
    })),

  resetRuntime: () => set({ ...initialState }),
}));

export default useProductCreateRuntimeStore;
