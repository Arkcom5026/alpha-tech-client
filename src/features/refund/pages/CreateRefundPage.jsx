// refund/pages/CreateRefundPage.jsx
import React, { useEffect, useState } from 'react';
import RefundForm from '../components/RefundForm';
import { useLocation, useParams } from 'react-router-dom';
import useSaleReturnStore from '@/features/saleReturn/store/saleReturnStore';


const CreateRefundPage = () => {
  const location = useLocation();
  const params = useParams();
  const { getSaleReturnByIdAction } = useSaleReturnStore();

  const [saleReturn, setSaleReturn] = useState(location.state?.saleReturn || null);
  const [loading, setLoading] = useState(!saleReturn);

  useEffect(() => {
    const load = async () => {
      console.log(' params.saleReturnId : ', params.saleReturnId)
      if (!saleReturn && params.saleReturnId) {
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
  }, [params.saleReturnId, saleReturn, getSaleReturnByIdAction]);

  if (loading) {
    return <div className="p-4">⏳ กำลังโหลดข้อมูล...</div>;
  }

  if (!saleReturn) {
    return <div className="p-4 text-red-600">❌ ไม่พบข้อมูลใบคืนสินค้า</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">บันทึกการคืนเงิน</h1>
      <RefundForm saleReturn={saleReturn} />
    </div>
  );
};

export default CreateRefundPage;
