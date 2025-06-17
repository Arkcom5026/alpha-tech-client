import React from 'react';
import { useProductOnlineStore } from '../store/productOnlineStore';
import ProductCardOnline from '../components/ProductCardOnline';

const ProductOnlineListPage = () => {
  const products = useProductOnlineStore((state) => state.products);

  return (
    <div className="p-4">
            {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
          {products.map((item) => (
            <ProductCardOnline key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">ไม่มีสินค้าออนไลน์</p>
      )}
    </div>
  );
};

export default ProductOnlineListPage;
