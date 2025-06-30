// ListCustomerDepositPage.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCustomerDepositStore from '../store/customerDepositStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const ListCustomerDepositPage = () => {
  const { deposits, fetchCustomerDepositsAction, cancelCustomerDepositAction } = useCustomerDepositStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerDepositsAction();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('คุณต้องการยกเลิกรายการนี้หรือไม่?')) {
      await cancelCustomerDepositAction(id);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">รายการเงินมัดจำของลูกค้า</h1>
        <button
          onClick={() => navigate('/pos/finance/deposit/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + รับเงินมัดจำ
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm border border-gray-300">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="border px-4 py-2 text-left">ลำดับ</th>
              <th className="border px-4 py-2 text-left">ลูกค้า</th>
              <th className="border px-4 py-2 text-left">เบอร์โทร</th>
              <th className="border px-4 py-2 text-right">เงินสด</th>
              <th className="border px-4 py-2 text-right">เงินโอน</th>
              <th className="border px-4 py-2 text-right">บัตรเครดิต</th>
              <th className="border px-4 py-2 text-right">รวม</th>
              <th className="border px-4 py-2 text-center">วันที่</th>
              <th className="border px-4 py-2 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((d, i) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{i + 1}</td>
                <td className="border px-4 py-2">{d.customer?.name || '-'}</td>
                <td className="border px-4 py-2">{d.customer?.phone || '-'}</td>
                <td className="border px-4 py-2 text-right">{d.cashAmount.toLocaleString()}</td>
                <td className="border px-4 py-2 text-right">{d.transferAmount.toLocaleString()}</td>
                <td className="border px-4 py-2 text-right">{d.cardAmount.toLocaleString()}</td>
                <td className="border px-4 py-2 text-right font-semibold text-blue-600">{d.totalAmount.toLocaleString()}</td>
                <td className="border px-4 py-2 text-center">{new Date(d.createdAt).toLocaleDateString()}</td>
                <td className="border px-4 py-2 text-center">
                  <StandardActionButtons
                    onDelete={() => handleCancel(d.id)}
                    disableEdit
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListCustomerDepositPage;
