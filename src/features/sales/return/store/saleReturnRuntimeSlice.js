import { returnSale } from '../api/saleReturnApi';
import { devError } from '../../shared/saleStoreSupport';

export const createSaleReturnRuntimeSlice = () => ({
  returnSaleAction: async (saleOrderId, saleItemId) => {
    try {
      const data = await returnSale(saleOrderId, saleItemId);
      return data;
    } catch (err) {
      devError('[returnSaleAction]', err);
      return { error: 'เกิดข้อผิดพลาดในการคืนสินค้า' };
    }
  },
});
