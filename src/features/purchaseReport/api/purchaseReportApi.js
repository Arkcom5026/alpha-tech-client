// src/features/purchaseReport/api/purchaseReportApi.js

import apiClient from '@/utils/apiClient';

/**
 * ฟังก์ชันสำหรับเรียก API เพื่อดึงข้อมูลรายงานการจัดซื้อ (แบบแยกรายการสินค้า)
 * @param {object} filters - object ที่มีค่า filter ต่างๆ
 * @returns {Promise<object>} - Promise ที่จะ resolve เป็น object ที่มี data และ summary จาก API
 */
export const getPurchaseReport = async (filters) => {
  console.log('Fetching itemized purchase report from backend with filters:', filters);
  try {
    // 1. สร้าง object สำหรับ params โดยคัดลอกเฉพาะค่าที่มีอยู่จริงและไม่ใช่ 'all'
    // และไม่รวม branchId เพราะจะถูกจัดการโดย Backend โดยอัตโนมัติ
    const validFilters = {};
    for (const key in filters) {
      if (key !== 'branchId' && filters[key] && filters[key] !== 'all') {
        validFilters[key] = filters[key];
      }
    }

    // 2. เรียกใช้ apiClient.get โดยส่ง params เข้าไปโดยตรง
    // axios จะจัดการแปลงเป็น query string ให้เอง
    const response = await apiClient.get('/purchase-reports', {
      params: validFilters,
    });

    // 3. คืนค่า data ที่ได้จาก response
    // apiClient จะจัดการเรื่อง token และ error เบื้องต้นให้แล้ว
    return response.data;

  } catch (error) {
    // จัดการกับ Network error หรือ Error ที่โยนมาจาก apiClient
    console.error('❌ [getPurchaseReport] error:', error);
    // โยน error ต่อไปเพื่อให้ store หรือ component ที่เรียกใช้สามารถจัดการได้
    throw error;
  }
};

/**
 * ✨ ฟังก์ชันใหม่: สำหรับเรียก API เพื่อดึงข้อมูลรายงานสรุปตามใบรับ
 * @param {object} filters - object ที่มีค่า filter ต่างๆ (ใช้ filter ชุดเดียวกันได้)
 * @returns {Promise<object>} - Promise ที่จะ resolve เป็น object ที่มีข้อมูลสรุปของแต่ละใบรับ
 */
export const getPurchaseReceiptSummaryReport = async (filters) => {
  console.log('Fetching receipt summary report from backend with filters:', filters);
  try {
    const validFilters = {};
    for (const key in filters) {
      if (key !== 'branchId' && filters[key] && filters[key] !== 'all') {
        validFilters[key] = filters[key];
      }
    }

    // เรียก API ไปยัง endpoint ใหม่สำหรับรายงานสรุป (ต้องสร้างที่ Backend ต่อไป)
    const response = await apiClient.get('/purchase-reports/summary-by-receipt', {
      params: validFilters,
    });

    return response.data;

  } catch (error) {
    console.error('❌ [getPurchaseReceiptSummaryReport] error:', error);
    throw error;
  }
};
