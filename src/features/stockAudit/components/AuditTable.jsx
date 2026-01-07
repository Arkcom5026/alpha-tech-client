

// =============================
// features/stockAudit/components/AuditTable.jsx
// ✅ ตารางใช้ร่วม (Expected/Scanned)
// - scanned = true จะแสดงคอลัมน์ scannedAt

import React, { useEffect, useState } from 'react';

const AuditTable = ({
  items = [],
  loading = false,
  scanned = false,
  page = 1,
  pageSize = 50,
  total = 0,
  onPageChange,
  q = '',
  onSearch,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // ใช้สถานะภายในเพื่อแสดงค่าที่พิมพ์ แม้ parent ยังไม่อัปเดต q
  const [localQ, setLocalQ] = useState(q);
  useEffect(() => { setLocalQ(q || ''); }, [q]);

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="border rounded px-3 py-2 w-80 md:w-96"
          placeholder="ค้นหา: barcode / SN / ชื่อสินค้า / รุ่น"
          value={localQ}
          onChange={(e) => { const v = e.target.value; setLocalQ(v); onSearch?.(v); }}
        />
        <div className="flex items-center gap-2 text-xs">
          <div className="text-gray-500">{total} รายการ</div>
          {loading && <span className="text-blue-600 animate-pulse">กำลังโหลด...</span>}
        </div>
      </div>

      <div className="border rounded">
        {loading && <div className="p-2 text-sm text-blue-600">กำลังโหลด...</div>}
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 border-b">#</th>
              <th className="text-left p-2 border-b">Barcode</th>
              <th className="text-left p-2 border-b">SN</th>
              <th className="text-left p-2 border-b">สินค้า</th>
              {scanned && <th className="text-left p-2 border-b">Scanned At</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={scanned ? 5 : 4} className="p-3 text-center text-gray-500">กำลังโหลด...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={scanned ? 5 : 4} className="p-3 text-center text-gray-400">ไม่มีรายการ</td>
              </tr>
            ) : (
              items.map((it, idx) => (
                <tr key={it.id} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2 border-b">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="p-2 border-b font-mono">{it.barcode}</td>
                  <td className="p-2 border-b font-mono">{it.serialNumber || it.sn || it.serialNo || '-'}</td>
                  <td className="p-2 border-b">{it.product?.name}{it.product?.model ? ` (${it.product.model})` : ''}</td>
                  {scanned && <td className="p-2 border-b">{it.scannedAt ? new Date(it.scannedAt).toLocaleString() : '-'}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <div>หน้า {page} / {totalPages}</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>ย้อนกลับ</button>
          <button className="px-3 py-1 border rounded" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>ถัดไป</button>
        </div>
      </div>
    </div>
  );
};

export default AuditTable;


