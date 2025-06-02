import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import usePurchaseOrderStore from '../store/purchaseOrderStore';



const PurchaseDashboardPage = () => {
  const { purchaseOrders } = usePurchaseOrderStore();

  // TODO: คำนวณยอดรวม และจำนวนตามสถานะจาก purchaseOrders

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">ภาพรวมการจัดซื้อ</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">ยอดใบสั่งซื้อทั้งหมด</div>
            <div className="text-2xl font-bold">- รายการ</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">ยอดรอดำเนินการ</div>
            <div className="text-2xl font-bold">- รายการ</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">ยอดเสร็จสิ้น</div>
            <div className="text-2xl font-bold">- รายการ</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">ยอดรวมรายเดือน</TabsTrigger>
          <TabsTrigger value="top-suppliers">Supplier ยอดนิยม</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <div className="mt-4"> {/* TODO: ใส่กราฟรายเดือน */} กราฟยอดรวมรายเดือน </div>
        </TabsContent>

        <TabsContent value="top-suppliers">
          <div className="mt-4"> {/* TODO: ใส่ตาราง Supplier */} รายชื่อ Supplier ที่ใช้บ่อย </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurchaseDashboardPage;
