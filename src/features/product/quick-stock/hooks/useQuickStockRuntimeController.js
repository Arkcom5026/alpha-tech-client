// src/features/product/quick-stock/hooks/useQuickStockRuntimeController.js

import useQuickStockRuntimeStore from "../store/quickStockRuntimeStore";

import useQuickStockCommitController from "./useQuickStockCommitController";
import useQuickStockDiscoveryController from "./useQuickStockDiscoveryController";
import useQuickStockProductController from "./useQuickStockProductController";
import useQuickStockQueueController from "./useQuickStockQueueController";
import {
  buildPriceFormFromProduct,
  buildProductFormFromProduct,
  getBrandName,
  getProductTypeName,
  getProductUnitName,
} from "../utils/quickStockRuntimeUtils";

const useQuickStockRuntimeController = () => {
  const {
    dropdowns = {},
    dropdownsLoading,
    isLoading,
    loadDropdownsAction,
    searchProductsAction,
    getOperationalProductByTemplateIdAction,
    updateOperationalProductAction,
    deleteOperationalProductAction,
    quickStockIntakeExistingAction,
    createOperationalProductFromTemplateAction,
    createLocalOperationalProductAction,
  } = useQuickStockRuntimeStore();

  const discovery = useQuickStockDiscoveryController({
    dropdowns,
    loadDropdownsAction,
    searchProductsAction,
  });

  const provisionalOperationalProduct =
    discovery.selectedSearchOperationalProduct || null;
  const provisionalIsTemplateOnlySelection =
    !!discovery.selectedTemplateProduct && !provisionalOperationalProduct;
  const provisionalIsOperationalSelection = !!provisionalOperationalProduct?.id;

  const queue = useQuickStockQueueController({
    isOperationalSelection: provisionalIsOperationalSelection,
    isTemplateOnlySelection: provisionalIsTemplateOnlySelection,
  });

  const product = useQuickStockProductController({
    selectedProduct: discovery.selectedProduct,
    selectedTemplateProduct: discovery.selectedTemplateProduct,
    selectedSearchOperationalProduct: discovery.selectedSearchOperationalProduct,
    productList: discovery.productList,
    setSelectedProductId: discovery.setSelectedProductId,
    setShowSearchResult: discovery.setShowSearchResult,
    setRuntimeSearchProducts: discovery.setRuntimeSearchProducts,
    selectedProductTypeId: discovery.selectedProductTypeId,
    selectedBrandId: discovery.selectedBrandId,
    keyword: discovery.keyword,
    committedKeyword: discovery.committedKeyword,
    resetQueue: queue.resetQueue,
    executeProductSearch: discovery.executeProductSearch,

    getOperationalProductByTemplateIdAction,
    createOperationalProductFromTemplateAction,
    createLocalOperationalProductAction,
    updateOperationalProductAction,
    deleteOperationalProductAction,
  });

  const commit = useQuickStockCommitController({
    operationalProduct: product.operationalProduct,
    selectedProduct: discovery.selectedProduct,
    isTemplateOnlySelection: product.isTemplateOnlySelection,
    isOperationalSelection: product.isOperationalSelection,
    isCheckingOperationalProduct: product.isCheckingOperationalProduct,
    isCreatingOperationalProduct: product.isCreatingOperationalProduct,
    defaultCost: product.defaultCost,
    priceForm: product.priceForm,
    barcodeQueue: queue.barcodeQueue,
    queueReady: queue.queueReady,
    resetQueue: queue.resetQueue,
    quickStockIntakeExistingAction,
  });

  const noSearchResults =
    discovery.showSearchResult &&
    discovery.committedKeyword &&
    discovery.filteredProducts.length === 0 &&
    !isLoading;


  return {
    dropdowns,
    dropdownsLoading,
    isLoading,

    ...discovery,
    ...product,
    ...queue,
    ...commit,

    noSearchResults,
    getBrandName,
    getProductTypeName,
    getProductUnitName,
    buildProductFormFromProduct,
    buildPriceFormFromProduct,
  };
};

export default useQuickStockRuntimeController;
