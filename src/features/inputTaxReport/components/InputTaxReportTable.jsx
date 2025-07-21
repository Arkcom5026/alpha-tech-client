// InputTaxReportTable.jsx 

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Typography,
    CircularProgress,
    TableFooter,
} from '@mui/material';


const formatNumber = (value) => {
    const num = Number(value);
    if (isNaN(num)) {
        return '0.00';
    }
    return num.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};


export const InputTaxReportTable = ({ data, summary, isLoading }) => {

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>กำลังโหลดข้อมูล...</Typography>
            </Box>
        );
    }


    if (!data || data.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    ไม่พบข้อมูล กรุณาเลือกเดือนและปีกด "แสดงรายงาน"
                </Typography>
            </Box>
        );
    }

    const headers = [
        'วัน เดือน ปี',
        'เลขที่ใบกำกับภาษี',
        'ชื่อผู้ขาย',
        'เลขประจำตัวผู้เสียภาษีอากร',
        'มูลค่าสินค้าหรือบริการ',
        'ภาษีมูลค่าเพิ่ม',
        'รวม',
    ];

    return (
        <div className="overflow-x-auto mt-4 max-w-5xl mx-auto">
  <table className="w-full border border-black text-sm">
    <thead>
      <tr className="bg-gray-100">
        <th className="border border-black font-bold px-2 py-1">วัน เดือน ปี</th>
        <th className="border border-black font-bold px-2 py-1">เลขที่ใบกำกับภาษี</th>
        <th className="border border-black font-bold px-2 py-1">ชื่อผู้ขาย</th>
        <th className="border border-black font-bold px-2 py-1">เลขประจำตัวผู้เสียภาษีอากร</th>
        <th className="border border-black font-bold px-2 py-1 text-right">มูลค่าสินค้าหรือบริการ</th>
        <th className="border border-black font-bold px-2 py-1 text-right">ภาษีมูลค่าเพิ่ม</th>
        <th className="border border-black font-bold px-2 py-1 text-right">รวม</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item) => (
        <tr key={item.id}>
          <td className="border border-black px-2 py-1">{item.supplierTaxInvoiceDate ? new Date(item.supplierTaxInvoiceDate).toLocaleDateString('th-TH') : '-'}</td>
          <td className="border border-black px-2 py-1">{item.supplierTaxInvoiceNumber || '-'}</td>
          <td className="border border-black px-2 py-1">{item.supplierName || 'N/A'}</td>
          <td className="border border-black px-2 py-1">{item.supplierTaxId || 'N/A'}</td>
          <td className="border border-black px-2 py-1 text-right">{formatNumber(item.totalAmount)}</td>
          <td className="border border-black px-2 py-1 text-right">{formatNumber(item.vatAmount)}</td>
          <td className="border border-black px-2 py-1 text-right">{formatNumber(item.grandTotal)}</td>
        </tr>
      ))}
    </tbody>
    <tfoot>
      <tr className="font-bold">
        <td colSpan={4} className="border border-black px-2 py-1 text-right">ยอดรวม</td>
        <td className="border border-black px-2 py-1 text-right">{formatNumber(summary.totalAmount)}</td>
        <td className="border border-black px-2 py-1 text-right">{formatNumber(summary.vatAmount)}</td>
        <td className="border border-black px-2 py-1 text-right">{formatNumber(summary.grandTotal)}</td>
      </tr>
    </tfoot>
  </table>
</div>
    );
};


