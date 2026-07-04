import { create } from 'zustand';

const initialState = {
  isProcessing: false,
  showSuccess: false,
  saveLocked: false,
  createdProduct: null,
  formResetKey: 0,
};

const useProductCreateRuntimeStore = create((set) => ({
  ...initialState,

  beginCreate: () =>
    set({
      isProcessing: true,
      showSuccess: false,
      saveLocked: false,
      createdProduct: null,
    }),

  finishCreateSuccess: (createdProduct) =>
    set({
      isProcessing: false,
      showSuccess: true,
      saveLocked: true,
      createdProduct: createdProduct || null,
    }),

  finishCreateError: () =>
    set({
      isProcessing: false,
    }),

  unlockAfterChange: () =>
    set({
      showSuccess: false,
      saveLocked: false,
      createdProduct: null,
    }),

  closeSuccessDialog: () =>
    set({
      showSuccess: false,
    }),

  resetForNextCreate: () =>
    set((state) => ({
      isProcessing: false,
      showSuccess: false,
      saveLocked: false,
      createdProduct: null,
      formResetKey: state.formResetKey + 1,
    })),

  resetRuntime: () => set({ ...initialState }),
}));

export default useProductCreateRuntimeStore;
