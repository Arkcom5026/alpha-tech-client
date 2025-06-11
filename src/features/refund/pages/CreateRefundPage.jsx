// refund/pages/CreateRefundPage.jsx
import React, { useEffect, useState } from 'react';
import RefundForm from '../components/RefundForm';
import RefundHistoryTable from '../components/RefundHistoryTable';
import { useParams, useNavigate } from 'react-router-dom';
import useSaleReturnStore from '@/features/saleReturn/store/saleReturnStore';

const CreateRefundPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { getSaleReturnByIdAction } = useSaleReturnStore();

  const [saleReturn, setSaleReturn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (params.saleReturnId) {
        try {
          const result = await getSaleReturnByIdAction(params.saleReturnId);
          setSaleReturn(result);
        } catch (err) {
          console.error('❌ โหลด saleReturn ไม่สำเร็จ:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [params.saleReturnId, getSaleReturnByIdAction]);

  if (loading) return <div className="p-4">⏳ กำลังโหลดข้อมูล...</div>;
  if (!saleReturn) return <div className="p-4 text-red-600">❌ ไม่พบข้อมูลใบคืนสินค้า</div>;

  const refunded = saleReturn.refundedAmount || 0;
  const remain = (saleReturn.totalRefund || 0) - refunded;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
        <h1 className="text-xl font-bold mb-4">บันทึกการคืนเงิน</h1>

        <div className="mb-6 border border-blue-300 rounded p-4 bg-blue-50">
          <p><span className="font-semibold">เลขที่ใบคืน:</span> {saleReturn.code}</p>
          <p><span className="font-semibold">วันที่คืนสินค้า:</span> {new Date(saleReturn.createdAt).toLocaleDateString()}</p>
          <p><span className="font-semibold">ชื่อลูกค้า:</span> {saleReturn.sale?.customer?.name || '-'}</p>
          <p><span className="font-semibold">จำนวนสินค้าที่คืน:</span> {saleReturn.items?.length || 0} รายการ</p>
          <p><span className="font-semibold">ยอดคืนทั้งหมด:</span> {(saleReturn.totalRefund || 0).toFixed(2)} ฿</p>
          <p><span className="font-semibold">คืนแล้ว:</span> {refunded.toFixed(2)} ฿</p>
          <p><span className="font-semibold text-blue-700">ยอดคงเหลือ:</span> {remain.toFixed(2)} ฿</p>
        </div>

        <RefundForm saleReturn={saleReturn} />
        <RefundHistoryTable transactions={saleReturn.refundTransaction || []} />

        {(saleReturn.refundTransaction || []).length > 0 && (
          <div className="mt-6 text-right">
            <button
              onClick={() => navigate(`/pos/finance/refunds/print/${saleReturn.id}`)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              🖨️ พิมพ์ใบรับเงิน
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRefundPage;
