// src/features/inputTaxReport/pages/ListInputTaxReportPage.jsx
import React, { useEffect, useCallback } from 'react';
import { Box, Typography, Card, CardContent, CardHeader, Button } from '@mui/material';

// ✨ นำเข้า components และ store
import { InputTaxReportTable } from '../components/InputTaxReportTable';
import { InputTaxReportFilters } from '../components/InputTaxReportFilters';
import { useInputTaxReportStore } from '../store/inputTaxReporStore';


/**
 * หน้าหลักสำหรับแสดงรายงานภาษีซื้อ
 */
export const ListInputTaxReportPage = () => {
  // เชื่อมต่อกับ store
  const {
    filters,
    setFilters,
    reportData,
    summary,
    isLoading,
    fetchInputTaxReport,
  } = useInputTaxReportStore();

  // ฟังก์ชันสำหรับสั่งให้ดึงข้อมูล
  const handleGenerateReport = useCallback(() => {
    fetchInputTaxReport();
  }, [fetchInputTaxReport]);

  // ดึงข้อมูลครั้งแรกเมื่อเปิดหน้า
  useEffect(() => {
    handleGenerateReport();
  }, [handleGenerateReport]);

  const handleExportExcel = () => {
    // TODO: พัฒนาฟังก์ชันสำหรับ Export ข้อมูลเป็น Excel
    alert("ฟังก์ชัน Export to Excel ยังไม่เปิดใช้งาน");
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        รายงานภาษีซื้อ
      </Typography>

      {/* ส่วนสำหรับกรองข้อมูล */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <InputTaxReportFilters
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
          action={
            <Button
              variant="contained"
              color="success"
              onClick={handleExportExcel}
              disabled={isLoading || !reportData || reportData.length === 0}
            >
              Export to Excel
            </Button>
          }
        />
        <CardContent>
          <InputTaxReportTable
            data={reportData}
            summary={summary}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ListInputTaxReportPage;
