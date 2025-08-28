// src/features/stockItem/components/BarcodePrintTable.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const BarcodePrintTable = ({ receipts }) => {
  const navigate = useNavigate();
  const { generateBarcodesAction, reprintBarcodesAction, searchReprintReceiptsAction } = useBarcodeStore();

  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchMode, setSearchMode] = useState('RC');
  const [query, setQuery] = useState('');
  const [reprintResults, setReprintResults] = useState([]);
  const [reprintLoading, setReprintLoading] = useState(false);
  const [reprintError, setReprintError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const formatDate = (value) => {
    const d = new Date(value);
    return !isNaN(d.getTime()) ? d.toLocaleDateString() : '-';
  };

  // ✅ ปรับ mapping supplier ให้แน่นอน ใช้ r.supplier?.name ถ้า r.supplier เป็น object
  const normalizedReceipts = useMemo(
    () =>
      (receipts || []).map((r) => ({
        id: r.id,
        purchaseOrderCode: r.purchaseOrderCode ?? r.orderCode ?? r.poCode ?? r.purchaseOrder?.code ?? '-',
        code: r.code ?? r.receiptCode ?? r.purchaseOrderReceiptCode ?? r.poReceiptCode ?? '-',
        taxInvoiceNo: r.taxInvoiceNo ?? r.tax ?? r.taxNumber ?? '',
        supplier:
          typeof r.supplier === 'object'
            ? r.supplier?.name ?? '-'
            : r.supplier ?? r.supplierName ?? '-',
        receivedAt: r.receivedAt ?? r.createdAt ?? r.date ?? null,
        printed: Boolean(r.printed ?? r.isPrinted ?? false),
      })),
    [receipts]
  );

  const filteredReceipts = useMemo(
    () =>
      normalizedReceipts.filter((receipt) => (statusFilter === 'PENDING' ? !receipt.printed : false)),
    [normalizedReceipts, statusFilter]
  );

  const isAllSelected =
    filteredReceipts.length > 0 && filteredReceipts.every((r) => selectedIds.includes(r.id));

  const toggleSelect = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = () =>
    setSelectedIds(isAllSelected ? [] : filteredReceipts.map((r) => r.id));

  const handlePrintClick = async (receiptId) => {
    await generateBarcodesAction(receiptId);
    navigate(`/pos/purchases/barcodes/preview/${receiptId}`);
  };

  const handleReprintClick = async (receiptId) => {
    if (!receiptId) return;
    await reprintBarcodesAction(receiptId);
    navigate(`/pos/purchases/barcodes/preview/${receiptId}`);
  };

  const placeholder = useMemo(
    () =>
      ({
        RC: 'กรอกเลขใบตรวจรับ (RC-xxxxxx-xxxx) เพื่อค้นหาพิมพ์ซ้ำ',
        PO: 'กรอกเลขใบสั่งซื้อ (PO-xxxxxx-xxxx) เพื่อค้นหาพิมพ์ซ้ำ',
      }[searchMode]),
    [searchMode]
  );

  const maskCode = (mode, raw) => {
    const prefix = mode === 'PO' ? 'PO-' : 'RC-';
    const digits = String(raw || '').replace(/[^0-9]/g, '');
    const p1 = digits.slice(0, 6);
    const p2 = digits.slice(6, 10);
    let out = prefix;
    if (p1) out += p1;
    if (p1.length === 6) out += '-' + p2;
    return out;
  };

  const handleChangeMode = (nextMode) => {
    setSearchMode(nextMode);
    if (!query) return;
    const digits = String(query).replace(/[^0-9]/g, '');
    setQuery(maskCode(nextMode, digits));
  };

  const handleQueryChange = (raw) => {
    setQuery(maskCode(searchMode, raw));
  };

  useEffect(() => {
    if (statusFilter === 'REPRINT') {
      setReprintResults([]);
      setReprintError('');
      setHasSearched(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setSelectedIds([]);
  }, [statusFilter, receipts]);

  const handleReprintSearch = async (e) => {
    e.preventDefault();
    const q = (query || '').trim();
    if (!q) return;

    setHasSearched(true);
    setReprintError('');
    setReprintLoading(true);
    try {
      const data = await searchReprintReceiptsAction({ mode: searchMode, query: q });
      const normalized = (data || []).map((r) => ({
        id: r.id,
        purchaseOrderCode: r.purchaseOrderCode || r.orderCode || '-',
        code: r.code,
        supplier: typeof r.supplier === 'object' ? r.supplier?.name ?? '-' : r.supplier ?? r.supplierName ?? '-',
        receivedAt: r.createdAt || r.receivedAt,
      }));
      setReprintResults(normalized);
    } catch (err) {
      console.error('[handleReprintSearch] ❌', err);
      setReprintResults([]);
      setReprintError(err?.message || 'ค้นหาล้มเหลว');
    } finally {
      setReprintLoading(false);
    }
  };

  const isSearchDisabled = reprintLoading || String(query).replace(/[^0-9]/g, '').length < 10;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="font-medium">โหมด:</label>
        <label>
          <input
            type="radio"
            name="status"
            value="PENDING"
            checked={statusFilter === 'PENDING'}
            onChange={(e) => setStatusFilter(e.target.value)}
          />{' '}
          ยังไม่ได้พิมพ์
        </label>
        <label>
          <input
            type="radio"
            name="status"
            value="REPRINT"
            checked={statusFilter === 'REPRINT'}
            onChange={(e) => setStatusFilter(e.target.value)}
          />{' '}
          พิมพ์ซ้ำ
        </label>

        {statusFilter === 'REPRINT' && (
          <form onSubmit={handleReprintSearch} className="flex flex-wrap items-center gap-2 ml-4">
            <select
              className="border rounded px-2 py-1 h-[36px]"
              value={searchMode}
              onChange={(e) => handleChangeMode(e.target.value)}
              aria-label="เลือกวิธีค้นหา"
            >
              <option value="RC">เลขใบตรวจรับ (RC)</option>
              <option value="PO">เลขใบสั่งซื้อ (PO)</option>
            </select>
            <input
              type="text"
              className="border rounded px-3 py-1 h-[36px] min-w-[260px]"
              placeholder={placeholder}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => {
                if (!query) setQuery(searchMode === 'PO' ? 'PO-' : 'RC-');
              }}
              maxLength={14}
              inputMode="numeric"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={isSearchDisabled}
              className={`px-3 py-1 text-white rounded ${isSearchDisabled ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {reprintLoading ? 'กำลังค้นหา...' : 'ค้นหา'}
            </button>
          </form>
        )}
      </div>

      {/* ตารางโหมดยังไม่ได้พิมพ์ */}
      {statusFilter === 'PENDING' && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-center">
                  <input type="checkbox" onChange={toggleSelectAll} checked={isAllSelected} />
                </th>
                <th className="border px-2 py-1 text-center">ลำดับ</th>
                <th className="border px-2 py-1">เลขใบสั่งซื้อ</th>
                <th className="border px-2 py-1">เลขใบตรวจรับ</th>
                <th className="border px-2 py-1">เลขที่ใบกำกับภาษี</th>
                <th className="border px-2 py-1">Supplier</th>
                <th className="border px-2 py-1">วันที่รับ</th>
                <th className="border px-2 py-1 text-center">การพิมพ์</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((r, index) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggleSelect(r.id)}
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">{index + 1}</td>
                  <td className="border px-2 py-1">{r.purchaseOrderCode}</td>
                  <td className="border px-2 py-1">{r.code}</td>
                  <td className="border px-2 py-1">{r.taxInvoiceNo || '-'}</td>
                  <td className="border px-2 py-1">{r.supplier}</td>
                  <td className="border px-2 py-1">{formatDate(r.receivedAt)}</td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => handlePrintClick(r.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      พิมพ์
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 p-4">
                    ไม่มีรายการรอพิมพ์
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ตารางโหมดพิมพ์ซ้ำ */}
      {statusFilter === 'REPRINT' && (
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">
              {hasSearched && !reprintLoading && (
                <>พบ {reprintResults.length} รายการ</>
              )}
            </div>
            {reprintError && (
              <div className="text-sm text-red-600">{reprintError}</div>
            )}
          </div>
          <table className="min-w-full text-sm border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-center">ลำดับ</th>
                <th className="border px-2 py-1">เลขใบสั่งซื้อ</th>
                <th className="border px-2 py-1">เลขใบตรวจรับ</th>
                <th className="border px-2 py-1">Supplier</th>
                <th className="border px-2 py-1">วันที่รับ</th>
                <th className="border px-2 py-1 text-center">การพิมพ์</th>
              </tr>
            </thead>
            <tbody>
              {reprintLoading && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 p-4">กำลังค้นหา...</td>
                </tr>
              )}

              {!reprintLoading && reprintResults.length > 0 &&
                reprintResults.map((r, index) => (
                  <tr key={r.id || `${r.code}-${index}`} className="hover:bg-gray-50">
                    <td className="border px-2 py-1 text-center">{index + 1}</td>
                    <td className="border px-2 py-1">{r.purchaseOrderCode}</td>
                    <td className="border px-2 py-1">{r.code}</td>
                    <td className="border px-2 py-1">{r.supplier}</td>
                    <td className="border px-2 py-1">{formatDate(r.receivedAt)}</td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        onClick={() => handleReprintClick(r.id)}
                        disabled={reprintLoading}
                        className={`px-3 py-1 text-white rounded ${reprintLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        พิมพ์ซ้ำ
                      </button>
                    </td>
                  </tr>
                ))}

              {!reprintLoading && hasSearched && reprintResults.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 p-4">
                    ไม่พบข้อมูลที่ตรงกับคำค้น
                  </td>
                </tr>
              )}

              {!reprintLoading && !hasSearched && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 p-4">
                    กรุณากรอกเลข RC/PO แล้วกดค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {statusFilter === 'PENDING' && selectedIds.length > 0 && (
        <div className="mt-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => navigate(`/pos/purchases/barcodes/print?ids=${selectedIds.join(',')}`)}
          >
            พิมพ์รายการที่เลือก ({selectedIds.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodePrintTable;
