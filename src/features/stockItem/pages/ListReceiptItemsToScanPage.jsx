// ✅ ListReceiptItemsToScanPage.jsx — แสดงรายการใบตรวจรับที่พร้อมให้ยิง/เปิดล็อต (SN & LOT)
// - รวมคิว SN และ LOT ในหน้าเดียว
// - มีตัวกรอง (ทั้งหมด / SN เท่านั้น / LOT เท่านั้น)
// - auto refresh เมื่อผู้ใช้กลับมาหน้านี้จากหน้า Scan
// - ปุ่มรีเฟรช และ encode พารามิเตอร์ในลิงก์อย่างถูกต้อง
// 🔒 Production guardrails: stable loader + safe navigation

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const thDate = new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });

const ListReceiptItemsToScanPage = () => {
  const navigate = useNavigate();
  const { receipts, loadReceiptsReadyToScanAction, loading, error, clearErrorAction } = useBarcodeStore();
  const [filter, setFilter] = useState('ALL'); // ALL | SN | LOT

  // ✅ stable loader (กัน effect วิ่งซ้ำโดยไม่จำเป็น)
  const load = useCallback(() => {
    clearErrorAction?.();
    loadReceiptsReadyToScanAction();
  }, [loadReceiptsReadyToScanAction, clearErrorAction]);

  // โหลดครั้งแรก + รีโหลดเมื่อกลับมาหน้านี้
  useEffect(() => {
    load();

    const onVis = () => {
      if (document.visibilityState === 'visible') load();
    };

    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [load]);

  const sortedReceipts = useMemo(() => {
    const rows = (receipts || []).slice();
    return rows.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [receipts]);

  // รวมทั้ง SN และ LOT แล้วกรองตามปุ่ม filter
  const rowsAll = sortedReceipts;
  const rows = useMemo(() => {
    if (filter === 'SN') return rowsAll.filter((r) => Number(r?.pendingSN || 0) > 0);
    if (filter === 'LOT') return rowsAll.filter((r) => Number(r?.pendingLOT || 0) > 0);
    return rowsAll;
  }, [rowsAll, filter]);

  const sumSN = useMemo(() => rowsAll.reduce((s, r) => s + Number(r?.pendingSN || 0), 0), [rowsAll]);
  const sumLOT = useMemo(() => rowsAll.reduce((s, r) => s + Number(r?.pendingLOT || 0), 0), [rowsAll]);

  const goScan = (receipt) => {
    if (!receipt?.id) return; // 🔒 guard
    navigate(`/pos/purchases/receipt/items/scan/${receipt.id}?code=${encodeURIComponent(receipt.purchaseOrderCode || '')}`);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-blue-800">📄 ใบตรวจรับสินค้าที่พร้อมยิง / เปิดล็อต</h1>

      {/* Toolbar: totals + filter + refresh */}
      <div className="flex flex-wrap gap-3 text-sm items-center">
        <span className="px-3 py-1 rounded-full bg-gray-100">ทั้งหมด: {rowsAll.length}</span>
        <span className="px-3 py-1 rounded-full bg-blue-100">SN ค้างยิง: {sumSN}</span>
        <span className="px-3 py-1 rounded-full bg-green-100">LOT ค้างเปิด: {sumLOT}</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant={filter === 'ALL' ? 'default' : 'outline'} onClick={() => setFilter('ALL')}>ทั้งหมด</Button>
          <Button size="sm" variant={filter === 'SN' ? 'default' : 'outline'} onClick={() => setFilter('SN')}>SN เท่านั้น</Button>
          <Button size="sm" variant={filter === 'LOT' ? 'default' : 'outline'} onClick={() => setFilter('LOT')}>LOT เท่านั้น</Button>
          <Button size="sm" variant="secondary" onClick={load}>รีเฟรช</Button>
        </div>
      </div>

      {!loading && error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <div className="font-semibold">เกิดข้อผิดพลาด</div>
          <div className="mt-1 break-words">{typeof error === 'string' ? error : error?.message || 'กรุณาลองใหม่อีกครั้ง'}</div>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={load}
          >
            ลองโหลดใหม่
          </Button>
        </div>
      )}

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : !rows || rows.length === 0 ? (
        <p className="text-gray-600">ยังไม่มีใบตรวจรับที่รอดำเนินการ</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขที่ใบสั่งซื้อ</TableHead>
              <TableHead>เลขที่ใบตรวจรับ</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-center">SN ค้าง</TableHead>
              <TableHead className="text-center">LOT ค้าง</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.purchaseOrderCode || '-'}</TableCell>
                <TableCell>{r.code || '-'}</TableCell>
                <TableCell>{r.createdAt ? thDate.format(new Date(r.createdAt)) : '-'}</TableCell>
                <TableCell>{r.supplier || '-'}</TableCell>
                <TableCell className="text-center">{Number(r?.pendingSN || 0)}</TableCell>
                <TableCell className="text-center">{Number(r?.pendingLOT || 0)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => goScan(r)}>
                    จัดการ
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ListReceiptItemsToScanPage;
