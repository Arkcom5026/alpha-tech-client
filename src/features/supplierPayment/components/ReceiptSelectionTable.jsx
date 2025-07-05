import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra'; // Import the plugin
import 'dayjs/locale/th';

dayjs.extend(buddhistEra); // Extend dayjs with the plugin
dayjs.locale('th');

const ReceiptSelectionTable = ({ receipts, selectedReceipts, onToggle, onAmountPaidChange, totalAmount, onSearch }) => {
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [limit, setLimit] = useState(10);

  // Checks if a receipt is already selected
  const isSelected = (receiptId) =>
    selectedReceipts.some((r) => r.receiptId === receiptId);

  // Gets the amount paid for a specific receipt from selectedReceipts
  const getAmountPaid = (receiptId) => {
    const selected = selectedReceipts.find(r => r.receiptId === receiptId);
    return selected ? selected.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
  };

  const handleSearch = () => {
    onSearch(startDate, endDate, limit);
  };

  // Removed useEffect to prevent initial search on mount
  // useEffect(() => {
  //   handleSearch();
  // }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
      <h3 className="font-bold text-lg text-gray-800 mb-4">เลือกใบรับของที่ต้องการชำระ</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
          <input
            type="date"
            id="startDate"
            className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">ถึงวันที่</label>
          <input
            type="date"
            id="endDate"
            className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">จำนวนรายการสูงสุด</label>
          <select
            id="limit"
            className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={5}>5 รายการ</option>
            <option value={10}>10 รายการ</option>
            <option value={20}>20 รายการ</option>
            <option value={50}>50 รายการ</option>
            <option value={100}>100 รายการ</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="w-full bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          ค้นหา
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">เลือก</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">เลขที่ใบรับของ</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">วันที่รับ</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">ยอดรวม</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">ยอดที่ชำระแล้ว</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">ยอดคงเหลือ</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">ยอดที่ต้องการจ่าย</th> {/* New Column */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {receipts.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500 text-base"> {/* Adjusted colspan */}
                  ไม่พบใบรับของที่พร้อมชำระ
                </td>
              </tr>
            ) : (
              receipts.map((r) => {
                const remaining = (r.totalAmount || 0) - (r.paidAmount || 0);
                const isReceiptSelected = isSelected(r.id);
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition duration-100 ease-in-out">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isReceiptSelected}
                        onChange={() => onToggle(r)}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{r.code}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{dayjs(r.receivedDate).format('DD MMM BBBB')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-800">{r.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">{r.paidAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                      {remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      <input
                        type="text"
                        className={`w-28 text-right border border-gray-300 px-2 py-1 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!isReceiptSelected ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                        value={getAmountPaid(r.id)}
                        onChange={(e) => onAmountPaidChange(r.id, e.target.value)}
                        onBlur={(e) => {
                            const value = parseFloat(e.target.value.replace(/,/g, ''));
                            if (!isNaN(value) && value > 0) {
                                // Ensure the entered amount doesn't exceed remaining
                                const finalAmount = Math.min(value, remaining);
                                onAmountPaidChange(r.id, finalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                            } else {
                                onAmountPaidChange(r.id, '0.00'); // Reset to 0.00 if invalid or empty
                            }
                        }}
                        disabled={!isReceiptSelected} // Disable if not selected
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
        รวมยอดชำระ: <span className="text-green-600">{parseFloat(totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span>
      </div>
    </div>
  );
};

export default ReceiptSelectionTable;