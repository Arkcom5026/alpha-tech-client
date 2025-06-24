// ✅ ปรับ ProductCardOnline: ใส่กรอบให้รูปภาพ และจัด layout คงที่ สวยงาม
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { numberFormat } from '@/utils/number';
import { motion } from 'framer-motion';
import { useCartStore } from '../../cart/store/cartStore';
import { useNavigate } from 'react-router-dom';
import { useBranchStore } from '@/features/branch/store/branchStore';

const ProductCardOnline = ({ item }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.cartItems);
  const navigate = useNavigate();
  const branchId = useBranchStore((state) => state.selectedBranchId);

  const name = item.name || 'ไม่พบชื่อสินค้า';
  const description = item.description || '-';
  const imageUrl = item.imageUrl || null;
  const rawPriceOnline = item?.branchPrice?.priceOnline ?? item.priceOnline ?? 0;
  const priceOnline = typeof rawPriceOnline === 'number' ? rawPriceOnline : 0;
  const category = item.category || '-';
  const productType = item.productType || '-';
  const productProfile = item.productProfile || '-';
  const productTemplate = item.productTemplate || '-';
  const highlight = item.isBestPrice || false;
  const isReady = item.isReady || false;

  const isInCart = cartItems.some((p) => p.id === item.id);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      className="w-full sm:w-auto max-w-[240px] min-w-[240px]"
    >
      <div className="border rounded-xl shadow bg-white hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col h-[430px] overflow-hidden relative">
        {highlight && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded shadow">
            Best Price
          </span>
        )}

        <div className="w-full aspect-[1/1] bg-white flex items-center justify-center border-b border-gray-200">
          <div className="w-[90%] h-[90%] border border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="object-contain w-full h-full max-h-full max-w-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                No Image
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-3 text-sm bg-blue-50 flex flex-col justify-start">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 min-h-[25px]">
            {name}
          </h3>
          <ul className="text-xs text-gray-600 list-disc pl-4 space-y-0.5 break-words max-w-[200px] min-h-[80px]">
            <li className="truncate">{category}</li>
            <li className="truncate">{productType}</li>
            <li className="truncate">{productTemplate}</li>
            <li className="truncate">{description}</li>
          </ul>

          {isReady && (
            <div className="text-green-600 text-[12px] font-medium pt-1">✅ พร้อมรับที่สาขา</div>
          )}
        </div>

        <div className="p-3 pt-1 mt-auto">
          <div className="flex justify-between items-center">
            <div className="text-blue-700 text-base font-bold">
              {numberFormat(priceOnline)} บาท
            </div>

            <button
              onClick={() => addToCart(item)}
              className={`rounded-md px-3 py-1.5 transition text-sm flex items-center gap-1
                ${isInCart ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-400 text-white hover:bg-blue-500'}`}
            >
              <ShoppingCart size={16} /> {isInCart ? 'เพิ่มอีก' : 'ตะกร้า'}
            </button>
          </div>

          <button
            onClick={() => navigate(`/shop/product/${item.id}?branchId=${branchId}`)}
            className="text-blue-500 text-[13px] hover:underline mt-1 text-left"
          >
            ดูรายละเอียด
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCardOnline;


