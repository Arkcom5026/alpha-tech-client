// src/features/product/create/store/productCreateRuntimeStore.js

import { create } from 'zustand';

const initialFormValues = {
  name: '',
  description: '',
  spec: '',

  productTypeId: '',
  brandId: '',
  unitId: '',

  mode: 'STRUCTURED',
  noSN: false,
  trackSerialNumber: true,
  active: true,

  branchPrice: {
    costPrice: '',
    priceRetail: '',
    priceTechnician: '',
    priceOnline: '',
    priceWholesale: '',
  },
};

const initialState = {
  isProcessing: false,
  showSuccess: false,
  saveLocked: false,
  createdProduct: null,
  errorMessage: '',

  formResetKey: 0,
  formValues: initialFormValues,
  formErrors: {},

  dropdowns: {
    productTypes: [],
    brands: [],
    units: [],
    categories: [],
  },
  dropdownsLoaded: false,
  dropdownsLoading: false,
  brandsLoading: false,

  existingModels: [],
  existingModelsLoading: false,

  selectedFiles: [],
  previewUrls: [],
  captions: [],
  coverIndex: 0,
};

const useProductCreateRuntimeStore = create((set, get) => ({
  ...initialState,

  setFormValue: (field, value) =>
    set((state) => {
      if (field === 'branchPrice') {
        return {
          formValues: {
            ...state.formValues,
            branchPrice: {
              ...state.formValues.branchPrice,
              ...(value || {}),
            },
          },
          formErrors: {
            ...state.formErrors,
            branchPrice: {},
          },
        };
      }

      const nextValues = {
        ...state.formValues,
        [field]: value,
      };

      if (field === 'productTypeId') {
        nextValues.brandId = '';
      }

      return {
        formValues: nextValues,
        formErrors: {
          ...state.formErrors,
          [field]: undefined,
        },
      };
    }),

  setFormValues: (formValues) => set({ formValues }),
  setFormErrors: (formErrors) => set({ formErrors: formErrors || {} }),

  setDropdownsLoading: (dropdownsLoading) => set({ dropdownsLoading }),
  setDropdowns: (dropdowns) =>
    set({
      dropdowns: {
        productTypes: Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes : [],
        brands: Array.isArray(dropdowns?.brands) ? dropdowns.brands : [],
        units: Array.isArray(dropdowns?.units) ? dropdowns.units : [],
        categories: Array.isArray(dropdowns?.categories) ? dropdowns.categories : [],
      },
      dropdownsLoaded: true,
      dropdownsLoading: false,
    }),

  setBrandsLoading: (brandsLoading) => set({ brandsLoading }),
  setBrands: (brands) =>
    set((state) => ({
      dropdowns: {
        ...state.dropdowns,
        brands: Array.isArray(brands) ? brands : [],
      },
      brandsLoading: false,
    })),

  setExistingModelsLoading: (existingModelsLoading) => set({ existingModelsLoading }),
  setExistingModels: (existingModels) =>
    set({
      existingModels: Array.isArray(existingModels) ? existingModels : [],
      existingModelsLoading: false,
    }),

  setSelectedFiles: (selectedFiles) => set({ selectedFiles }),
  setPreviewUrls: (previewUrls) => set({ previewUrls }),
  setCaptions: (captions) => set({ captions }),
  setCoverIndex: (coverIndex) => set({ coverIndex }),

  beginCreate: () =>
    set({
      isProcessing: true,
      showSuccess: false,
      saveLocked: true,
      createdProduct: null,
      errorMessage: '',
      formErrors: {},
    }),

  finishCreateSuccess: (createdProduct) =>
    set({
      isProcessing: false,
      showSuccess: true,
      saveLocked: true,
      createdProduct,
      errorMessage: '',
    }),

  finishCreateError: (message) =>
    set({
      isProcessing: false,
      showSuccess: false,
      saveLocked: false,
      errorMessage: message || 'เกิดข้อผิดพลาดในการบันทึกสินค้า',
    }),

  closeSuccessDialog: () =>
    set({
      showSuccess: false,
    }),

  unlockAfterChange: () => {
    const { saveLocked } = get();
    if (!saveLocked) return;

    set({
      saveLocked: false,
      createdProduct: null,
      errorMessage: '',
      showSuccess: false,
    });
  },

  resetForNextCreate: () =>
    set((state) => ({
      ...initialState,
      formResetKey: state.formResetKey + 1,
    })),

  resetRuntime: () =>
    set({
      ...initialState,
    }),
}));

export default useProductCreateRuntimeStore;
