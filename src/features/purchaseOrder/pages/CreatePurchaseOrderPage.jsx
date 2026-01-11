import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PurchaseOrderForm from '../components/PurchaseOrderForm';

// CreatePurchaseOrderPage
// หน้าต้นทางของโฟลว์จัดซื้อ: เลือก Supplier → ค้นหา/เพิ่มสินค้า → แก้ qty/cost → บันทึก
// ✅ ไม่เรียก API ตรง ใด ๆ ทั้งหมดกระทำภายใน Form/Store ตามมาตรฐานระบบ
const CreatePurchaseOrderPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const handleBack = useCallback(() => {
    try {
      navigate(-1);
    } catch {
      // eslint-fix: optional catch binding เพื่อเลี่ยง no-unused-vars
      // ป้องกัน edge case (เช่น history ว่าง) ให้ fallback ไปหน้า list
      try {
        navigate('/pos/purchases/orders');
      } catch {
        // no-op: ตามกฎ ห้าม alert; ปล่อยให้ผู้ใช้ใช้เมนูนำทางแทน
      }
    }
  }, [navigate]);

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

