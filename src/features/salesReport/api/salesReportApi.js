

/* =========================
   salesReportApi.js
========================= */

import apiClient from '@/utils/apiClient';

const buildSalesReportQueryParams = (params = {}) => {
  try {
    const searchParams = new URLSearchParams();

    if (params.keyword?.trim()) searchParams.set('q', params.keyword.trim());
    if (params.paymentMethod && params.paymentMethod !== 'ALL') {
      searchParams.set('paymentMethod', params.paymentMethod);
    }
    if (params.status && params.status !== 'ALL') {
      searchParams.set('status', params.status);
    }
    if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.set('dateTo', params.dateTo);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

    return searchParams.toString();
  } catch (error) {
    console.error('[salesReportApi.buildSalesReportQueryParams] error:', error);
    return '';
  }
};

const withQueryString = (path, params = {}) => {
  try {
    const queryString = buildSalesReportQueryParams(params);
    return queryString ? `${path}?${queryString}` : path;
  } catch (error) {
    console.error('[salesReportApi.withQueryString] error:', error);
    return path;
  }
};

export const getSalesDashboard = async (params = {}) => {
  try {
    const response = await apiClient.get(withQueryString('/sales-reports/dashboard', params));
    return response?.data;
  } catch (error) {
    console.error('[salesReportApi.getSalesDashboard] error:', error);
    throw error;
  }
};

export const getSalesList = async (params = {}) => {
  try {
    const response = await apiClient.get(withQueryString('/sales-reports/list', params));
    return response?.data;
  } catch (error) {
    console.error('[salesReportApi.getSalesList] error:', error);
    throw error;
  }
};

export const getProductPerformance = async (params = {}) => {
  try {
    const response = await apiClient.get(
      withQueryString('/sales-reports/product-performance', params)
    );
    return response?.data;
  } catch (error) {
    console.error('[salesReportApi.getProductPerformance] error:', error);
    throw error;
  }
};

export const getSalesDetail = async (saleId) => {
  try {
    if (!saleId) {
      throw new Error('saleId is required');
    }

    const response = await apiClient.get(`/sales-reports/detail/${saleId}`);
    return response?.data;
  } catch (error) {
    console.error('[salesReportApi.getSalesDetail] error:', error);
    throw error;
  }
};

const salesReportApi = {
  getSalesDashboard,
  getSalesList,
  getProductPerformance,
  getSalesDetail,
};

export default salesReportApi;


