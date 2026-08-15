// src/features/receiving/quick-stock/hooks/useQuickStockDiscoveryController.js

import { useCallback, useEffect, useMemo, useState } from "react";
import { feedback as toast } from '@/design-system';

import {
  dedupeDiscoveryProducts,
  getBrandName,
  getProductBrandId,
  getProductTypeName,
  hideTemplateResultsWhenOperationalExists,
  isOperationalBranchProduct,
  isTemplateCatalogProduct,
  normalizeOperationalProductList,
  normalizeTemplateProductList,
  normalizeText,
  toNumberOrNull,
} from "../utils/quickStockRuntimeUtils";

const useQuickStockDiscoveryController = ({
  dropdowns = {},
  loadDropdownsAction,
  searchProductsAction,
} = {}) => {
  const productTypes = dropdowns?.productTypes || [];
  const brands = dropdowns?.brands || [];
  const units = dropdowns?.units || [];

  const [selectedProductTypeId, setSelectedProductTypeId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [committedKeyword, setCommittedKeyword] = useState("");
  const [showSearchResult, setShowSearchResult] = useState(true);
  const [runtimeSearchProducts, setRuntimeSearchProducts] = useState([]);

  const productList = useMemo(
    () => dedupeDiscoveryProducts(runtimeSearchProducts),
    [runtimeSearchProducts]
  );

  const executeProductSearch = useCallback(async ({
    productTypeId = selectedProductTypeId,
    brandId = selectedBrandId,
    search = committedKeyword,
  } = {}) => {
    const cleanSearch = String(search || "").trim() || undefined;
    const params = {
      productTypeId: productTypeId || undefined,
      brandId: brandId || undefined,
      search: cleanSearch,
      searchText: cleanSearch,
      takeNum: 1000,
      skipNum: 0,
    };

    try {
      const result = await searchProductsAction(params);
      const operationalList = normalizeOperationalProductList(result?.operationalProducts || []);
      const templateList = normalizeTemplateProductList(result?.templateProducts || []);
      const merged = hideTemplateResultsWhenOperationalExists(
        dedupeDiscoveryProducts([...operationalList, ...templateList])
      );

      setRuntimeSearchProducts(merged);
      return merged;
    } catch (err) {
      console.error("QuickStock product search failed:", err);
      setRuntimeSearchProducts([]);
      toast.error(err?.message || "ค้นหาสินค้าไม่สำเร็จ");
      return [];
    }
  }, [selectedProductTypeId, selectedBrandId, committedKeyword, searchProductsAction]);

  useEffect(() => {
    if (typeof loadDropdownsAction === "function") {
      loadDropdownsAction({ productTypeId: selectedProductTypeId });
    }
  }, [loadDropdownsAction, selectedProductTypeId]);

  const filteredProducts = useMemo(() => {
    const brandId = toNumberOrNull(selectedBrandId);
    const q = normalizeText(committedKeyword);

    // ProductType filtering is authoritative on the backend for both sources.
    // Operational search receives the branch-local ProductType id, while
    // Template search maps that id through globalProductTypeId into T01.
    // Re-applying the branch-local id here would incorrectly hide Template rows.
    return productList.filter((product) => {
      if (brandId && Number(getProductBrandId(product)) !== Number(brandId)) return false;
      if (!q) return true;

      const searchable = [
        product?.name,
        product?.title,
        product?.sku,
        product?.barcode,
        product?.model,
        product?.code,
        getBrandName(product),
        getProductTypeName(product),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(q);
    }).sort((a, b) => {
      const sourceRankA = a.__quickStockDiscoverySource === "OPERATIONAL" ? 0 : 1;
      const sourceRankB = b.__quickStockDiscoverySource === "OPERATIONAL" ? 0 : 1;
      if (sourceRankA !== sourceRankB) return sourceRankA - sourceRankB;
      return String(a?.name || "").localeCompare(String(b?.name || ""));
    });
  }, [productList, selectedBrandId, committedKeyword]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;

    return productList.find(
      (product) =>
        `${product.__quickStockDiscoverySource}:${product.id}` === selectedProductId ||
        String(product.id) === String(selectedProductId)
    ) || null;
  }, [productList, selectedProductId]);

  const selectedTemplateProduct = useMemo(
    () => (isTemplateCatalogProduct(selectedProduct) ? selectedProduct : null),
    [selectedProduct]
  );

  const selectedSearchOperationalProduct = useMemo(
    () => (isOperationalBranchProduct(selectedProduct) ? selectedProduct : null),
    [selectedProduct]
  );

  const noSearchResults =
    showSearchResult && committedKeyword && filteredProducts.length === 0;

  return {
    productTypes,
    brands,
    units,

    selectedProductTypeId,
    setSelectedProductTypeId,
    selectedBrandId,
    setSelectedBrandId,
    selectedProductId,
    setSelectedProductId,
    keyword,
    setKeyword,
    committedKeyword,
    setCommittedKeyword,
    showSearchResult,
    setShowSearchResult,
    runtimeSearchProducts,
    setRuntimeSearchProducts,

    productList,
    filteredProducts,
    selectedProduct,
    selectedTemplateProduct,
    selectedSearchOperationalProduct,
    noSearchResults,

    executeProductSearch,
  };
};

export default useQuickStockDiscoveryController;
