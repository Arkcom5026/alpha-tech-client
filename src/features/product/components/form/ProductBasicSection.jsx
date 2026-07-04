import React from 'react';

const ProductBasicSection = ({ register, errors = {} }) => {
  return (
    <div className="md:col-span-3">
      <label htmlFor="name" className="block font-medium mb-1 text-gray-700">
        ชื่อสินค้า <span className="text-red-500">*</span>
      </label>
      <input
        id="name"
        type="text"
        placeholder="เช่น Canon PIXMA G2010, Kingston NV2 1TB"
        {...register('name', { required: 'กรุณาระบุชื่อสินค้า' })}
        className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
      />
      {errors.name && <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>}
    </div>
  );
};

export default ProductBasicSection;
