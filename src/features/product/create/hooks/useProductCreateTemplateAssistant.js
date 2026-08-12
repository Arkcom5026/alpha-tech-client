import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createOperationalProductFromTemplateApi,
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

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const useProductCreateTemplateAssistant = ({ productTypeId, brandId } = {}) => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const search = useCallback(async (query = '') => {
    setLoading(true);
    setErrorMessage('');
    setSelectedTemplate(null);

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

  const selectTemplate = useCallback((template) => {
    setSelectedTemplate(template || null);
    setErrorMessage('');
  }, []);

  const clearTemplate = useCallback(() => {
    setSelectedTemplate(null);
    setErrorMessage('');
  }, []);

  const useTemplate = useCallback(async (template = selectedTemplate) => {
    const templateProductId = Number(template?.templateProductId ?? template?.id);

    if (!Number.isFinite(templateProductId) || templateProductId <= 0) {
      setErrorMessage('ไม่พบ Template Product ID ที่ใช้สร้างสินค้า');
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
  }, [navigate, selectedTemplate]);

  return {
    items,
    selectedTemplate,
    loading,
    cloning,
    errorMessage,
    search,
    selectTemplate,
    clearTemplate,
    useTemplate,
  };
};

export default useProductCreateTemplateAssistant;
