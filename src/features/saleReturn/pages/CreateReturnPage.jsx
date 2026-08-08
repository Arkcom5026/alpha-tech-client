// ✅ CreateReturnPage.jsx + ReturnForm.jsx (แก้ handleSubmitReturn ให้เชื่อม API จริง)
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useSaleStore from '../../sales/store/salesStore';
import useSaleReturnStore from '../store/saleReturnStore';
import ReturnForm from '../components/ReturnForm';

const CreateReturnPage = () => {
  const { saleId } = useParams();
  const { getSaleByIdAction, selectedSale } = useSaleStore();
  const { createSaleReturnAction } = useSaleReturnStore();

  useEffect(() => {
    if (saleId) {
      console.log('📥 เรียก getSaleByIdAction');
      getSaleByIdAction(saleId);
    }
  }, [saleId]);

  useEffect(() => {
    console.log('🟦 selectedSale updated:', selectedSale);
  }, [selectedSale]);

  const handleSubmitReturn = async (payload) => {
    try {
      const result = await createSaleReturnAction(saleId, payload);
      console.log('✅ คืนสินค้าแล้ว:', result);
    } catch (err) {
      console.error('❌ คืนสินค้าไม่สำเร็จ:', err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">สร้างใบคืนสินค้า</h1>
      <p className="mb-2">เลขที่ใบขาย: {selectedSale?.code}</p>

      {Array.isArray(selectedSale?.items) ? (
        selectedSale.items.length > 0 ? (
          <ReturnForm items={selectedSale.items} sale={selectedSale} onSubmit={handleSubmitReturn} />
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

