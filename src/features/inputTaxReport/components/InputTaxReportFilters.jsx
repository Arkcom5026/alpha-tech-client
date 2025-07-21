// src/features/inputTaxReport/components/InputTaxReportFilters.jsx
import React from 'react';
import { Grid, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// สร้างรายการเดือน
const months = [
    { value: 1, label: 'มกราคม' },
    { value: 2, label: 'กุมภาพันธ์' },
    { value: 3, label: 'มีนาคม' },
    { value: 4, label: 'เมษายน' },
    { value: 5, label: 'พฤษภาคม' },
    { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' },
    { value: 8, label: 'สิงหาคม' },
    { value: 9, label: 'กันยายน' },
    { value: 10, label: 'ตุลาคม' },
    { value: 11, label: 'พฤศจิกายน' },
    { value: 12, label: 'ธันวาคม' },
];

// สร้างรายการปี (เช่น 5 ปีย้อนหลัง และ 1 ปีล่วงหน้า)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

/**
 * Component สำหรับกรองข้อมูลรายงานภาษีซื้อ
 * @param {object} props
 * @param {object} props.filters - ค่า filter ปัจจุบันจาก store
 * @param {function} props.onFiltersChange - ฟังก์ชันสำหรับอัปเดตค่า filter ใน store
 * @param {function} props.onGenerateReport - ฟังก์ชันสำหรับสั่งให้สร้างรายงานใหม่
 * @param {boolean} props.isGenerating - สถานะกำลังโหลดข้อมูล
 */
export const InputTaxReportFilters = ({ filters, onFiltersChange, onGenerateReport, isGenerating }) => {

  // จัดการการเปลี่ยนแปลงค่าในฟอร์ม
  const handleChange = (event) => {
    const { name, value } = event.target;
    onFiltersChange({ ...filters, [name]: value });
  };

  return (
    <Grid container spacing={2} alignItems="center">
      {/* Filter: Tax Month */}
      <Grid item xs={12} sm={6} md={6}>
        <FormControl fullWidth>
          <InputLabel>เดือนภาษี</InputLabel>
          <Select
            label="เดือนภาษี"
            name="taxMonth"
            value={filters.taxMonth || ''}
            onChange={handleChange}
          >
            {months.map((month) => (
              <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Filter: Tax Year */}
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth>
          <InputLabel>ปีภาษี (พ.ศ.)</InputLabel>
          <Select
            label="ปีภาษี (พ.ศ.)"
            name="taxYear"
            value={filters.taxYear || ''}
            onChange={handleChange}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>{year + 543}</MenuItem> // แปลงเป็น พ.ศ.
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Action Buttons */}
      <Grid item xs={12} sm={4}>
         <Button
            variant="contained"
            onClick={onGenerateReport}
            disabled={isGenerating}
            fullWidth
            sx={{ height: '56px' }}
         >
            {isGenerating ? 'กำลังโหลด...' : 'แสดงรายงาน'}
         </Button>
      </Grid>
    </Grid>
  );
};

