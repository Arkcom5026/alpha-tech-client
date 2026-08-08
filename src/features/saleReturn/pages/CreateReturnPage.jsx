import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useSaleStore from '../../sales/store/salesStore';
import useSaleReturnStore from '../store/saleReturnStore';
import CreateReturnWorkspace from '../create/CreateReturnWorkspace';

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

  return <CreateReturnWorkspace sale={selectedSale} onSubmit={handleSubmitReturn} />;
};

export default CreateReturnPage;
