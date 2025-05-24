// ✅ src/features/productType/components/ProductTypeCreateDialog.jsx
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import ProductTypeForm from './ProductTypeForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productTypeSchema } from '../schema/ProductTypeSchema';
import { createProductType, updateProductType } from '../api/productTypeApi';
import { useProductTypeStore } from '../store/productTypeStore';

const ProductTypeCreateDialog = ({ open, onOpenChange, mode, defaultValues }) => {
  const form = useForm({
    resolver: zodResolver(productTypeSchema),
    defaultValues: defaultValues || { name: '' },
  });

  const { fetchProductTypes } = useProductTypeStore();

  const handleSubmit = async (data) => {
    try {
      if (mode === 'create') {
        await createProductType(data);
      } else {
        await updateProductType(defaultValues.id, data);
      }
      await fetchProductTypes();
      form.reset();
      onOpenChange(false);
    } catch (err) {
      console.error('❌ บันทึกประเภทสินค้าไม่สำเร็จ:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>{mode === 'create' ? 'เพิ่มประเภทสินค้า' : 'แก้ไขประเภทสินค้า'}</DialogTitle>
        <DialogDescription>
          {mode === 'create'
            ? 'กรุณากรอกชื่อประเภทสินค้าใหม่'
            : 'แก้ไขชื่อประเภทสินค้าที่คุณต้องการ'}
        </DialogDescription>
        <ProductTypeForm
          form={form}
          mode={mode}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductTypeCreateDialog;
