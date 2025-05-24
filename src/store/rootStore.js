// ✅ src/store/rootStore.js

import useAuthStore from './authStore';
import useCartStore from '../features/online/store/cartStore';
import useProductStore from '../features/product/store/productStore';

import useSupplierStore from './supplierStore';
import useBranchStore from './branchStore';
import { useProductTypeStore } from '@/features/productType/store/productTypeStore';


const useRootStore = () => ({
  auth: useAuthStore(),
  cart: useCartStore(),
  product: useProductStore(),
  ProductType: useProductTypeStore(),
  supplier: useSupplierStore(),
  branch: useBranchStore(),
});

export default useRootStore;
