


//  src/features/bill/pages/PrintBillListPage.jsx

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useSalesStore from '@/features/sales/store/salesStore';

const PrintBillListPage = () => {
  // ✅ guard against double initial fetch in React StrictMode (dev only)
  const didInitRef = useRef(false);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    // ✅ Default: last 30 days (inclusive) in local time
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 30);

    const pad2 = (n) => String(n).padStart(2, '0');
    const toLocalYMD = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    return toLocalYMD(start);
  });
  const [toDate, setToDate] = useState(() => {
    // ✅ Default: today (local)
    const today = new Date();
    const pad2 = (n) => String(n).padStart(2, '0');
    const toLocalYMD = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    return toLocalYMD(today);
  });
  const [printFormat, setPrintFormat] = useState('short');
  const [limit, setLimit] = useState(100);
  const [uiError, setUiError] = useState(null);
  const [lastQuery, setLastQuery] = useState(null);
  const [lastSearchedAt, setLastSearchedAt] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // ✅ Client-side sorting (UX only; BE already orders by createdAt desc)
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const salesStore = useSalesStore();
  const printableSales = salesStore.printableSales;
  const loading = salesStore.loading;
  const error = salesStore.error;
  const loadPrintableSalesAction = salesStore.loadPrintableSalesAction;

  const clampLimit = (n) => {
    const parsed = parseInt(n, 10);
    const safe = Number.isFinite(parsed) ? parsed : 100;
    return Math.min(Math.max(safe, 1), 500);
  };

  const handleSearch = useCallback(async () => {
    setUiError(null);

    if (fromDate && toDate && fromDate > toDate) {
      setUiError('ช่วงวันที่ไม่ถูกต้อง: วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');
      return;
    }

    const params = {
      keyword: search,
      fromDate,
      toDate,
      limit: clampLimit(limit),
      // ✅ BE should pre-filter for Bill list (printable when has at least 1 payment)
      onlyPaid: 1,
    };

    setLastQuery(params);
    setLastSearchedAt(new Date().toISOString());

    await loadPrintableSalesAction(params);
  }, [search, fromDate, toDate, limit, loadPrintableSalesAction]);

  useEffect(() => {
    // In React StrictMode (dev), effect runs twice.
    // Prevent duplicate initial fetch while keeping production behavior unchanged.
    if (didInitRef.current) return;
    didInitRef.current = true;
    handleSearch();
  }, [handleSearch]);

  const rowsRaw = Array.isArray(printableSales) ? printableSales : [];

  // ✅ Defensive UI guard: Bill list must show only sales with at least 1 payment
  // Even if BE filtering is misconfigured, we won't show "ยังไม่ชำระ" items here.
  const rows = rowsRaw.filter((r) => Number(r?.paidAmount || 0) > 0);

  const getSortVal = (row, key) => {
    if (!row) return null;
    if (key === 'totalAmount' || key === 'paidAmount' || key === 'balanceAmount') {
      return Number(row?.[key] || 0);
    }
    if (key === 'createdAt' || key === 'lastPaidAt') {
      const v = row?.[key];
      return v ? new Date(v).getTime() : 0;
    }
    return String(row?.[key] ?? '').toLowerCase();
  };

  const toggleSort = (key) => {
    if (!key) return;
    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDir('asc');
        return key;
      }
      setSortDir((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
      return prevKey;
    });
  };

  const sortIndicator = (key) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  const sortedRows = [...rows].sort((a, b) => {
    const av = getSortVal(a, sortKey);
    const bv = getSortVal(b, sortKey);

    if (av === bv) return 0;
    const dir = sortDir === 'asc' ? 1 : -1;

    // numbers / timestamps
    if (typeof av === 'number' && typeof bv === 'number') return av > bv ? dir : -dir;

    // strings
    return String(av) > String(bv) ? dir : -dir;
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">พิมพ์ใบเสร็จย้อนหลัง</h1>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-700">
        <div className="font-medium">ผลลัพธ์:</div>
        <div className="px-2 py-0.5 rounded bg-gray-100">{sortedRows.length} รายการ</div>
        {loading ? <div className="text-gray-500">กำลังโหลด…</div> : null}
        <button
          type="button"
          className="ml-auto text-xs underline text-gray-600 hover:text-gray-800"
          onClick={() => setShowDebug((v) => !v)}
        >
          {showDebug ? 'ซ่อนดีบัก' : 'แสดงดีบัก'}
        </button>
      </div>

      {showDebug ? (
        <div className="mb-3 p-3 border rounded bg-gray-50 text-xs text-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <div className="font-semibold mb-1">ตัวกรองที่ส่งไป BE</div>
              <div>
                keyword: <span className="font-mono">{String(lastQuery?.keyword ?? '')}</span>
              </div>
              <div>
                fromDate: <span className="font-mono">{String(lastQuery?.fromDate ?? '')}</span>
              </div>
              <div>
                toDate: <span className="font-mono">{String(lastQuery?.toDate ?? '')}</span>
              </div>
              <div>
                limit: <span className="font-mono">{String(lastQuery?.limit ?? '')}</span>
              </div>
              <div>
                onlyPaid: <span className="font-mono">{String(lastQuery?.onlyPaid ?? '')}</span>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">สถานะ Store</div>
              <div>
                loading: <span className="font-mono">{String(loading)}</span>
              </div>
              <div>
                error: <span className="font-mono">{String(error ?? '')}</span>
              </div>
              <div>
                lastSearchedAt: <span className="font-mono">{String(lastSearchedAt ?? '')}</span>
              </div>
              <div>
                printableSales(raw):{' '}
                <span className="font-mono">
                  {String(Array.isArray(printableSales) ? printableSales.length : 'not-array')}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2 text-gray-600">
            ถ้าไม่พบข้อมูล ให้ลอง: (1) ขยายช่วงวันที่ (2) เพิ่ม limit (3) ตรวจ branchId/token ฝั่ง BE
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, หรือรหัสใบขาย..."
          className="border px-2 py-1 w-72 rounded"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <span>ถึง</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          onBlur={() => setLimit(clampLimit(limit))}
          placeholder="จำนวน"
          className="border px-2 py-1 w-24 rounded"
          min="1"
        />
        <button
          onClick={handleSearch}
          className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'กำลังค้นหา…' : 'ค้นหา'}
        </button>

        <div className="ml-auto flex gap-4 items-center">
          <label className="text-sm font-medium">รูปแบบการพิมพ์:</label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="format"
              value="short"
              checked={printFormat === 'short'}
              onChange={() => setPrintFormat('short')}
            />{' '}
            ย่อ
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="format"
              value="full"
              checked={printFormat === 'full'}
              onChange={() => setPrintFormat('full')}
            />{' '}
            เต็มรูปแบบ
          </label>
        </div>
      </div>

      {uiError ? (
        <div className="mb-3 p-3 border border-amber-300 bg-amber-50 text-amber-800 rounded">
          {uiError}
        </div>
      ) : null}

      {error ? (
        <div className="mb-3 p-3 border border-red-300 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      ) : null}

      <div className="overflow-auto border rounded" style={{ maxHeight: 520 }}>
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th
              className="border px-2 py-1 text-left sticky top-0 bg-gray-100 z-10 cursor-pointer select-none"
              onClick={() => toggleSort('code')}
              title="เรียงตามเลขที่"
            >
              เลขที่{sortIndicator('code')}
            </th>
            <th
              className="border px-2 py-1 sticky top-0 bg-gray-100 z-10 cursor-pointer select-none"
              onClick={() => toggleSort('companyName')}
              title="เรียงตามหน่วยงาน"
            >
              หน่วยงาน{sortIndicator('companyName')}
            </th>
            <th
              className="border px-2 py-1 sticky top-0 bg-gray-100 z-10 cursor-pointer select-none"
              onClick={() => toggleSort('customerName')}
              title="เรียงตามชื่อลูกค้า"
            >
              ลูกค้า{sortIndicator('customerName')}
            </th>
            <th className="border px-2 py-1 sticky top-0 bg-gray-100 z-10">เบอร์โทร</th>
            <th
              className="border px-2 py-1 sticky top-0 bg-gray-100 z-10 cursor-pointer select-none"
              onClick={() => toggleSort('totalAmount')}
              title="เรียงตามยอดรวม"
            >
              ยอดรวม{sortIndicator('totalAmount')}
            </th>
            <th
              className="border px-2 py-1 sticky top-0 bg-gray-100 z-10 cursor-pointer select-none"
              onClick={() => toggleSort('paidAmount')}
              title="เรียงตามยอดชำระแล้ว"
            >
              ชำระแล้ว{sortIndicator('paidAmount')}
            </th>
            <th
              className="border px-2 py-1 sticky top-0 bg-gray-100 z-10 cursor-pointer select-none"
              onClick={() => toggleSort('balanceAmount')}
              title="เรียงตามยอดค้างชำระ"
            >
              ค้างชำระ{sortIndicator('balanceAmount')}
            </th>
            <th
              className="border px-2 py-1 sticky top-0 bg-gray-100 z-10 cursor-pointer select-none"
              onClick={() => toggleSort('createdAt')}
              title="เรียงตามวันที่ขาย"
            >
              วันที่ขาย{sortIndicator('createdAt')}
            </th>
            <th
              className="border px-2 py-1 sticky top-0 bg-gray-100 z-10 cursor-pointer select-none"
              onClick={() => toggleSort('lastPaidAt')}
              title="เรียงตามรับเงินล่าสุด"
            >
              รับเงินล่าสุด{sortIndicator('lastPaidAt')}
            </th>
            <th className="border px-2 py-1 sticky top-0 bg-gray-100 z-10">ผู้รับเงิน</th>
            <th className="border px-2 py-1 sticky top-0 bg-gray-100 z-10" colSpan={2}>
              การดำเนินการ
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.length > 0 ? (
            sortedRows.map((s) => {
              // ✅ เปิดพิมพ์เมื่อมีการรับชำระอย่างน้อย 1 ครั้ง
              const canPrint = Number(s?.paidAmount || 0) > 0;
              const isFullyPaid = Number(s?.balanceAmount || 0) <= 0 && canPrint;
              return (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="border px-2 py-1">{s.code || '-'}</td>
                  <td className="border px-2 py-1">{s.companyName || '-'}</td>
                  <td className="border px-2 py-1">{s.customerName || '-'}</td>
                  <td className="border px-2 py-1">{s.customerPhone || '-'}</td>
                  <td className="border px-2 py-1 text-right">
                    {Number(s.totalAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {Number(s.paidAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {Number(s.balanceAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    {canPrint ? (
                      <span
                        className={`ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                          isFullyPaid ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}
                        title={isFullyPaid ? 'ชำระครบแล้ว' : 'มีการรับชำระแล้ว (อาจยังค้าง)'}
                      >
                        {isFullyPaid ? 'ชำระครบ' : 'รับชำระแล้ว'}
                      </span>
                    ) : (
                      <span
                        className="ml-2 inline-flex items-center rounded bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium"
                        title="ยังไม่มีการรับชำระ"
                      >
                        ยังไม่ชำระ
                      </span>
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {s.createdAt
                      ? new Date(s.createdAt).toLocaleDateString('th-TH', { dateStyle: 'short' })
                      : '-'}
                  </td>
                  <td className="border px-2 py-1">
                    {s.lastPaidAt
                      ? new Date(s.lastPaidAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
                      : '-'}
                  </td>
                  <td className="border px-2 py-1">{s.employeeName || '-'}</td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => navigate(`/sale-detail/${s.id}`)}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                    >
                      รายละเอียด
                    </button>
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => {
                        if (!canPrint) return;
                        const basePath =
                          printFormat === 'short'
                            ? `/pos/sales/bill/print-short/${s.id}`
                            : `/pos/sales/bill/print-full/${s.id}`;
                        // หน้า print refetch จาก DB อยู่แล้ว → ไม่ต้องพึ่ง state (กันข้อมูล stale)
                        navigate(basePath);
                      }}
                      className={`px-3 py-1 rounded ${
                        canPrint
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      title={canPrint ? 'พิมพ์ใบเสร็จ' : 'ยังไม่มีการรับชำระ จึงพิมพ์ใบเสร็จไม่ได้'}
                    >
                      {canPrint ? 'พิมพ์' : 'ยังไม่ชำระ'}
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={12} className="text-center py-6 text-gray-600">
                ไม่พบข้อมูล
                <div className="mt-2 text-xs text-gray-500">แนะนำ: ลองขยายช่วงวันที่ หรือเพิ่ม limit แล้วกดค้นหาอีกครั้ง</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        หมายเหตุ: หน้านี้แสดงเฉพาะ “ใบขายที่มีการรับชำระแล้วอย่างน้อย 1 ครั้ง” (กรองจาก BE ด้วย onlyPaid=1) ตามช่วงวันที่ขาย (createdAt). ค่าเริ่มต้น = ย้อนหลัง 30 วันถึงวันนี้
      </div>
    </div>
  );
};

export default PrintBillListPage;










