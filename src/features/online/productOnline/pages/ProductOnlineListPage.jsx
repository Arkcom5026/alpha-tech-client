import React, { useEffect } from 'react';
import { useProductOnlineStore } from '../store/productOnlineStore';
import ProductCardOnline from '../components/ProductCardOnline';

const ProductOnlineListPage = () => {
  const products = useProductOnlineStore((state) => state.products);
  const loadProducts = useProductOnlineStore((state) => state.loadProductsAction);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">สินค้าออนไลน์</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products && products.length > 0 ? (
          products.map((item) => <ProductCardOnline key={item.id} item={item} />)
        ) : (
          <p className="text-gray-500">ไม่มีสินค้าออนไลน์</p>
        )}
      </div>
    </div>
  );
};

export default ProductOnlineListPage;

