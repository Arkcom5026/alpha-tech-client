import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // 🟢 1. เรียก useParams แกะรหัสชื่อร้านพาร์ตเนอร์
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PurchaseOrderForm from '../components/PurchaseOrderForm';
import { usePurchaseOrderStore } from '../store/purchaseOrderStore'; // 🟢 2. เรียกใช้งาน Store แกนหลัก

// CreatePurchaseOrderPage
// หน้าต้นทางของโฟลว์จัดซื้อ: เลือก Supplier → ค้นหา/เพิ่มสินค้า → แก้ qty/cost → บันทึก
// ✅ ไม่เรียก API ตรง ใด ๆ ทั้งหมดกระทำภายใน Form/Store ตามมาตรฐานระบบ
const CreatePurchaseOrderPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams(); // 🟢 3. ดึงค่าแบรนด์พาร์ตเนอร์จาก URL ปัจจุบัน เช่น advancetech
  const [searchText, setSearchText] = useState('');
  
  const clearStore = usePurchaseOrderStore((s) => s.clearStore); // 🟢 4. ดึงคำสั่งล้างข้อมูลค้างคาในตะกร้าสินค้า

  // 🎯 มาตรการความปลอดภัย: เคลียร์ขยะหรือรายการสินค้าบิลเก่าทิ้งทันทีเมื่อเปิดเข้าหน้านี้
  useEffect(() => {
    if (clearStore) {
      clearStore();
    }
  }, [clearStore]);

  const handleBack = useCallback(() => {
    try {
      navigate(-1);
    } catch {
      // eslint-fix: optional catch binding เพื่อเลี่ยง no-unused-vars
      // ป้องกัน edge case (เช่น history ว่าง) ให้ fallback ไปหน้า list ของพาร์ตเนอร์ร้านปัจจุบันแทน
      try {
        navigate(`/${shopSlug}/pos/purchases`); // 🚀 [FIXED] หันหัวเรือชี้เข้าพาธภาพรวมจัดซื้อของร้านคู่ขนานอย่างปลอดภัย
      } catch {
        // no-op: ตามกฎ ห้าม alert; ปล่อยให้ผู้ใช้ใช้เมนูนำทางแทน
      }
    }
  }, [navigate, shopSlug]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">สร้างใบสั่งซื้อใหม่</h1>
        <Button variant="outline" onClick={handleBack}>
          ย้อนกลับ
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <PurchaseOrderForm
            searchText={searchText}
            onSearchTextChange={setSearchText}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePurchaseOrderPage;