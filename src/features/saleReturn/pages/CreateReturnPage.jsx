import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';
import useSaleStore from '../../sales/store/salesStore';
import useSaleReturnStore from '../store/saleReturnStore';
import ReturnForm from '../components/ReturnForm';

const CreateReturnPage = () => {
  const { saleId } = useParams();
  const { getSaleByIdAction, selectedSale } = useSaleStore();
  const { createSaleReturnAction, loading } = useSaleReturnStore();

  useEffect(() => {
    if (saleId) {
      getSaleByIdAction(saleId);
    }
  }, [saleId, getSaleByIdAction]);

  const handleSubmitReturn = async (payload) => {
    if (loading) return null;
    try {
      const result = await createSaleReturnAction(saleId, payload);
      if (!result) return null;
      feedback.actionSuccess(
        'บันทึกการคืนสินค้าเรียบร้อยแล้ว',
        `sale-return:${saleId}:create:success`,
      );
      return result;
    } catch (err) {
      feedback.actionError(
        err,
        'คืนสินค้าไม่สำเร็จ',
        `sale-return:${saleId}:create:error`,
      );
      throw err;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">สร้างใบคืนสินค้า</h1>
      <p className="mb-2">เลขที่ใบขาย: {selectedSale?.code}</p>

      {Array.isArray(selectedSale?.items) ? (
        selectedSale.items.length > 0 ? (
          <ReturnForm
            items={selectedSale.items}
            sale={selectedSale}
            onSubmit={handleSubmitReturn}
            submitting={loading}
          />
        ) : (
          <div className="text-center py-6 text-gray-500">ไม่มีรายการสินค้าสำหรับคืน</div>
        )
      ) : (
        <div className="text-center py-6 text-gray-400 italic">กำลังโหลดข้อมูลสินค้า...</div>
      )}
    </div>
  );
};

export default CreateReturnPage;
