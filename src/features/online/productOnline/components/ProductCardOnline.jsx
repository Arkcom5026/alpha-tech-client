
// =============================
// FILE: src/features/online/productOnline/components/ProductCardOnline.jsx
// (อัปเดต: ลด re-render, ส่งพารามิเตอร์รูปให้เหมาะกับ Online และ aboveFold อัตโนมัติได้)
// =============================
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { numberFormat } from '@/utils/number';
import { motion as Motion } from 'framer-motion';
import { useCartStore } from '../../cart/store/cartStore';
import { useNavigate } from 'react-router-dom';
import { useBranchStore } from '@/features/branch/store/branchStore';
import LazyImageOnline from '@/features/online/productOnline/components/LazyImageOnline';

const ProductCardOnlineBase = ({ item, aboveFold = false }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.cartItems);
  const increaseQty = useCartStore((s) => s.increaseQty || s.incrementQty || s.increaseQuantity || s.addQty || s.plusQty || s.addQuantity);
  const updateItemQty = useCartStore((s) => s.updateItemQty || s.updateQty || s.setItemQty);
  const navigate = useNavigate();
  const branchId = useBranchStore((state) => state.selectedBranchId);

  const name = item.name || 'ไม่พบชื่อสินค้า';
  const model = item.model || '';
  const description = item.description || '-';
  const imageUrl = item.imageUrl || item.thumbnailUrl || item.thumbnail || item.imgUrl || null;
  const rawPriceOnline = item?.branchPrice?.priceOnline ?? item.priceOnline ?? 0;
  const priceOnline = typeof rawPriceOnline === 'number' ? rawPriceOnline : 0;
  const category = item.category || '-';
  const productType = item.productType || '-';
  const productTemplate = item.productTemplate || '-';
  const highlight = item.isBestPrice || false;
  const isReady = item.isReady || false;

  const onAddToCart = () => {
    const productId = item.productId ?? item.id;
    const exist = cartItems.find((p) => String(p?.productId ?? p?.id) === String(productId));

    if (exist) {
      const key = exist.id ?? exist.productId ?? productId;
      if (increaseQty) return increaseQty(key);
      if (updateItemQty) return updateItemQty(key, (exist.quantity || 0) + 1);
      return addToCart({ ...exist, quantity: (exist.quantity || 0) + 1 });
    }

    return addToCart({
      ...item,
      id: item.id ?? productId,
      productId,
      branchId,
      quantity: 1,
      priceAtThatTime: priceOnline,
    });
  };

  const productKey = String(item?.productId ?? item?.id);
  const existingInCart = cartItems.find((p) => String(p?.productId ?? p?.id) === productKey);
  const isInCart = !!existingInCart;

  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.12 }}
      className="w-full sm:w-auto max-w-[240px] min-w-[240px]"
    >
      <div className="border rounded-xl shadow bg-white hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col h-[440px] overflow-hidden relative">
        {highlight && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded shadow">
            Best Price
          </span>
        )}

        {/* รูปสินค้า */}
        <div className="w-full bg-white flex items-center justify-center border-b border-gray-200">
          <div className="w-[90%] aspect-[1/1] border border-gray-200/80 rounded-md overflow-hidden">
            {imageUrl ? (
              <LazyImageOnline
                src={imageUrl}
                alt={name}
                width={320}
                height={320}
                className="w-full h-full"
                rounded="rounded-md"
                aboveFold={aboveFold}
                /* ปรับคุณภาพ/ขนาดให้เบาขึ้นบนกริด */
                sizes="(max-width: 640px) 45vw, 240px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* เนื้อหา */}
        <div className="flex-1 p-3 text-sm bg-blue-50 flex flex-col justify-start">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 min-h-[25px]" title={name}>
            {model ? `${name} (${model})` : name}
          </h3>

          <ul className="text-xs text-gray-600 list-disc pl-4 space-y-0.5 break-words max-w-[200px] min-h-[80px]">
            <li className="truncate" title={category}>{category}</li>
            <li className="truncate" title={productType}>{productType}</li>
            <li className="truncate" title={productTemplate}>{productTemplate}</li>
            <li className="truncate" title={description}>{description}</li>
          </ul>

          <div className="text-xs text-gray-500 mt-1">
            <div className="flex justify-between w-full items-start">
              {isReady ? (
                <div className="text-green-600 text-[12px] font-medium pt-1">✅ พร้อมรับที่สาขา</div>
              ) : <div />}

              <button
                onClick={() => navigate(`/shop/product/${item.id}?branchId=${branchId}`)}
                className="text-blue-500 text-[13px] hover:underline mt-1 text-right"
              >
                ดูรายละเอียด
              </button>
            </div>
          </div>
        </div>

        {/* ราคา + ปุ่ม */}
        <div className="p-3 pt-1 mt-auto">
          <div className="flex justify-between items-center">
            <div className="text-blue-700 text-base font-bold">{numberFormat(priceOnline)} บาท</div>
            <div className="my-1">
              <button
                onClick={onAddToCart}
                aria-label={isInCart ? 'เพิ่มจำนวนสินค้าในตะกร้า' : 'เพิ่มลงตะกร้า'}
                className={`rounded-md px-3 py-1.5 transition text-sm flex items-center gap-1
                  ${isInCart ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                <ShoppingCart size={16} /> {isInCart ? 'เพิ่มอีก' : 'ตะกร้า'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
};

// ลด re-render: ถ้า props (id/ราคา/ชื่อ/รูป/aboveFold) ไม่เปลี่ยน จะไม่เรนเดอร์ซ้ำ
const areEqual = (prev, next) => {
  const a = prev.item, b = next.item;
  return (
    (a?.id ?? a?.productId) === (b?.id ?? b?.productId) &&
    a?.name === b?.name &&
    a?.imageUrl === b?.imageUrl &&
    a?.thumbnailUrl === b?.thumbnailUrl &&
    a?.priceOnline === b?.priceOnline &&
    prev.aboveFold === next.aboveFold
  );
};

const ProductCardOnline = React.memo(ProductCardOnlineBase, areEqual);
export default ProductCardOnline;


