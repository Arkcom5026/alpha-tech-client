// ✅ ปรับ ProductCardOnline: ดึงข้อมูลจาก DB, ขนาด Card คงที่, พื้นหลังขาวสำหรับภาพ และพื้นหลังฟ้าสำหรับข้อมูล
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { numberFormat } from '@/utils/number';
import { motion } from 'framer-motion';
import { useCartStore } from '../../cart/store/cartStore';
import { useNavigate } from 'react-router-dom';

const ProductCardOnline = ({ item }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.cartItems);
  const navigate = useNavigate();

  const name = item.name || 'ไม่พบชื่อสินค้า';
  const description = item.description || '-';
  const imageUrl = item.imageUrl || null;
  const price = item.price || 0;
  const category = item.category || '-';
  const productType = item.productType || '-';
  const productProfile = item.productProfile || '-';
  const productTemplate = item.productTemplate || '-';
  const highlight = item.isBestPrice || false;

  const isInCart = cartItems.some((p) => p.id === item.id);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      className="w-full sm:w-auto max-w-[240px] min-w-[240px]"
    >
      <div className="border rounded-xl shadow bg-white hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col h-[340px] min-h-[340px] overflow-hidden relative">
        {highlight && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded shadow">
            Best Price
          </span>
        )}

        <div className="h-[130px] flex items-center justify-center bg-white overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              className="object-contain w-full h-[120px]"
              alt={name}
            />
          ) : (
            <div className="text-gray-400 text-sm">No Image</div>
          )}
        </div>

        <div className="flex-1 p-3 space-y-1 text-sm bg-blue-50">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
            {name}
          </h3>
          <ul className="text-xs text-gray-600 list-disc pl-4 space-y-0.5 break-words max-w-[180px] h-[60px] overflow-hidden">
            <li>{category}</li>
            <li>{productType}</li>
            <li>{productTemplate}</li>
            <li>{description}</li>
          </ul>
        </div>

        <div className="px-3">
          <span className="text-blue-700 text-base font-bold">{numberFormat(price)} บาท</span>
        </div>

        <div className="p-3 pt-1 mt-auto">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(`/shop/product/${item.id}`)}
              className="text-blue-500 text-[14px] hover:underline"
            >
              ดูรายละเอียด
            </button>

            <button
              onClick={() => addToCart(item)}
              className={`rounded-md px-3 py-1.5 transition text-sm flex items-center gap-1
                ${isInCart ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-400 text-white hover:bg-blue-500'}`}
            >
              <ShoppingCart size={16} /> {isInCart ? 'เพิ่มอีก' : 'ตะกร้า'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCardOnline;
