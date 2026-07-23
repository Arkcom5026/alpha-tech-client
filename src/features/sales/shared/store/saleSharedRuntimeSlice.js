export const createSaleSharedRuntimeSlice = (set) => ({
  loading: false,

  error: null,

  clearErrorAction: () => set({ error: null }),

  setErrorAction: (msg) => set({ error: msg || null }),
});
