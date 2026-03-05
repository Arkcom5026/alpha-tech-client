




// src/features/stockItem/components/BarcodePrintTable.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const formatDateTh = (value) => {
  try {
    if (!value) return '-';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return '-';
  }
};

const getErrorMessage = (err) => {
  if (!err) return 'เกิดข้อผิดพลาด';
  if (typeof err === 'string') return err;
  return err?.response?.data?.message || err?.message || 'เกิดข้อผิดพลาด';
};

/**
 * ✅ Restructured (Production-grade, minimal disruption)
 * - Page owns: mode + search/filter UX
 * - Table owns: rendering + print actions only
 */
const BarcodePrintTable = ({ mode = 'UNPRINTED', receipts }) => {
  const navigate = useNavigate();
  const { generateBarcodesAction, reprintBarcodesAction } = useBarcodeStore();

  const [selectedIds, setSelectedIds] = useState([]);
  const [uiError, setUiError] = useState('');
  const [printingId, setPrintingId] = useState(null);

  // ✅ Normalize receipts shape defensively
  const normalizedReceipts = useMemo(
    () =>
      (Array.isArray(receipts) ? receipts : []).map((r) => ({
        id: r.id,
        purchaseOrderCode: r.purchaseOrderCode ?? r.orderCode ?? r.poCode ?? r.purchaseOrder?.code ?? '-',
        code: r.code ?? r.receiptCode ?? r.purchaseOrderReceiptCode ?? r.poReceiptCode ?? '-',
        supplier: typeof r.supplier === 'object' ? r.supplier?.name ?? '-' : r.supplier ?? r.supplierName ?? '-',
        receivedAt: r.receivedAt ?? r.createdAt ?? r.date ?? null,
        printed: Boolean(r.printed ?? r.isPrinted ?? false),
      })),
    [receipts]
  );

  const visibleReceipts = useMemo(() => {
    // ✅ UNPRINTED: show only not-printed rows (safety)
    if (mode === 'UNPRINTED') return normalizedReceipts.filter((r) => !r.printed);
    // ✅ REPRINT: page already filtered; show as-is
    return normalizedReceipts;
  }, [normalizedReceipts, mode]);

  const isAllSelected =
    mode === 'UNPRINTED' && visibleReceipts.length > 0 && visibleReceipts.every((r) => selectedIds.includes(r.id));

  const toggleSelect = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = () => setSelectedIds(isAllSelected ? [] : visibleReceipts.map((r) => r.id));

  useEffect(() => {
    // ✅ When mode/data changes, clear selection to prevent accidental batch print
    setSelectedIds([]);
    setUiError('');
  }, [mode, receipts]);

  const handlePrintClick = async (receiptId) => {
    if (!receiptId) return;
    setUiError('');
    try {
      setPrintingId(receiptId);
      await generateBarcodesAction(receiptId);
      navigate(`/pos/purchases/barcodes/preview/${receiptId}`);
    } catch (err) {
      if (import.meta?.env?.DEV) console.error('[handlePrintClick] ❌', err);
      setUiError(getErrorMessage(err));
    } finally {
      setPrintingId(null);
    }
  };

  const handleReprintClick = async (receiptId) => {
    if (!receiptId) return;
    setUiError('');
    try {
      setPrintingId(receiptId);
      await reprintBarcodesAction(receiptId);
      navigate(`/pos/purchases/barcodes/preview/${receiptId}`);
    } catch (err) {
      if (import.meta?.env?.DEV) console.error('[handleReprintClick] ❌', err);
      setUiError(getErrorMessage(err));
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* UI-based error (no dialog) */}
      {uiError && (
        <div className="border rounded-md p-3 bg-white">
          <div className="text-sm text-rose-700">{uiError}</div>
          <button
            type="button"
            className="mt-2 text-xs text-gray-600 underline"
            onClick={() => setUiError('')}
          >
            ปิดข้อความ
          </button>
        </div>
      )}

      <div className="max-h-[560px] overflow-auto rounded border border-gray-300">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {/* ✅ Checkbox only for UNPRINTED batch print */}
              <th className="border px-2 py-1 text-center" style={{ width: 40 }}>
                {mode === 'UNPRINTED' ? (
                  <input type="checkbox" onChange={toggleSelectAll} checked={isAllSelected} />
                ) : (
                  <span />
                )}
              </th>
              <th className="border px-2 py-1 text-center" style={{ width: 70 }}>
                ลำดับ
              </th>
              <th className="border px-2 py-1">เลขใบสั่งซื้อ</th>
              <th className="border px-2 py-1">เลขใบตรวจรับ</th>
              <th className="border px-2 py-1">Supplier</th>
              <th className="border px-2 py-1">วันที่รับ</th>
              <th className="border px-2 py-1 text-center" style={{ width: 110 }}>
                การพิมพ์
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleReceipts.map((r, index) => (
              <tr key={r.id} className={`hover:bg-gray-50 ${index % 2 === 1 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="border px-2 py-1 text-center">
                  {mode === 'UNPRINTED' ? (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggleSelect(r.id)}
                    />
                  ) : (
                    <span />
                  )}
                </td>
                <td className="border px-2 py-1 text-center">{index + 1}</td>
                <td className="border px-2 py-1 font-mono text-xs">{r.purchaseOrderCode}</td>
                <td className="border px-2 py-1 font-mono text-xs">{r.code}</td>
                <td className="border px-2 py-1">{r.supplier}</td>
                <td className="border px-2 py-1">{formatDateTh(r.receivedAt)}</td>
                <td className="border px-2 py-1 text-center">
                  {mode === 'UNPRINTED' ? (
                    <button
                      type="button"
                      onClick={() => handlePrintClick(r.id)}
                      disabled={printingId === r.id}
                      className={`px-3 py-1 text-white rounded ${
                        printingId === r.id
                          ? 'bg-green-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {printingId === r.id ? 'กำลังสร้าง...' : 'พิมพ์'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReprintClick(r.id)}
                      disabled={printingId === r.id}
                      className={`px-3 py-1 text-white rounded ${
                        printingId === r.id
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {printingId === r.id ? 'กำลังเตรียม...' : 'พิมพ์ซ้ำ'}
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {visibleReceipts.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 p-6">
                  {mode === 'UNPRINTED' ? 'ไม่มีรายการรอพิมพ์' : 'ไม่พบข้อมูลที่ตรงกับคำค้น'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Batch print (UNPRINTED only) */}
      {mode === 'UNPRINTED' && selectedIds.length > 0 && (
        <div className="mt-2">
          <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-gray-200 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-gray-700">
              เลือกแล้ว <span className="font-medium">{selectedIds.length}</span> รายการ
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded border bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                onClick={() => setSelectedIds([])}
              >
                ยกเลิกการเลือก
              </button>
              <button
                type="button"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => navigate(`/pos/purchases/barcodes/print?ids=${selectedIds.join(',')}`)}
              >
                พิมพ์รายการที่เลือก ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default BarcodePrintTable;




