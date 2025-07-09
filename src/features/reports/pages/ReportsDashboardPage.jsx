// src/features/dashboard/pages/DashboardPage.jsx
import React from 'react';
import { Box, Grid, Typography, Card, CardContent } from '@mui/material'; // เพิ่ม Card, CardContent

// Icons (ตัวอย่างจาก Material-UI Icons)
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

// --- Mock Data ---
const mockSummary = {
  totalPurchaseMonth: 150500.75,
  orderCountMonth: 45,
  pendingOrders: 8,
};

const mockChartData = [
    { date: '2025-07-01', total: 5200 },
    { date: '2025-07-02', total: 8350 },
    { date: '2025-07-03', total: 7100 },
    { date: '2025-07-04', total: 12500 },
    { date: '2025-07-05', total: 9800 },
    { date: '2025-07-06', total: 15400 },
    { date: '2025-07-07', total: 11250 },
];
// --- End Mock Data ---


// --- Mock Components ---
// สร้าง Component จำลองสำหรับ SummaryCard ที่นี่
const SummaryCard = ({ title, value, icon, color }) => (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2, height: '100%' }}>
        <Box sx={{ color, mr: 2 }}>{icon}</Box>
        <Box>
            <Typography color="text.secondary">{title}</Typography>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                {value}
            </Typography>
        </Box>
    </Card>
);

// สร้าง Component จำลองสำหรับ PurchaseOverviewChart ที่นี่
const PurchaseOverviewChart = ({ data, isLoading }) => (
    <Card>
        <CardContent>
            <Typography variant="h6">ภาพรวมยอดซื้อรายวัน</Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: 1, mt: 2 }}>
                <Typography color="text.secondary">(กราฟจะแสดงผลที่นี่)</Typography>
                {/* ในสถานการณ์จริง จะนำ data ไป render กราฟด้วย library เช่น Recharts, Chart.js */}
            </Box>
        </CardContent>
    </Card>
);
// --- End Mock Components ---


/**
 * หน้าหลักสำหรับ Dashboard สรุปภาพรวม
 */
export const ReportsDashboardPage = () => {
  // ใช้ข้อมูลจำลองแทนการดึงจาก store
  const summary = mockSummary;
  const chartData = mockChartData;

  // ฟังก์ชันสำหรับจัดรูปแบบตัวเลข
  const formatCurrency = (num) => {
    if (typeof num !== 'number') return '0.00';
    return num.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }).replace('฿', '');
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard ภาพรวม
      </Typography>

      {/* ส่วนของการ์ดสรุปข้อมูล (Summary Cards) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="ยอดซื้อรวม (เดือนนี้)"
            value={formatCurrency(summary.totalPurchaseMonth)}
            icon={<RequestQuoteIcon sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="จำนวนใบสั่งซื้อ (เดือนนี้)"
            value={summary.orderCountMonth.toLocaleString('th-TH')}
            icon={<ShoppingCartIcon sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="รายการที่ยังไม่ได้รับ"
            value={summary.pendingOrders.toLocaleString('th-TH')}
            icon={<PendingActionsIcon sx={{ fontSize: 40 }} />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* ส่วนของกราฟ */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
            <PurchaseOverviewChart
                data={chartData}
            />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsDashboardPage;
