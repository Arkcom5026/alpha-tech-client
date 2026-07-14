// 🔼 Component เดิมยังคงอยู่ด้านล่าง (OnlineOrderToSalePanel)

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import useSalesStore from '@/features/sales/store/salesStore';
import { useOrderOnlinePosStore } from '@/features/orderOnlinePos/store/orderOnlinePosStore';

const OnlineOrderToSalePanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { summary, loadOrderOnlineSummaryAction } = useOrderOnlinePosStore();
  const { convertOrderOnlineToSaleAction } = useSalesStore.getState();

  useEffect(() => {
    if (id) {
      loadOrderOnlineSummaryAction(id);
    }
  }, [id]);

  const handleSubmit = async () => {
    const payload = summary.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    try {
      const sale = await convertOrderOnlineToSaleAction(summary.id, payload);
      navigate(`/pos/sales/bill/print-full/${sale.id}`);
    } catch (error) {
      console.error('แปลงใบสั่งซื้อไม่สำเร็จ', error);
    }
  };

  if (!summary) return <p>กำลังโหลดข้อมูลคำสั่งซื้อ...</p>;

  return (
    <div className="bg-white border rounded p-4 shadow-md mt-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">แปลงคำสั่งซื้อออนไลน์: {summary.code}</h2>
      {summary.items.map(item => (
        <div key={item.id} className="mb-4">
          <div className="font-medium">
            {item.product?.name || 'สินค้า'} ({item.product?.brand || '-'} {item.product?.model || '-'}) จำนวน {item.quantity} ชิ้น
          </div>
          <div className="text-sm text-gray-500">รหัสสินค้า: {item.product?.code || '-'}</div>
          <div className="text-sm text-gray-500">บาร์โค้ด: {item.product?.barcode || '-'}</div>
          <div className="text-sm text-gray-500">หน่วย: {item.product?.unit || '-'}</div>
          <div className="text-sm text-gray-500">
            หมวดหมู่: {item.product?.categoryName || item.product?.productType?.globalProductType?.category?.name || '-'}
          </div>
          <div className="text-sm text-gray-500">
            ประเภท: {item.product?.productTypeName || item.product?.productType?.name || '-'}
          </div>
          <div className="text-sm text-gray-500">
            แบรนด์: {item.product?.brandName || item.product?.brand?.name || '-'}
          </div>
          <div className="text-sm text-gray-500">ราคาขาย: {item.product?.branchPrice?.[0]?.price?.toLocaleString() || '-'}</div>
        </div>
      ))}
      <Button onClick={handleSubmit} className="mt-4">ยืนยันสร้างใบขาย</Button>
    </div>
  );
};

export default OnlineOrderToSalePanel;
