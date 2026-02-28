






import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSalesStore from '@/features/sales/store/salesStore';

const DeliveryNoteListPage = () => {
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
      // ✅ BE should filter unpaid for Delivery Note list
      onlyUnpaid: 1,
    };

    setLastQuery(params);
    setLastSearchedAt(new Date().toISOString());

    await loadPrintableSalesAction(params);
  }, [search, fromDate, toDate, limit, loadPrintableSalesAction]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const rawRows = Array.isArray(printableSales) ? printableSales : [];

  // ----- normalize helpers (defensive; supports multiple BE shapes)
  const getPaidAmount = (s) => {
    const candidates = [s?.paidAmount, s?.paidTotal, s?.paid, s?.paidSum, s?.totalPaid];
    for (const v of candidates) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }

    const p = Array.isArray(s?.payments) ? s.payments : null;
    if (p && p.length > 0) {
      const sum = p.reduce((acc, it) => {
        const n = Number(it?.amount ?? it?.receivedAmount ?? 0);
        return acc + (Number.isFinite(n) ? n : 0);
      }, 0);
      return Number.isFinite(sum) ? sum : 0;
    }

    return 0;
  };

  const getRemainingAmount = (s) => {
    const candidates = [s?.remainingAmount, s?.balanceDue, s?.unpaidAmount, s?.dueAmount, s?.balanceAmount];
    for (const v of candidates) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }

    const total = Number(s?.totalAmount ?? 0);
    const paid = getPaidAmount(s);
    if (Number.isFinite(total)) return Math.max(0, total - paid);
    return 0;
  };

  const isUnpaidSale = (s) => {
    const remaining = getRemainingAmount(s);
    if (Number.isFinite(remaining) && remaining > 0.0001) return true;

    const total = Number(s?.totalAmount ?? 0);
    const paid = getPaidAmount(s);
    if (Number.isFinite(total) && Number.isFinite(paid) && total > 0 && paid + 0.0001 < total) return true;

    if (s?.isPaid === false) return true;
    if (s?.paymentStatus && String(s.paymentStatus).toUpperCase() === 'UNPAID') return true;

    return false;
  };

  const rows = useMemo(() => {
    // ✅ Delivery Note list: show ONLY unpaid sales (follow Print Receipt list policy)
    const unpaidOnly = rawRows.filter((s) => isUnpaidSale(s));

    const query = search.trim().toLowerCase();
    if (!query) {
      return unpaidOnly.map((s) => {
        const totalAmount = Number(s?.totalAmount ?? 0);
        const paidAmount = getPaidAmount(s);
        const balanceAmount = getRemainingAmount(s);
        return {
          id: s.id,
          code: s.code,
          companyName: s?.companyName ?? s?.customer?.companyName ?? '-',
          customerName: s?.customerName ?? s?.customer?.name ?? '-',
          customerPhone: s?.customerPhone ?? s?.customer?.phone ?? '-',
          totalAmount,
          paidAmount,
          balanceAmount,
          createdAt: s?.createdAt ?? s?.soldAt ?? null,
          lastPaidAt: s?.lastPaidAt ?? s?.lastReceivedAt ?? null,
          employeeName: s?.employeeName ?? s?.employee?.name ?? '-',
        };
      });
    }

    return unpaidOnly
      .filter((s) => {
        const hay = [
          s?.customer?.companyName,
          s?.customer?.name,
          s?.customer?.phone,
          s?.companyName,
          s?.customerName,
          s?.customerPhone,
          s?.code,
        ]
          .map((v) => String(v ?? '').toLowerCase())
          .join(' | ');

        return hay.includes(query);
      })
      .map((s) => {
        const totalAmount = Number(s?.totalAmount ?? 0);
        const paidAmount = getPaidAmount(s);
        const balanceAmount = getRemainingAmount(s);
        return {
          id: s.id,
          code: s.code,
          companyName: s?.companyName ?? s?.customer?.companyName ?? '-',
          customerName: s?.customerName ?? s?.customer?.name ?? '-',
          customerPhone: s?.customerPhone ?? s?.customer?.phone ?? '-',
          totalAmount,
          paidAmount,
          balanceAmount,
          createdAt: s?.createdAt ?? s?.soldAt ?? null,
          lastPaidAt: s?.lastPaidAt ?? s?.lastReceivedAt ?? null,
          employeeName: s?.employeeName ?? s?.employee?.name ?? '-',
        };
      });
  }, [rawRows, search]);

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
      <h1 className="text-xl font-bold mb-2">พิมพ์ใบส่งของย้อนหลัง</h1>
      <div className="mb-2 text-xs text-gray-600">
        หมายเหตุ: หน้านี้แสดงเฉพาะ “ใบขายที่ยังค้างชำระ” (กรองจาก BE ด้วย onlyUnpaid=1) เพื่อใช้พิมพ์ใบส่งของ โดยค่าเริ่มต้นจะแสดงย้อนหลัง 30 วันถึงวันนี้
      </div>

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
                onlyUnpaid: <span className="font-mono">{String(lastQuery?.onlyUnpaid ?? '')}</span>
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
          <div className="mt-2 text-gray-600">ถ้าไม่พบข้อมูล ให้ลอง: (1) ขยายช่วงวันที่ (2) เพิ่ม limit (3) ตรวจ branchId/token ฝั่ง BE</div>
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
      </div>

      {uiError ? (
        <div className="mb-3 p-3 border border-amber-300 bg-amber-50 text-amber-800 rounded">{uiError}</div>
      ) : null}

      {error ? (
        <div className="mb-3 p-3 border border-red-300 bg-red-50 text-red-700 rounded">{error}</div>
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
                // ✅ Delivery note: list is unpaid-only -> always allow print
                const canPrint = true;
                const isFullyPaid = false;
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
                      <span
                        className={`ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                          isFullyPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                        }`}
                        title="ค้างชำระ"
                      >
                        ค้างชำระ
                      </span>
                    </td>
                    <td className="border px-2 py-1">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString('th-TH', { dateStyle: 'short' }) : '-'}
                    </td>
                    <td className="border px-2 py-1">
                      {s.lastPaidAt
                        ? new Date(s.lastPaidAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
                        : '-'}
                    </td>
                    <td className="border px-2 py-1">{s.employeeName || '-'}</td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        onClick={() => navigate(`/pos/sales/detail/${s.id}`)}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        รายละเอียด
                      </button>
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        onClick={() => {
                          if (!canPrint) return;
                          navigate(`/pos/sales/delivery-note/print/${s.id}`);
                        }}
                        className={`px-3 py-1 rounded ${
                          canPrint ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        title={canPrint ? 'พิมพ์ใบส่งของ' : 'ไม่สามารถพิมพ์ได้'}
                      >
                        {canPrint ? 'พิมพ์ซ้ำ' : 'พิมพ์ไม่ได้'}
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
        หมายเหตุ: หน้านี้แสดงเฉพาะ “ใบขายค้างชำระ” (onlyUnpaid=1) ตามช่วงวันที่ขาย (createdAt). ค่าเริ่มต้น = ย้อนหลัง 30 วันถึงวันนี้ และปุ่มพิมพ์จะแสดงได้ทันทีสำหรับการพิมพ์ใบส่งของ
      </div>
    </div>
  );
};

export default DeliveryNoteListPage;













