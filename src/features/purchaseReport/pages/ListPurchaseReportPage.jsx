// src/features/purchaseReport/pages/ListPurchaseReportPage.jsx
import React, { useEffect, useCallback } from 'react';

// ตัวอย่างการนำเข้า UI Components จาก Library เช่น Material-UI
import { Box, Typography, Card, CardContent, CardHeader } from '@mui/material';

// นำเข้า components และ store จากใน feature เดียวกัน
import { PurchaseReportTable } from '../components/PurchaseReportTable';
import { PurchaseReportFilters } from '../components/PurchaseReportFilters';
import { usePurchaseReportStore } from '../store/purchaseReportStore';

/**
 * หน้าสำหรับแสดงรายงานการจัดซื้อ (Purchase Report)
 * - ทำหน้าที่เป็น Container หลักสำหรับจัดวาง layout
 * - จัดการการดึงข้อมูลเมื่อ filter มีการเปลี่ยนแปลง
 * - แสดงผล Filters และ Table
 */
export const ListPurchaseReportPage = () => {
  // เชื่อมต่อกับ Zustand store เพื่อเข้าถึง state และ actions
  const {
    filters,
    setFilters,
    reportData,
    summary,
    isLoading,
    fetchPurchaseReport, // action สำหรับดึงข้อมูล
  } = usePurchaseReportStore();

  // สร้างฟังก์ชันสำหรับสั่งให้ดึงข้อมูลด้วย useCallback เพื่อไม่ให้ฟังก์ชันถูกสร้างใหม่ทุกครั้ง
  const handleGenerateReport = useCallback(() => {
    // เรียก action จาก store เพื่อไปดึงข้อมูลจาก API
    fetchPurchaseReport();
  }, [fetchPurchaseReport]);

  // useEffect hook นี้จะทำงานเมื่อ component ถูกสร้างขึ้นครั้งแรก
  // เพื่อดึงข้อมูลรายงานตั้งต้นมาแสดงผล
  useEffect(() => {
    handleGenerateReport();
  }, [handleGenerateReport]);

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}> {/* Responsive padding */}
      <Typography variant="h4" component="h1" gutterBottom>
        รายงานการจัดซื้อ
      </Typography>

      {/* ส่วนสำหรับกรองข้อมูล */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <PurchaseReportFilters
            filters={filters}
            onFiltersChange={setFilters}
            onGenerateReport={handleGenerateReport}
            isGenerating={isLoading}
          />
        </CardContent>
      </Card>

      {/* ส่วนตารางแสดงผลลัพธ์ */}
      <Card>
        <CardHeader
          title="ผลลัพธ์รายงาน"
        />
        <CardContent>
          <PurchaseReportTable
            data={reportData}
            summary={summary}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

// Export default เพื่อให้รองรับการทำ lazy loading ในอนาคต
export default ListPurchaseReportPage;
