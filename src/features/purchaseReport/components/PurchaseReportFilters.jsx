

// src/features/purchaseReport/components/PurchaseReportFilters.jsx
import React, { useEffect } from 'react';
import { Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// ✅ 1. นำเข้า Store แทนการนำเข้า API โดยตรง
import useSupplierStore from '@/features/supplier/store/supplierStore';


// ✅ รายงานนี้อ้างอิง “ใบรับสินค้า” (PurchaseOrderReceipt)
// - สถานะใบรับ: ReceiptStatus (PENDING | COMPLETED | CANCELLED)
// - สถานะชำระ: PaymentStatus (UNPAID | PARTIALLY_PAID | WAITING_APPROVAL | PAID | CANCELLED)
const receiptStatuses = [
  { id: 'all', name: 'ทั้งหมด' },
  { id: 'PENDING', name: 'รอดำเนินการ' },
  { id: 'COMPLETED', name: 'เสร็จสมบูรณ์' },
  { id: 'CANCELLED', name: 'ยกเลิก' },
];

const paymentStatuses = [
  { id: 'all', name: 'ทั้งหมด' },
  { id: 'UNPAID', name: 'ค้างชำระ' },
  { id: 'PARTIALLY_PAID', name: 'ชำระบางส่วน' },
  { id: 'WAITING_APPROVAL', name: 'รอตรวจสอบ' },
  { id: 'PAID', name: 'ชำระแล้ว' },
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
      receiptStatus: 'all',
      paymentStatus: 'all',
    });
  };

  return (
    <Grid container spacing={2} alignItems="center">
      {/* Filter: Date From */}
      {/* ✨ ปรับแก้ Grid ให้มีขนาดคงที่สำหรับจอ Tablet ขึ้นไป */}
      <Grid item xs={12} sm={2} md={2}>
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
      <Grid item xs={12} sm={2} md={2}>
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
      <Grid item xs={12} sm={5} md={5}>
        <FormControl fullWidth>
          <InputLabel>ผู้ขาย (Supplier)</InputLabel>
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
      <Grid item xs={12} sm={3} md={3}>
        <FormControl fullWidth>
          <InputLabel>สถานะ</InputLabel>
          <Select
            label="สถานะ"
            name="receiptStatus"
            value={filters.receiptStatus || 'all'}
            onChange={handleChange}
          >
            {receiptStatuses.map((status) => (
              <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Filter: Payment Status */}
      <Grid item xs={12} sm={3} md={3}>
        <FormControl fullWidth>
          <InputLabel>สถานะชำระ</InputLabel>
          <Select
            label="สถานะชำระ"
            name="paymentStatus"
            value={filters.paymentStatus || 'all'}
            onChange={handleChange}
          >
            {paymentStatuses.map((status) => (
              <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Action Buttons */}
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



