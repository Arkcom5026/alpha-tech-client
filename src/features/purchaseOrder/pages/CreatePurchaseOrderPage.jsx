import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PurchaseOrderForm from '../components/PurchaseOrderForm';

const CreatePurchaseOrderPage = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">สร้างใบสั่งซื้อใหม่</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          ย้อนกลับ
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <PurchaseOrderForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePurchaseOrderPage;
