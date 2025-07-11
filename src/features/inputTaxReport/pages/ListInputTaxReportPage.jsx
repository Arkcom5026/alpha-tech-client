// src/features/inputTaxReport/pages/ListInputTaxReportPage.jsx

import React, { useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Card, CardContent, CardHeader, Button } from '@mui/material';
import { useReactToPrint } from 'react-to-print';

// ✨ นำเข้า components และ store
import { InputTaxReportTable } from '../components/InputTaxReportTable';
import { InputTaxReportFilters } from '../components/InputTaxReportFilters';
import { useInputTaxReportStore } from '../store/inputTaxReporStore';
import { useAuthStore } from '../../auth/store/authStore'; // ❗️ หมายเหตุ: คุณต้องเปลี่ยน path นี้ให้ตรงกับ auth store ของคุณ
import { Link } from 'react-router-dom';

// Helper function เพื่อแปลงเลขเดือนเป็นชื่อเดือนภาษาไทย
const getThaiMonthName = (monthNumber) => {
    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return months[monthNumber - 1] || '';
};

/**
 * หน้าหลักสำหรับแสดงรายงานภาษีซื้อ
 */
export const ListInputTaxReportPage = () => {
    const {
        filters,
        setFilters,
        reportData,
        summary,
        isLoading,
        fetchInputTaxReport,
    } = useInputTaxReportStore();

    const handleGenerateReport = useCallback(() => {
        fetchInputTaxReport();
    }, [fetchInputTaxReport]);

    useEffect(() => {
        handleGenerateReport();
    }, [handleGenerateReport]);

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h4" component="h1" gutterBottom>
                รายงานภาษีซื้อ
            </Typography>
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

            <Card>
                <CardHeader
                    title="ผลลัพธ์รายงาน"
                    action={
                        <Button
                            component={Link}
                            to="/pos/reports/taxprint"                              
                            
                            variant="contained"
                            color="primary"
                        >
                            แสดงหน้าก่อนพิมพ์
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
