// src/features/stockItem/components/BarcodePrintTable.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const BarcodePrintTable = ({ receipts }) => {
  const navigate = useNavigate();
  const { generateBarcodesAction, reprintBarcodesAction, searchReprintReceiptsAction } = useBarcodeStore();
  
  // โหมดหน้า: แสดง "ยังไม่ได้พิมพ์" หรือ "พิมพ์ซ้ำ"
  const [statusFilter, setStatusFilter] = useState('PENDING'); // PENDING | REPRINT

  // สำหรับพิมพ์ชุด (ยังไม่ได้พิมพ์)
  const [selectedIds, setSelectedIds] = useState([]);

  // สำหรับพิมพ์ซ้ำ: วิธีค้นหา + คำค้น + ผลลัพธ์จาก BE + สถานะ
  const [searchMode, setSearchMode] = useState('RC'); // RC | PO
  const [query, setQuery] = useState('');
  const [reprintResults, setReprintResults] = useState([]);
  const [reprintLoading, setReprintLoading] = useState(false);
  const [reprintError, setReprintError] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // ใช้ควบคุมการแสดง "ไม่พบข้อมูล" ให้ขึ้นหลังจากกดค้นหาเท่านั้น

  // ฟังก์ชันช่วยแปลงวันที่ให้ปลอดภัย
  const formatDate = (value) => {
    const d = new Date(value);
    return !isNaN(d.getTime()) ? d.toLocaleDateString() : '-';
  };

  // สร้างฟิลด์เสริมสำหรับตารางจาก summary ที่ได้จาก API (ฝั่ง PENDING)
  const enhancedReceipts = useMemo(
    () =>
      (receipts || []).map((r) => ({
        ...r,
        orderCode: r.purchaseOrderCode,
        supplierName: r.supplier,
        receivedAt: r.createdAt,
        totalItems: r.total,
        barcodeGenerated: r.scanned,
        printed: !!r.printed,
        status: r.printed ? 'COMPLETED' : 'PENDING',
      })),
    [receipts]
  );

  // แสดงเฉพาะยังไม่ได้พิมพ์ในโหมด PENDING
  const filteredReceipts = useMemo(
    () =>
      enhancedReceipts.filter((receipt) => (statusFilter === 'PENDING' ? !receipt.printed : false)),
    [enhancedReceipts, statusFilter]
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

  // 🔁 พิมพ์ซ้ำ: ดึงบาร์โค้ดเดิม (ไม่ generate ใหม่) แล้วไปหน้า preview
  const handleReprintClick = async (receiptId) => {
    if (!receiptId) return;
    await reprintBarcodesAction(receiptId);
    navigate(`/pos/purchases/barcodes/preview/${receiptId}`);
  };

  const placeholder = useMemo(
    () =>
      (
        {
          RC: 'กรอกเลขใบตรวจรับ (RC-xxxxxx-xxxx) เพื่อค้นหาพิมพ์ซ้ำ',
          PO: 'กรอกเลขใบสั่งซื้อ (PO-xxxxxx-xxxx) เพื่อค้นหาพิมพ์ซ้ำ',
        }[searchMode]
      ),
    [searchMode]
  );

  // Mask helpers for RC/PO codes: RC-xxxxxx-xxxx / PO-xxxxxx-xxxx
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

  // เมื่อเข้าสู่โหมด REPRINT ให้ล้างผลลัพธ์เก่า และ reset hasSearched
  useEffect(() => {
    if (statusFilter === 'REPRINT') {
      setReprintResults([]);
      setReprintError('');
      setHasSearched(false);
    }
  }, [statusFilter]);

  // ปุ่มค้นหาในโหมด REPRINT (เรียก BE ทุกครั้ง)
  const handleReprintSearch = async (e) => {
    e.preventDefault();
    const q = (query || '').trim();
    if (!q) return; // ไม่ค้นหาถ้ายังไม่พิมพ์คำค้น

    setHasSearched(true);
    setReprintError('');
    setReprintLoading(true);
    try {
      // เรียก Store → ไป BE ทุกครั้ง พร้อมเงื่อนไข (ให้ฝั่ง Store/BE รับ param ทั้ง mode & query)
      const data = await searchReprintReceiptsAction({ mode: searchMode, query: q });

      // ปรับฟอร์แมตผลลัพธ์ให้ตรงตาราง
      const normalized = (data || []).map((r) => ({
        id: r.id,
        orderCode: r.purchaseOrderCode || r.orderCode || '-',
        code: r.code,
        supplierName: r.supplier || r.supplierName || '-',
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

  const isSearchDisabled = reprintLoading || !query.trim();

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
                <th className="border px-2 py-1 text-center">จำนวนที่รับ</th>
                <th className="border px-2 py-1 text-center">ยิง SN แล้ว</th>
                <th className="border px-2 py-1 text-center">สถานะ</th>
                <th className="border px-2 py-1 text-center">การพิมพ์</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt, index) => (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(receipt.id)}
                      onChange={() => toggleSelect(receipt.id)}
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">{index + 1}</td>
                  <td className="border px-2 py-1">{receipt.orderCode}</td>
                  <td className="border px-2 py-1">{receipt.code}</td>
                  <td className="border px-2 py-1">{receipt.tax}</td>
                  <td className="border px-2 py-1">{receipt.supplierName}</td>
                  <td className="border px-2 py-1">{formatDate(receipt.receivedAt)}</td>
                  <td className="border px-2 py-1 text-center">{receipt.totalItems}</td>
                  <td className="border px-2 py-1 text-center">{receipt.barcodeGenerated}</td>
                  <td className="border px-2 py-1 text-center">
                    {receipt.status === 'COMPLETED' ? 'พิมพ์แล้ว' : 'ยังไม่ได้พิมพ์'}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => handlePrintClick(receipt.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      พิมพ์
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center text-gray-500 p-4">
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
                reprintResults.map((receipt, index) => (
                  <tr key={receipt.id || `${receipt.code}-${index}`} className="hover:bg-gray-50">
                    <td className="border px-2 py-1 text-center">{index + 1}</td>
                    <td className="border px-2 py-1">{receipt.orderCode}</td>
                    <td className="border px-2 py-1">{receipt.code}</td>
                    <td className="border px-2 py-1">{receipt.supplierName}</td>
                    <td className="border px-2 py-1">{formatDate(receipt.receivedAt)}</td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        onClick={() => handleReprintClick(receipt.id)}
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
