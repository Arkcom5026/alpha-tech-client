import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useProductOnlineStore } from '../store/productOnlineStore';
import { numberFormat } from '@/utils/number';
import { useCartStore } from '../../cart/store/cartStore';
import { useBranchStore } from '@/features/branch/store/branchStore';

const ProductOnlineDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const branchIdFromQuery = query.get('branchId');

  const branchId = useBranchStore((state) => state.selectedBranchId);
  const setSelectedBranchId = useBranchStore((state) => state.setSelectedBranchId);

  const selectedProduct = useProductOnlineStore((state) => state.selectedProduct);
  const getProductByIdAction = useProductOnlineStore((state) => state.getProductByIdAction);
  const addToCart = useCartStore((state) => state.addToCart);

  const [activeTab, setActiveTab] = useState('spec');
  const [mainImage, setMainImage] = useState(null);

  // ✅ ตั้งค่า branchId จาก query → store
  useEffect(() => {
    if (branchIdFromQuery) {
      setSelectedBranchId(Number(branchIdFromQuery));
    }
  }, [branchIdFromQuery]);

  // ✅ ดึงข้อมูลสินค้าเมื่อ id + branchId พร้อมแล้ว
  useEffect(() => {
    console.log('ProductOnlineDetailPage id : ', id);
    console.log('ProductOnlineDetailPage branchId : ', branchId);

    if (id && branchId) getProductByIdAction(id, branchId);
  }, [id, branchId, getProductByIdAction]);

  useEffect(() => {
    if (selectedProduct?.productImages?.length > 0) {
      setMainImage(selectedProduct.productImages[0].secure_url);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return <p className="p-4 text-gray-500">กำลังโหลดข้อมูลสินค้า...</p>;

  const {
    id: productId,
    name,
    description,
    imageUrl,
    price,
    category,
    productType,
    productProfile,
    productTemplate,
    spec,
    sold,
    quantity,
    warranty,
    productImages = [],
    isReady,
  } = selectedProduct;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* รูปภาพสินค้า */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-md overflow-hidden shadow-sm">
            {mainImage ? (
              <img src={mainImage} alt={name} className="w-full aspect-square sm:aspect-video object-contain" />
            ) : (
              <div className="w-full h-80 bg-gray-100 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {productImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img.secure_url}
                  alt={`thumb-${idx}`}
                  onClick={() => setMainImage(img.secure_url)}
                  className={`h-14 w-14 sm:h-16 sm:w-16 rounded border cursor-pointer object-cover transition ${
                    mainImage === img.secure_url ? 'ring-2 ring-blue-500' : ''
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ข้อมูลสินค้า */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{name || 'ไม่พบชื่อสินค้า'}</h1>
            <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">{description || '-'}</p>
            <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">
              {numberFormat(price || 0)} บาท
            </div>
            {isReady && <div className="text-green-600 text-sm font-medium mb-4">✅ พร้อมรับที่สาขา</div>}

            <button
              onClick={() =>
                addToCart({
                  id: productId,
                  name,
                  description,
                  imageUrl: mainImage,
                  price,
                  category,
                  productType,
                  productProfile,
                  productTemplate,
                })
              }
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded w-full sm:w-auto"
            >
              เพิ่มลงตะกร้า
            </button>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 text-sm text-gray-500 gap-y-1 gap-x-6">
              <div>หมวดหมู่: <span className="text-gray-700">{category || '-'}</span></div>
              <div>ประเภทสินค้า: <span className="text-gray-700">{productType || '-'}</span></div>
              <div>ลักษณะสินค้า: <span className="text-gray-700">{productProfile || '-'}</span></div>
              <div>รูปแบบสินค้า: <span className="text-gray-700">{productTemplate || '-'}</span></div>
              <div>จำนวนในสต๊อก: <span className="text-gray-700">{quantity ?? '-'} ชิ้น</span></div>
              <div>ขายไปแล้ว: <span className="text-gray-700">{sold ?? '-'} ชิ้น</span></div>
              <div>การรับประกัน: <span className="text-gray-700">{warranty ?? '-'} วัน</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 sm:mt-12">
        <div className="flex flex-wrap gap-x-4 gap-y-2 border-b mb-4 text-sm sm:text-base">
          <button
            className={`pb-2 px-4 font-medium border-b-2 ${
              activeTab === 'spec' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
            onClick={() => setActiveTab('spec')}
          >
            รายละเอียดสินค้า
          </button>
          <button
            className={`pb-2 px-4 font-medium border-b-2 ${
              activeTab === 'warranty' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
            onClick={() => setActiveTab('warranty')}
          >
            การรับประกัน
          </button>
          <button
            className={`pb-2 px-4 font-medium border-b-2 ${
              activeTab === 'review' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
            onClick={() => setActiveTab('review')}
          >
            รีวิวสินค้า
          </button>
        </div>

        {activeTab === 'spec' && (
          <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed bg-white p-4 rounded shadow-sm">
            {spec || '-'}
          </div>
        )}

        {activeTab === 'warranty' && (
          <div className="text-sm text-gray-700 bg-white p-4 rounded shadow-sm">
            การรับประกันสินค้า {warranty ?? '-'} วัน โดยบริษัทผู้ผลิตหรือศูนย์บริการที่กำหนด
          </div>
        )}

        {activeTab === 'review' && (
          <div className="text-sm text-gray-700 bg-white p-4 rounded shadow-sm italic">
            ยังไม่มีรีวิวสำหรับสินค้านี้
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductOnlineDetailPage;
