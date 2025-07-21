// src/features/inputTaxReport/api/inputTaxReportApi.js

import apiClient from '@/utils/apiClient';


export const getInputTaxReport = async (filters) => {
  
  try {

    const validFilters = {};
    if (filters.month) {
    validFilters.month = filters.month;
  }
    if (filters.year) {
    validFilters.year = filters.year;
  }

    const response = await apiClient.get('/input-tax-reports', {
      params: validFilters,
    });

    return response.data;

  } catch (error) {

    console.error('❌ [getInputTaxReport] error:', error);
    throw error;
  }
};
