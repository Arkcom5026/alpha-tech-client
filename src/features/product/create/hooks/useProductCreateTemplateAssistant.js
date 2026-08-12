import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createOperationalProductFromTemplateApi,
  getProductsForPos,
  searchTemplateProducts,
} from '@/features/product/api/productApi';

const extractTemplateItems = (response) => {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.items,
    response?.data,
    response?.data?.items,
    response?.data?.data,
    response?.result,
    response?.result?.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

const extractOperationalItems = (response) => {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.items,
    response?.rows,
    response?.products,
    response?.data,
    response?.data?.items,
    response?.data?.rows,
    response?.data?.products,
    response?.result,
    response?.result?.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

const extractOperationalProduct = (response) => {
  if (!response) return null;

  const candidates = [
    response?.product,
    response?.data?.product,
    response?.data,
    response?.item,
    response,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate) && candidate?.id) {
      return candidate;
    }
  }

  return null;
};

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .toLocaleLowerCase('th-TH')
    .replace(/\s+/g, ' ');

const getTemplateId = (item) => Number(item?.templateProductId ?? item?.id) || null;

const getProductTypeName = (item) =>
  item?.productTypeName || item?.productType?.name || item?.typeName || '';

const getBrandName = (item) =>
  item?.brandName || item?.brand?.name || '';

const getBarcode = (item) =>
  item?.saleBarcode || item?.barcode || item?.ean || item?.skuBarcode || '';

const dedupeById = (items = []) => {
  const map = new Map();
  items.forEach((item) => {
    const id = Number(item?.id);
    if (!Number.isFinite(id) || id <= 0) return;
    if (!map.has(id)) map.set(id, item);
  });
  return Array.from(map.values());
};

const DUPLICATE_SEARCH_NOISE_TOKENS = new Set([
  'BLACK',
  'WHITE',
  'RED',
  'GREEN',
  'BLUE',
  'YELLOW',
  'CYAN',
  'MAGENTA',
  'GRAY',
  'GREY',
  'GOLD',
  'SILVER',
]);

const buildOperationalSearchTerms = (template = {}) => {
  const name = String(template?.name || '').trim();
  const barcode = String(getBarcode(template) || '').trim();
  const withoutParenthetical = name
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const modelTokens = (name.match(/[A-Za-z0-9][A-Za-z0-9.+#/_-]*/g) || [])
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !DUPLICATE_SEARCH_NOISE_TOKENS.has(token.toUpperCase()));

  const modelTerm = modelTokens.join(' ').trim();
  const terms = [name, withoutParenthetical, modelTerm, barcode]
    .map((term) => String(term || '').trim())
    .filter((term) => term.length >= 2);

  return Array.from(new Set(terms)).slice(0, 5);
};

const scorePotentialDuplicate = (template, product) => {
  const templateName = normalizeText(template?.name);
  const productName = normalizeText(product?.name);
  const templateBrand = normalizeText(getBrandName(template));
  const productBrand = normalizeText(getBrandName(product));
  const templateType = normalizeText(getProductTypeName(template));
  const productType = normalizeText(getProductTypeName(product));
  const templateBarcode = normalizeText(getBarcode(template));
  const productBarcode = normalizeText(getBarcode(product));

  let score = 0;
  const reasons = [];

  if (templateBarcode && productBarcode && templateBarcode === productBarcode) {
    score += 100;
    reasons.push('Barcode ตรงกัน');
  }

  if (templateName && productName && templateName === productName) {
    score += 60;
    reasons.push('ชื่อสินค้าตรงกัน');
  } else if (
    templateName &&
    productName &&
    (templateName.includes(productName) || productName.includes(templateName))
  ) {
    score += 30;
    reasons.push('ชื่อสินค้าใกล้เคียง');
  }

  if (templateBrand && productBrand && templateBrand === productBrand) {
    score += 15;
    reasons.push('แบรนด์ตรงกัน');
  }

  if (templateType && productType && templateType === productType) {
    score += 10;
    reasons.push('ประเภทสินค้าตรงกัน');
  }

  return { score, reasons };
};

const buildPreflightResult = (template, products = []) => {
  const templateProductId = getTemplateId(template);
  const uniqueProducts = dedupeById(products);

  const exactLinkedProduct = uniqueProducts.find(
    (product) => Number(product?.templateProductId) === templateProductId
  ) || null;

  const potentialDuplicates = uniqueProducts
    .filter((product) => product?.id !== exactLinkedProduct?.id)
    .map((product) => ({
      product,
      ...scorePotentialDuplicate(template, product),
    }))
    .filter((item) => item.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    exactLinkedProduct,
    potentialDuplicates,
    checked: true,
  };
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const initialPreflight = {
  checking: false,
  checked: false,
  exactLinkedProduct: null,
  potentialDuplicates: [],
};

const useProductCreateTemplateAssistant = ({ productTypeId, brandId } = {}) => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [preflight, setPreflight] = useState(initialPreflight);

  const search = useCallback(async (query = '') => {
    setLoading(true);
    setErrorMessage('');
    setSelectedTemplate(null);
    setPreflight(initialPreflight);

    try {
      const cleanQuery = String(query || '').trim();
      const response = await searchTemplateProducts({
        search: cleanQuery || undefined,
        searchText: cleanQuery || undefined,
        productTypeId: productTypeId || undefined,
        brandId: brandId || undefined,
        takeNum: 30,
        skipNum: 0,
      });

      const nextItems = extractTemplateItems(response);
      setItems(nextItems);
      return nextItems;
    } catch (error) {
      setItems([]);
      setErrorMessage(getErrorMessage(error, 'ค้นหา Template Product ไม่สำเร็จ'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [productTypeId, brandId]);

  const runPreflight = useCallback(async (template) => {
    if (!template) return initialPreflight;

    setPreflight({ ...initialPreflight, checking: true });

    try {
      const searchTerms = buildOperationalSearchTerms(template);
      const searches = searchTerms.map((searchTerm) =>
        getProductsForPos({ search: searchTerm, takeNum: 30, skipNum: 0 })
      );

      const settled = await Promise.allSettled(searches);
      const products = settled
        .filter((result) => result.status === 'fulfilled')
        .flatMap((result) => extractOperationalItems(result.value));

      const next = buildPreflightResult(template, products);
      setPreflight({ ...next, checking: false });
      return next;
    } catch (error) {
      setPreflight({ ...initialPreflight, checked: true });
      setErrorMessage(getErrorMessage(error, 'ตรวจสอบสินค้าที่มีอยู่ในร้านไม่สำเร็จ'));
      return { ...initialPreflight, checked: true };
    }
  }, []);

  const selectTemplate = useCallback(async (template) => {
    const nextTemplate = template || null;
    setSelectedTemplate(nextTemplate);
    setErrorMessage('');
    setPreflight(initialPreflight);

    if (nextTemplate) {
      await runPreflight(nextTemplate);
    }
  }, [runPreflight]);

  const clearTemplate = useCallback(() => {
    setSelectedTemplate(null);
    setErrorMessage('');
    setPreflight(initialPreflight);
  }, []);

  const openExistingProduct = useCallback((product) => {
    const productId = Number(product?.id);
    if (!Number.isFinite(productId) || productId <= 0) return;
    navigate(`/pos/stock/products/edit/${productId}`);
  }, [navigate]);

  const useTemplate = useCallback(async (template = selectedTemplate) => {
    const templateProductId = Number(template?.templateProductId ?? template?.id);

    if (!Number.isFinite(templateProductId) || templateProductId <= 0) {
      setErrorMessage('ไม่พบ Template Product ID ที่ใช้สร้างสินค้า');
      return null;
    }

    if (!preflight.checked || preflight.checking) {
      setErrorMessage('กรุณารอระบบตรวจสอบสินค้าในร้านก่อนใช้ Template');
      return null;
    }

    setCloning(true);
    setErrorMessage('');

    try {
      const response = await createOperationalProductFromTemplateApi({ templateProductId });
      const product = extractOperationalProduct(response);

      if (!product?.id) {
        throw new Error('สร้าง Product จาก Template แล้วแต่ไม่พบ Operational Product ID');
      }

      navigate(`/pos/stock/products/edit/${product.id}`, {
        state: {
          templateAssistedCreate: true,
          templateProductId,
          cloneCreated: response?.created === true,
        },
      });

      return product;
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'สร้าง Product จาก Template ไม่สำเร็จ'));
      return null;
    } finally {
      setCloning(false);
    }
  }, [navigate, preflight.checked, preflight.checking, selectedTemplate]);

  return {
    items,
    selectedTemplate,
    loading,
    cloning,
    errorMessage,
    preflight,
    search,
    selectTemplate,
    clearTemplate,
    useTemplate,
    openExistingProduct,
  };
};

export default useProductCreateTemplateAssistant;
