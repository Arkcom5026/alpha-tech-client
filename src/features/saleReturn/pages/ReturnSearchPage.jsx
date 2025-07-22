import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSaleReturnStore from '@/features/saleReturn/store/saleReturnStore';

const ReturnSearchPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { returnableSales, loadReturnableSalesAction } = useSaleReturnStore();

  useEffect(() => {
    if (returnableSales.length === 0) {
      loadReturnableSalesAction();
      
    }
  }, []);

  const filteredSales = returnableSales.filter((sale) => {
    const query = search.toLowerCase();
    const matchSearch =
      !search ||
      (sale.code?.toLowerCase().includes(query) ?? false) ||
      (sale.customer?.companyName?.toLowerCase().includes(query) ?? false) ||
      (sale.customer?.name?.toLowerCase().includes(query) ?? false) ||
      (sale.customer?.phone?.includes(query) ?? false);

    const soldDate = new Date(sale.soldAt);
    const matchDate = (!fromDate || new Date(fromDate) <= soldDate) &&
                      (!toDate || soldDate <= new Date(toDate));

    return matchSearch && matchDate;
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">ค้นหาเพื่อคืนสินค้า</h1>

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาเลขที่ใบขาย, ชื่อลูกค้า, เบอร์โทร..."
          className="border px-2 py-1 w-72"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border px-2 py-1"
        />
        <span>ถึง</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border px-2 py-1"
        />
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 text-left">เลขที่</th>
            <th className="border px-2 py-1">หน่วยงาน</th>
            <th className="border px-2 py-1">ลูกค้า</th>
            <th className="border px-2 py-1">เบอร์โทร</th>
            <th className="border px-2 py-1">ยอดรวม</th>
            <th className="border px-2 py-1">วันที่ขาย</th>
            <th className="border px-2 py-1 text-center">คืนสินค้า</th>
          </tr>
        </thead>
        <tbody>
          {filteredSales.length > 0 ? (
            filteredSales.map((sale) => (
              <tr key={sale.id} className="border-t">
                <td className="border px-2 py-1">{sale.code || '-'}</td>
                <td className="border px-2 py-1">{sale.customer?.companyName || '-'}</td>
                <td className="border px-2 py-1">{sale.customer?.name || '-'}</td>
                <td className="border px-2 py-1">{sale.customer?.phone || '-'}</td>
                <td className="border px-2 py-1 text-right">
                  {sale.totalAmount?.toLocaleString('th-TH', { minimumFractionDigits: 2 }) || '0.00'}
                </td>
                <td className="border px-2 py-1">
                  {new Date(sale.soldAt).toLocaleString('th-TH', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => navigate(`/pos/sales/sale-return/create/${sale.id}`)}
                    className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                  >
                    คืนสินค้า
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-4">ไม่พบข้อมูล</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReturnSearchPage;
