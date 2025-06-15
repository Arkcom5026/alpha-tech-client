// ✅ ปรับ ProductCardOnline: ดึงข้อมูลจาก DB, ยกเลิกคลิกทั้งการ์ด, ปรับตำแหน่งปุ่มให้เหมาะสม
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { numberFormat } from '@/utils/number';
import { motion } from 'framer-motion';
import { useCartStore } from '../../cart/store/cartStore';
import { useNavigate } from 'react-router-dom';

const ProductCardOnline = ({ item }) => {
  const actionAddtoCart = useCartStore((state) => state.actionAddtoCart);
  const navigate = useNavigate();

  const title = item.title || 'ไม่พบชื่อสินค้า';
  const description = item.description || '-';
  const imageUrl = item.imageUrl || null;
  const price = item.price || 0;
  const category = item.category || '-';
  const productType = item.productType || '-';
  const productProfile = item.productProfile || '-';
  const productTemplate = item.productTemplate || '-';
  const highlight = item.isBestPrice || false;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      className="w-full max-w-[240px]"
    >
      <div className="border rounded-xl shadow bg-white hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col h-[320px] overflow-hidden relative">
        {/* ✅ ป้าย Best Price */}
        {highlight && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded shadow">
            Best Price
          </span>
        )}

        {/* ✅ รูปภาพ */}
        <div
          className="h-[130px] flex items-center justify-center bg-gray-100 overflow-hidden"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              className="object-contain max-h-full max-w-full"
              alt={title}
            />
          ) : (
            <div className="text-gray-400 text-sm">No Image</div>
          )}
        </div>

        {/* ✅ รายละเอียดสินค้า */}
        <div className="flex-1 p-3 space-y-1 text-sm">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
            {title}
          </h3>
          <ul className="text-xs text-gray-600 list-disc pl-4 space-y-0.5 break-words max-w-[180px]">
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
              onClick={() => actionAddtoCart(item)}
              className="bg-blue-400 text-white rounded-md px-3 py-1.5 hover:bg-blue-500 transition text-sm flex items-center gap-1"
            >
              <ShoppingCart size={16} /> ตะกร้า
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCardOnline;
