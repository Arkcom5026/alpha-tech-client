import React, { useEffect, useState } from 'react';
import useSupplierPaymentStore from '../store/supplierPaymentStore';
import SupplierPaymentForm from '../components/SupplierPaymentForm';

const ListSupplierPaymentsPage = () => {
  const { fetchAllSupplierPaymentsAction, supplierPayments, isSupplierPaymentLoading, createSupplierPaymentAction } = useSupplierPaymentStore();

  const [selectedPO, setSelectedPO] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAllSupplierPaymentsAction();
  }, []);

  const openPaymentForm = (po) => {
    setSelectedPO(po);
    setShowForm(true);
  };

  const closePaymentForm = () => {
    setSelectedPO(null);
    setShowForm(false);
  };

  const handleSubmitPayment = async (formData) => {
    const success = await createSupplierPaymentAction(formData);
    if (success) {
      await fetchAllSupplierPaymentsAction();
      closePaymentForm();
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('th-TH', {
    style: 'currency', currency: 'THB'
  }).format(value);

  const renderTable = () => (
    <table className="w-full border mt-4">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-2 py-1">เลข PO</th>
          <th className="border px-2 py-1">วันที่</th>
          <th className="border px-2 py-1">Supplier</th>
          <th className="border px-2 py-1">ยอดรวม</th>
          <th className="border px-2 py-1">ชำระแล้ว</th>
          <th className="border px-2 py-1">คงเหลือ</th>
          <th className="border px-2 py-1">สถานะ</th>
          <th className="border px-2 py-1">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(supplierPayments) &&
          supplierPayments
            .filter((po) => po.status !== 'COMPLETED')
            .map((po) => {
              const paid = po.payments?.reduce((sum, p) => p.isRefund ? sum : sum + p.amount, 0) || 0;
              const total = po.totalAmount || 0;
              const remaining = total - paid;

              return (
                <tr key={po.id} className="text-center">
                  <td className="border px-2 py-1">{po.code}</td>
                  <td className="border px-2 py-1">{po.date?.slice(0, 10)}</td>
                  <td className="border px-2 py-1">{po.supplier?.name}</td>
                  <td className="border px-2 py-1">{formatCurrency(total)}</td>
                  <td className="border px-2 py-1">{formatCurrency(paid)}</td>
                  <td className="border px-2 py-1">{formatCurrency(remaining)}</td>
                  <td className="border px-2 py-1">{po.status}</td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => openPaymentForm(po)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      ชำระเงิน
                    </button>
                  </td>
                </tr>
              );
            })}
      </tbody>
    </table>
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-2">รายการใบสั่งซื้อที่ค้างชำระ</h1>
      {isSupplierPaymentLoading ? <p>กำลังโหลดข้อมูล...</p> : renderTable()}

      {showForm && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow p-6 w-[500px]">
            <h2 className="text-lg font-semibold mb-4">บันทึกการชำระเงิน</h2>
            <SupplierPaymentForm
              purchaseOrder={selectedPO}
              onCancel={closePaymentForm}
              onSubmit={handleSubmitPayment}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ListSupplierPaymentsPage;
