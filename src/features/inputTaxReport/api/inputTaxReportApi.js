// src/features/inputTaxReport/api/inputTaxReportApi.js

import apiClient from '@/utils/apiClient';

/**
 * ฟังก์ชันสำหรับเรียก API เพื่อดึงข้อมูลรายงานภาษีซื้อจาก Backend
 * @param {object} filters - object ที่มีค่า filter ต่างๆ เช่น { taxMonth, taxYear }
 * @returns {Promise<object>} - Promise ที่จะ resolve เป็น object ที่มี data และ summary จาก API
 */
export const getInputTaxReport = async (filters) => {
  
  try {
    // 1. สร้าง object สำหรับ params โดยคัดลอกเฉพาะค่าที่มีอยู่จริง
    const validFilters = {};
    if (filters.taxMonth) {
      validFilters.taxMonth = filters.taxMonth;
    }
    if (filters.taxYear) {
      validFilters.taxYear = filters.taxYear;
    }

    // 2. เรียกใช้ apiClient.get ไปยัง endpoint ของรายงานภาษีซื้อ
    const response = await apiClient.get('/input-tax-reports', {
      params: validFilters,
    });

    // 3. คืนค่า data ที่ได้จาก response
    return response.data;

  } catch (error) {
    // จัดการกับ Network error หรือ Error ที่โยนมาจาก apiClient
    console.error('❌ [getInputTaxReport] error:', error);
    // โยน error ต่อไปเพื่อให้ store หรือ component ที่เรียกใช้สามารถจัดการได้
    throw error;
  }
};
