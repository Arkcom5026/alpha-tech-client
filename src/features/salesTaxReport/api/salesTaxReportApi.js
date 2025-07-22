
import apiClient from "@/utils/apiClient";

export const fetchSalesTaxReport = async (startDate, endDate) => {
  try {

    const response = await apiClient.get('/sales-reports/sales-tax', {

      params: {
        startDate,
        endDate,
      },
    });


    console.log('fetchSalesTaxReport',response.data)
    return response.data;

  } catch (error) {
    console.error('Error fetching sales tax report with apiClient:', error);


    const errorMessage = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน';

    throw new Error(errorMessage);
  }
};
