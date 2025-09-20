// =============================
// FILE: src/features/online/productOnline/components/ProductGridOnline.jsx
// (Grid เฉพาะ Online: ใส่ aboveFold อัตโนมัติให้รูป 12 ใบแรก)
// =============================
import React from 'react';
import ProductCardOnline from '@/features/online/productOnline/components/ProductCardOnline';

export default function ProductGridOnline({ products = [], className = '' }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ${className}`}>
      {products.map((item, idx) => (
        <ProductCardOnline key={item.id ?? idx} item={item} aboveFold={idx < 12} />
      ))}
    </div>
  );
}


// =============================
// USAGE HINT (Shop Page)
// =============================
// import ProductGridOnline from '@/features/online/productOnline/components/ProductGridOnline';
//
// <ProductGridOnline products={products} />


