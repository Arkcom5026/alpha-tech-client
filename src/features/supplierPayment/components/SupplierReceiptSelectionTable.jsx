import React, { useState } from 'react';
import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import 'dayjs/locale/th';
import { useNavigate } from 'react-router-dom';

dayjs.extend(buddhistEra);
dayjs.locale('th');

const SupplierReceiptSelectionTable = ({ receipts, isLoading, selectedReceipts, onToggle, onAmountPaidChange, selectedReceiptsTotal, totalOutstandingAmount, onSearch, supplierId, onToggleAll }) => {
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [limit, setLimit] = useState(5);
  const navigate = useNavigate();

  const isSelected = (receiptId) => selectedReceipts.some((r) => r.receiptId === receiptId);

  // ✅ FIX: This function now returns the raw, unformatted number for easier editing.
  const getAmountPaid = (receiptId) => {
    const selected = selectedReceipts.find(r => r.receiptId === receiptId);
    if (selected && selected.amountPaid !== undefined && selected.amountPaid !== null) {
      return String(selected.amountPaid);
    }
    return '';
  };

  const handleSearch = () => onSearch(startDate, endDate, limit);
  const handleNavigateToHistory = () => {
    if (supplierId) navigate(`/pos/finance/payments/detail/${supplierId}`);
  };

  const payableReceipts = receipts.filter(r => ((r.totalAmount || 0) - (r.paidAmount || 0)) > 0);
  const selectedPayableCount = payableReceipts.filter(r => isSelected(r.id)).length;
  
  const areAllSelected = payableReceipts.length > 0 && selectedPayableCount === payableReceipts.length;
  const isIndeterminate = selectedPayableCount > 0 && selectedPayableCount < payableReceipts.length;

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">เลือกใบรับของที่ต้องการชำระ</h3>
        <button type="button" onClick={handleNavigateToHistory} className="bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 text-sm">
          ดูประวัติการชำระ
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
          <input type="date" id="startDate" className="w-full border-gray-300 rounded-md" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">ถึงวันที่</label>
          <input type="date" id="endDate" className="w-full border-gray-300 rounded-md" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
        </div>
        <div>
          <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">จำนวนสูงสุด</label>
          <select id="limit" className="w-full border-gray-300 rounded-md" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value={5}>5</option><option value={10}>10</option><option value={15}>15</option><option value={20}>20</option>
          </select>
        </div>
        <button type="button" onClick={handleSearch} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-md hover:bg-blue-700">
          ค้นหา
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-3 text-center text-xs font-semibold text-blue-700 uppercase">
                <input 
                  type="checkbox"
                  className="form-checkbox h-4 w-4"
                  ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                  checked={areAllSelected}
                  onChange={onToggleAll}
                />
              </th>
              <th className="p-3 text-left text-xs font-semibold text-blue-700 uppercase">เลขที่ใบรับของ</th>
              <th className="p-3 text-left text-xs font-semibold text-blue-700 uppercase">วันที่รับ</th>
              <th className="p-3 text-right text-xs font-semibold text-blue-700 uppercase">ยอดรวม</th>
              <th className="p-3 text-right text-xs font-semibold text-blue-700 uppercase">ชำระแล้ว</th>
              <th className="p-3 text-right text-xs font-semibold text-blue-700 uppercase">ยอดคงเหลือ</th>
              <th className="p-3 text-right text-xs font-semibold text-blue-700 uppercase">ยอดที่จ่าย</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>กำลังโหลดข้อมูลใบรับของ...</span>
                  </div>
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr><td colSpan="7" className="p-6 text-center text-gray-500">ไม่พบใบรับของที่พร้อมชำระ</td></tr>
            ) : (
              receipts.map((r, index) => {
                const remaining = (r.totalAmount || 0) - (r.paidAmount || 0);
                const isReceiptSelected = isSelected(r.id);
                return (
                  <tr key={r.id} className="hover:bg-yellow-50">
                    <td className="p-3 text-center"><input type="checkbox" checked={isReceiptSelected} onChange={() => onToggle(r)} className="form-checkbox h-4 w-4"/></td>
                    <td className="p-3 text-sm text-gray-800">{r.code}</td>
                    <td className="p-3 text-sm text-gray-600">{dayjs(r.receivedDate).format('DD MMM BBBB')}</td>
                    <td className="p-3 text-sm text-right font-medium">{r.totalAmount?.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td className="p-3 text-sm text-right text-orange-500">{r.paidAmount?.toLocaleString('en-US', {minimumFractionDigits: 2}) || '0.00'}</td>
                    <td className="p-3 text-sm text-right font-semibold text-red-600">{remaining.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td className="p-3 text-sm text-right">
                      {/* ✅ FIX: Changed to type="number" for better UX and removed formatting from value */}
                      <input 
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-28 text-right border-gray-300 rounded-md disabled:bg-gray-100" 
                        value={getAmountPaid(r.id)} 
                        onChange={(e) => onAmountPaidChange(r.id, e.target.value)} 
                        disabled={!isReceiptSelected}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="text-base text-right pt-4 text-blue-700 font-bold">
        <p>รวมยอดคงเหลือทุกรายการ :  <span className="text-red-600">{totalOutstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span></p>
        <p>รวมยอดที่เลือกชำระ :  <span className="text-green-600">{selectedReceiptsTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span></p>
      </div>
    </div>
  );
};

export default SupplierReceiptSelectionTable;
