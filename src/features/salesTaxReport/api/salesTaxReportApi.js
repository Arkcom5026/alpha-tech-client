


/**
 * Fetches the sales tax report from the backend using the pre-configured apiClient.
 * The authentication token is automatically handled by the apiClient's interceptor.
 *
 * @param {string} startDate - The start date in ISO format (e.g., '2025-07-01T00:00:00.000Z').
 * @param {string} endDate - The end date in ISO format (e.g., '2025-07-31T23:59:59.999Z').
 * @returns {Promise<object>} A promise that resolves to the sales tax report data.
 * @throws {Error} Throws an error if the API call fails.
 */

import apiClient from "@/utils/apiClient";

export const fetchSalesTaxReport = async (startDate, endDate) => {
  try {
    // ใช้ apiClient.get ในการส่ง request
    // ไม่ต้องใส่ Token ในนี้แล้ว เพราะ interceptor จัดการให้โดยอัตโนมัติ
    const response = await apiClient.get('/reports/sales-tax', {
      // Axios จะแปลง params ให้เป็น query string ใน URL ให้เอง
      // -> /api/reports/sales-tax?startDate=...&endDate=...
      params: {
        startDate,
        endDate,
      },
    });

    // Axios จะคืนข้อมูลที่ได้จาก API กลับมาใน property `data`
    console.log('fetchSalesTaxReport',response.data)
    return response.data;

  } catch (error) {
    console.error('Error fetching sales tax report with apiClient:', error);

    // สร้าง Error message ที่เข้าใจง่ายขึ้นจาก error ของ axios
    const errorMessage = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน';
    
    // ส่งต่อ error เพื่อให้ส่วนที่เรียกใช้ (เช่น Store) นำไปจัดการต่อได้
    throw new Error(errorMessage);
  }
};
