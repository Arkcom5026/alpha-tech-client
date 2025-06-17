import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  createProductType,
  deleteProductType,
  updateProductType,
  getProductTypeById,
  getAllProductTypes,
} from '../api/productTypeApi';


const useProductTypeStore = create(
  devtools((set, get) => ({
    productTypes: [],
    loading: false,

    fetchProductTypes: async () => {
      set({ loading: true });
      try {
        const data = await getAllProductTypes();
        set({ productTypes: data });
      } catch (error) {
        console.error('โหลดประเภทสินค้าไม่สำเร็จ:', error);
        set({ productTypes: [] });
      } finally {
        set({ loading: false });
      }
    },

    addProductType: async (formData) => {
      try {
        const created = await createProductType(formData);
        set({ productTypes: [created, ...get().productTypes] });
        return created;
      } catch (error) {
        console.error('เพิ่มประเภทสินค้าไม่สำเร็จ:', error);
        throw error;
      }
    },

    updateProductType: async (id, formData) => {
      try {
        const updated = await updateProductType(id, formData);
        set({
          productTypes: get().productTypes.map((pt) =>
            pt.id === id ? updated : pt
          ),
        });
        return updated;
      } catch (error) {
        console.error('อัปเดตประเภทสินค้าไม่สำเร็จ:', error);
        throw error;
      }
    },

    deleteProductType: async (id) => {
      try {
        await deleteProductType(id);
        set({
          productTypes: get().productTypes.filter((pt) => pt.id !== id),
        });
      } catch (error) {
        console.error('ลบประเภทสินค้าไม่สำเร็จ:', error);
        throw error;
      }
    },

    getProductTypeById: async (id) => {
      try {
        const data = await getProductTypeById(id);
        return data;
      } catch (error) {
        console.error('ดึงประเภทสินค้ารายตัวไม่สำเร็จ:', error);
        throw error;
      }
    },
  }))
);

export default useProductTypeStore;
