import useSalesStore from '@/features/sales/store/salesStore';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const DeliveryNoteListPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDayOfMonth.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return lastDayOfMonth.toISOString().split('T')[0];
  });

  const [limit, setLimit] = useState(100);
  const [showCompanyColumn, setShowCompanyColumn] = useState(false);

  const saleStore = useSalesStore();
  const printableSales = saleStore.printableSales;

  const handleSearch = useCallback(async () => {
    const params = {
      keyword: search,
      fromDate: fromDate,
      toDate: toDate,
      limit: limit,
    };
    await saleStore.loadPrintableSalesAction(params);
  }, [search, fromDate, toDate, limit, saleStore]);

  // useEffect สำหรับโหลดข้อมูลครั้งแรก
  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  // ✅ New useEffect to determine if company column should be shown
  useEffect(() => {
    const hasCompanyCustomer = (Array.isArray(printableSales) ? printableSales : []).some(s =>
      (s.customer?.type === 'ORGANIZATION' || s.customer?.type === 'GOVERNMENT') && s.customer?.companyName
    );
    setShowCompanyColumn(hasCompanyCustomer);
  }, [printableSales]); // Re-run this effect only when printableSales changes

  const filteredSales = (Array.isArray(printableSales) ? printableSales : []).filter((s) => {
    const query = search.toLowerCase();
    let matchSearch = false;

    // Logic for determining showCompanyColumn is now in useEffect above
    // Removed setShowCompanyColumn(true) from here.

    matchSearch =
      !search ||
      (s.customer?.name?.toLowerCase().includes(query) ?? false) ||
      (s.customer?.phone?.toLowerCase().includes(query) ?? false) ||
      (s.code?.toLowerCase().includes(query) ?? false);

    // ✅ เพิ่มการค้นหาด้วย companyName ถ้าคอลัมน์ถูกแสดง
    if (s.customer?.companyName) { // Check companyName existence for search, not for column visibility state
      matchSearch = matchSearch || (s.customer.companyName.toLowerCase().includes(query) ?? false);
    }

    return matchSearch;
  });

  // Helper function เพื่อสร้างหัวตารางแบบมีเงื่อนไข
  const getTableHeaders = () => {
    return (
      <tr>
        <th className="border px-2 py-1 text-left">เลขที่ใบขาย</th>
        {showCompanyColumn && <th className="border px-2 py-1">หน่วยงาน</th>}
        <th className="border px-2 py-1">ลูกค้า/ผู้ติดต่อ</th>
        <th className="border px-2 py-1">เบอร์โทร</th>
        <th className="border px-2 py-1">ยอดรวม</th>
        <th className="border px-2 py-1">วันที่ขาย</th>
        <th className="border px-2 py-1">พนักงานขาย</th>
        <th className="border px-2 py-1" colSpan={2}>การดำเนินการ</th>
      </tr>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">พิมพ์ใบส่งของย้อนหลัง</h1>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, หรือรหัส..."
          className="border px-2 py-1 w-72 rounded"
        />
        <input
          type="date" value={fromDate} max={new Date().toISOString().split('T')[0]}
          onChange={(e) => setFromDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <span>ถึง</span>
        <input
          type="date" value={toDate} max={new Date().toISOString().split('T')[0]}
          onChange={(e) => setToDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value, 10) || 100)}
          placeholder="จำนวน"
          className="border px-2 py-1 w-24 rounded"
          min="1"
        />
        <button
          onClick={handleSearch}
          className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
        >
          ค้นหา
        </button>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100">
          {getTableHeaders()}
        </thead>
        <tbody>
          {filteredSales.length > 0 ? (
            filteredSales.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="border px-2 py-1">{s.code || '-'}</td>
                {showCompanyColumn && <td className="border px-2 py-1">{s.customer?.companyName || '-'}</td>}
                <td className="border px-2 py-1">{s.customer?.name || '-'}</td>
                <td className="border px-2 py-1">{s.customer?.phone || '-'}</td>
                <td className="border px-2 py-1 text-right">
                  {s.totalAmount != null
                    ? parseFloat(s.totalAmount).toLocaleString('th-TH', { minimumFractionDigits: 2 })
                    : '-'}
                </td>
                <td className="border px-2 py-1">
                  {new Date(s.soldAt).toLocaleString('th-TH', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
                <td className="border px-2 py-1">{s.employee?.name || '-'}</td>
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
                      const path = `/pos/sales/delivery-note/print/${s.id}`;
                      navigate(path, { state: { sale: s } });
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    พิมพ์ซ้ำ
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={showCompanyColumn ? 9 : 8} className="text-center py-4">ไม่พบข้อมูล</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveryNoteListPage;
