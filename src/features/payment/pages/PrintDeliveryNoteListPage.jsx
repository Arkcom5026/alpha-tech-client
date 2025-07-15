import useSalesStore from '@/features/sales/store/salesStore';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';


const PrintDeliveryNoteListPage = () => {
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

  // ✅ ลบ printFormat state ออก เนื่องจากใบส่งของไม่มีแบบย่อ/เต็ม
  // const [printFormat, setPrintFormat] = useState('short'); 
  const [limit, setLimit] = useState(100);

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

  const filteredSales = (Array.isArray(printableSales) ? printableSales : []).filter((s) => {
    const query = search.toLowerCase();
    return (
      !search ||
      (s.customer?.name?.toLowerCase().includes(query) ?? false) ||
      (s.customer?.phone?.toLowerCase().includes(query) ?? false) ||
      (s.code?.toLowerCase().includes(query) ?? false)
    );
  });

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
          onChange={(e) => setLimit(parseInt(e.target.value, 10) || 0)}
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

        {/* ✅ ลบส่วนรูปแบบการพิมพ์ออก */}
        {/* <div className="ml-auto flex gap-4 items-center">
          <label className="text-sm font-medium">รูปแบบการพิมพ์:</label>
          <label className="flex items-center gap-1">
            <input type="radio" name="format" value="short" checked={printFormat === 'short'} onChange={() => setPrintFormat('short')} />
            ย่อ
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" name="format" value="full" checked={printFormat === 'full'} onChange={() => setPrintFormat('full')} />
            เต็มรูปแบบ
          </label>
        </div> */}
      </div>

      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 text-left">เลขที่ใบขาย</th>
            <th className="border px-2 py-1">ลูกค้า</th>
            <th className="border px-2 py-1">เบอร์โทร</th>
            <th className="border px-2 py-1">ยอดรวม</th>
            <th className="border px-2 py-1">วันที่ขาย</th>
            <th className="border px-2 py-1">พนักงานขาย</th>
            <th className="border px-2 py-1" colSpan={2}>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredSales.length > 0 ? (
            filteredSales.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="border px-2 py-1">{s.code || '-'}</td>
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
                    onClick={() => navigate(`/sale-detail/${s.id}`)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  >
                    รายละเอียด
                  </button>
                </td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => {
                      // ✅ แก้ไข: ไม่ต้องมีเงื่อนไข short/full แล้ว เพราะใบส่งของมีแค่แบบเดียว
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
              <td colSpan={8} className="text-center py-4">ไม่พบข้อมูล</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintDeliveryNoteListPage;
