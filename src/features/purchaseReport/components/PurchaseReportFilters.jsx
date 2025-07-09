// src/features/purchaseReport/components/PurchaseReportFilters.jsx
import React, { useState, useEffect } from 'react';
import { Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// ✅ 1. นำเข้า Store แทนการนำเข้า API โดยตรง
import useSupplierStore from '@/features/supplier/store/supplierStore';


// ✅ สถานะถูกอัปเดตให้ตรงกับ PurchaseOrderStatus ใน Prisma Schema
const purchaseStatuses = [
    { id: 'all', name: 'ทั้งหมด' },
    { id: 'PENDING', name: 'รอดำเนินการ' },
    { id: 'PARTIALLY_RECEIVED', name: 'รับของบางส่วน' },
    { id: 'RECEIVED', name: 'รับของครบแล้ว' },
    { id: 'PAID', name: 'ชำระเงินแล้ว' },
    { id: 'COMPLETED', name: 'เสร็จสมบูรณ์' },
    { id: 'CANCELLED', name: 'ยกเลิก' },
];


/**
 * Component สำหรับกรองข้อมูลรายงานการจัดซื้อ
 * @param {object} props
 * @param {object} props.filters - ค่า filter ปัจจุบันจาก store
 * @param {function} props.onFiltersChange - ฟังก์ชันสำหรับอัปเดตค่า filter ใน store
 * @param {function} props.onGenerateReport - ฟังก์ชันสำหรับสั่งให้สร้างรายงานใหม่
 * @param {boolean} props.isGenerating - สถานะกำลังโหลดข้อมูล
 */
export const PurchaseReportFilters = ({ filters, onFiltersChange, onGenerateReport, isGenerating }) => {
  // ✅ 2. ดึง state และ action มาจาก supplierStore
  const { suppliers, isSupplierLoading, fetchSuppliersAction } = useSupplierStore();

  // ✅ 3. useEffect จะเรียก action จาก store แทนการเรียก API โดยตรง
  useEffect(() => {
    // เรียก action เพื่อไปดึงข้อมูล Suppliers
    fetchSuppliersAction();
  }, [fetchSuppliersAction]); // ใช้ fetchSuppliersAction เป็น dependency


  // จัดการการเปลี่ยนแปลงค่าในฟอร์ม
  const handleChange = (event) => {
    const { name, value } = event.target;
    onFiltersChange({ ...filters, [name]: value });
  };

  const handleClearFilters = () => {
    // ❌ ลบ branchId ออกจาก object ที่ reset
    onFiltersChange({
        dateFrom: '',
        dateTo: '',
        supplierId: 'all',
        status: 'all',
    });
  };

  return (
    <Grid container spacing={2} alignItems="center">
      {/* Filter: Date From */}
      {/* ✨ ปรับความกว้างจาก 3 เป็น 2 */}
      <Grid item xs={12} sm={6} md={2}>
        <TextField
          label="ตั้งแต่วันที่"
          type="date"
          name="dateFrom"
          value={filters.dateFrom || ''}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Filter: Date To */}
      {/* ✨ ปรับความกว้างจาก 3 เป็น 2 */}
      <Grid item xs={12} sm={6} md={2}>
        <TextField
          label="ถึงวันที่"
          type="date"
          name="dateTo"
          value={filters.dateTo || ''}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Filter: Supplier */}
      {/* ✨ ปรับความกว้างจาก 3 เป็น 4 */}
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth>
          <InputLabel>ผู้ขาย (Supplier)</InputLabel>
          {/* ✅ 4. ใช้ isSupplierLoading และ suppliers จาก store */}
          <Select
            label="ผู้ขาย (Supplier)"
            name="supplierId"
            value={filters.supplierId || 'all'}
            onChange={handleChange}
            disabled={isSupplierLoading}
          >
            <MenuItem value="all">ทั้งหมด</MenuItem>
            {isSupplierLoading
              ? <MenuItem disabled>กำลังโหลด...</MenuItem>
              : suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
                ))
            }
          </Select>
        </FormControl>
      </Grid>

      {/* Filter: Status */}
      {/* ✨ ปรับความกว้างจาก 3 เป็น 4 */}
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth>
          <InputLabel>สถานะ</InputLabel>
          <Select
            label="สถานะ"
            name="status"
            value={filters.status || 'all'}
            onChange={handleChange}
          >
            {purchaseStatuses.map((status) => (
              <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Action Buttons */}
      {/* ✨ ปรับ Layout ของปุ่มให้อยู่บรรทัดใหม่เสมอ */}
      <Grid item xs={12} container spacing={2} justifyContent="flex-start">
         <Grid item>
            <Button
                variant="contained"
                onClick={onGenerateReport}
                disabled={isGenerating}
                sx={{ height: '56px' }}
            >
                {isGenerating ? 'กำลังโหลด...' : 'แสดงรายงาน'}
            </Button>
         </Grid>
         <Grid item>
            <Button
                variant="outlined"
                onClick={handleClearFilters}
                disabled={isGenerating}
                sx={{ height: '56px' }}
            >
                ล้างค่า
            </Button>
         </Grid>
      </Grid>
    </Grid>
  );
};
