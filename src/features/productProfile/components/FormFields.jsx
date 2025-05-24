// ✅ src/features/productProfile/components/FormFields.jsx
import { getProductTypeDropdowns } from '@/features/productType/api/productTypeApi';
import { useEffect, useState } from 'react';

import { useFormContext } from 'react-hook-form';

const FormFields = () => {
  const [productTypes, setProductTypes] = useState([]);
  const { register, errors, watch, setValue } = useFormContext();
  const selectedType = watch('productTypeId');

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const types = await getProductTypeDropdowns();
        setProductTypes(types);
      } catch (err) {
        console.error('โหลดประเภทสินค้าไม่สำเร็จ:', err);
      }
    };
    fetchProductTypes();
  }, []);

  return (
    <>
      <div>
        <label className="block font-medium">ชื่อรูปแบบสินค้า</label>
        <input
          type="text"
          {...register('name')}
          className="w-full p-2 border rounded"
        />
        {errors?.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block font-medium">รายละเอียดเพิ่มเติม</label>
        <textarea
          {...register('description')}
          className="w-full p-2 border rounded"
        />
        {errors?.description && (
          <p className="text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block font-medium">ประเภทสินค้า</label>
        <select
          {...register('productTypeId')}
          value={selectedType || ''}
          onChange={(e) => setValue('productTypeId', e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- เลือกประเภทสินค้า --</option>
          {productTypes.map((type) => (
            <option key={type.id} value={String(type.id)}>{type.name}</option>
          ))}
        </select>
        {errors?.productTypeId && (
          <p className="text-red-500">{errors.productTypeId.message}</p>
        )}
      </div>
    </>
  );
};

export default FormFields;
