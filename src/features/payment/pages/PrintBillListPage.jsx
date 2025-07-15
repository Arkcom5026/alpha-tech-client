import { useEffect, useState, useCallback } from 'react'; // เพิ่ม useCallback
import { useNavigate } from 'react-router-dom';
import usePaymentStore from '../store/paymentStore';


const PrintBillListPage = () => {
  const navigate = useNavigate();
  // ไม่ใช้ useState สำหรับ payments โดยตรงแล้ว แต่จะใช้ printablePayments จาก store
  const [search, setSearch] = useState('');
  // กำหนดค่าเริ่มต้นของ fromDate และ toDate เป็นเดือนปัจจุบัน
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
  const [printFormat, setPrintFormat] = useState('short');
  const [limit, setLimit] = useState(100); // เพิ่ม state สำหรับ limit, ค่าเริ่มต้น 100

  // ดึง state และ action จาก Payment Store
  const paymentStore = usePaymentStore(); // ดึง store instance โดยตรง
  const printablePayments = paymentStore.printablePayments;
  const loadPrintablePaymentsAction = paymentStore.loadPrintablePaymentsAction;

  // ฟังก์ชันสำหรับโหลดข้อมูลตามเงื่อนไขที่ผู้ใช้กำหนด
  const handleSearch = useCallback(async () => {
    const params = {
      keyword: search,
      fromDate: fromDate,
      toDate: toDate,
      limit: limit,
    };
    await loadPrintablePaymentsAction(params);
  }, [search, fromDate, toDate, limit, loadPrintablePaymentsAction]);

  // โหลดข้อมูลเริ่มต้นเมื่อ Component โหลดครั้งแรก
  useEffect(() => {
    handleSearch();
  }, [handleSearch]); // เรียกเมื่อ handleSearch เปลี่ยน (ซึ่งจะเปลี่ยนเมื่อ dependencies ของมันเปลี่ยน)

  // กรองข้อมูลที่ได้จาก Store ด้วย keyword (วันที่และ limit ถูกกรองที่ Back-end แล้ว)
  const filteredPayments = (Array.isArray(printablePayments) ? printablePayments : []).filter((p) => {
    const query = search.toLowerCase();
    const matchSearch =
      !search ||
      (p.sale?.customer?.name?.toLowerCase().includes(query) ?? false) ||
      (p.sale?.customer?.phone?.toLowerCase().includes(query) ?? false) || // ใช้ toLowerCase() กับ phone ด้วย
      (p.sale?.code?.toLowerCase().includes(query) ?? false); // เพิ่มการค้นหาจาก sale code

    // isCancelled ถูกกรองที่ backend แล้ว
    return matchSearch;
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">พิมพ์ใบเสร็จย้อนหลัง</h1>

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, หรือรหัส..." // ปรับ placeholder
          className="border px-2 py-1 w-72 rounded" // เพิ่ม rounded
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border px-2 py-1 rounded" // เพิ่ม rounded
        />
        <span>ถึง</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border px-2 py-1 rounded" // เพิ่ม rounded
        />
        {/* เพิ่มช่องใส่ Limit */}
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value, 10) || 0)} // แปลงเป็นตัวเลข
          placeholder="จำนวน"
          className="border px-2 py-1 w-24 rounded" // เพิ่ม rounded
          min="1"
        />
        {/* เพิ่มปุ่มค้นหา */}
        <button
          onClick={handleSearch}
          className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
        >
          ค้นหา
        </button>

        <div className="ml-auto flex gap-4 items-center">
          <label className="text-sm font-medium">รูปแบบการพิมพ์:</label>
          <label className="flex items-center gap-1"> {/* จัดกลุ่มด้วย flex */}
            <input type="radio" name="format" value="short" checked={printFormat === 'short'} onChange={() => setPrintFormat('short')} /> ย่อ
          </label>
          <label className="flex items-center gap-1"> {/* จัดกลุ่มด้วย flex */}
            <input type="radio" name="format" value="full" checked={printFormat === 'full'} onChange={() => setPrintFormat('full')} /> เต็มรูปแบบ
          </label>
        </div>
      </div>

      <table className="w-full text-sm border-collapse"> {/* ใช้ border-collapse */}
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 text-left">เลขที่</th>
            <th className="border px-2 py-1">ลูกค้า</th>
            <th className="border px-2 py-1">เบอร์โทร</th>
            <th className="border px-2 py-1">ยอดที่ชำระ</th>
            <th className="border px-2 py-1">วันที่รับเงิน</th>
            <th className="border px-2 py-1">ผู้รับเงิน</th>
            <th className="border px-2 py-1" colSpan={2}>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.length > 0 ? (
            filteredPayments.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="border px-2 py-1">{p.sale?.code || '-'}</td>
                <td className="border px-2 py-1">{p.sale?.customer?.name || '-'}</td>
                <td className="border px-2 py-1">{p.sale?.customer?.phone || '-'}</td>
                <td className="border px-2 py-1 text-right">
                  {p.amount != null
                    ? parseFloat(p.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })
                    : '-'}
                </td>
                <td className="border px-2 py-1">
                  {new Date(p.receivedAt).toLocaleString('th-TH', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
                <td className="border px-2 py-1">{p.employeeProfile?.name || '-'}</td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => navigate(`/sale-detail/${p.saleId}`)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  >
                    รายละเอียด
                  </button>
                </td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => {
                      const path = printFormat === 'short'
                          ? `/pos/sales/bill/print-short/${p.saleId}`
                          : `/pos/sales/bill/print-full/${p.saleId}`;
                      navigate(path, { state: { payment: p } });
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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

export default PrintBillListPage;
