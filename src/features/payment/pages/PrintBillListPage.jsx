import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import usePaymentStore from '../store/paymentStore';


const PrintBillListPage = () => {
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
  const [printFormat, setPrintFormat] = useState('short');
  const [limit, setLimit] = useState(100);

  const paymentStore = usePaymentStore();
  const printablePayments = paymentStore.printablePayments;
  const loadPrintablePaymentsAction = paymentStore.loadPrintablePaymentsAction;

  const handleSearch = useCallback(async () => {
    const params = {
      keyword: search,
      fromDate: fromDate,
      toDate: toDate,
      limit: limit,
    };
    await loadPrintablePaymentsAction(params);
  }, [search, fromDate, toDate, limit, loadPrintablePaymentsAction]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const filteredPayments = (Array.isArray(printablePayments) ? printablePayments : []).filter((p) => {
    const query = search.toLowerCase();
    const matchSearch =
      !search ||
      (p.sale?.customer?.name?.toLowerCase().includes(query) ?? false) ||
      (p.sale?.customer?.phone?.toLowerCase().includes(query) ?? false) ||
      (p.sale?.code?.toLowerCase().includes(query) ?? false);

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

        <div className="ml-auto flex gap-4 items-center">
          <label className="text-sm font-medium">รูปแบบการพิมพ์:</label>
          <label className="flex items-center gap-1">
            <input type="radio" name="format" value="short" checked={printFormat === 'short'} onChange={() => setPrintFormat('short')} /> ย่อ
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" name="format" value="full" checked={printFormat === 'full'} onChange={() => setPrintFormat('full')} /> เต็มรูปแบบ
          </label>
        </div>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 text-left">เลขที่</th>
            <th className="border px-2 py-1">ลูกค้า</th>
            <th className="border px-2 py-1">เบอร์โทร</th>
            <th className="border px-2 py-1">ยอดที่ชำระ</th>
            <th className="border px-2 py-1">วันที่รับเงิน</th>
            <th className="border px-2 py-1">ผู้รับเงิน</th>
            <th className="border px-2 py-1">รุ่นสินค้า</th>
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
                <td className="border px-2 py-1">{p.sale?.items?.[0]?.stockItem?.product?.model || '-'}</td>
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
              <td colSpan={9} className="text-center py-4">ไม่พบข้อมูล</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintBillListPage;
