import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import usePurchaseOrderStore from '../store/purchaseOrderStore';

const PurchaseOrderDetailPage = () => {
  const { id } = useParams();
  const { selectedOrder: po, loadOrderById, loading } = usePurchaseOrderStore();

  useEffect(() => {
    loadOrderById(id);
  }, [id, loadOrderById]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <p className="p-4">กำลังโหลด...</p>;
  if (!po) return <p className="p-4 text-red-500">ไม่พบใบสั่งซื้อ</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 print:max-w-full print:p-0">
      <div className="flex justify-between items-center print:flex-col print:items-start print:gap-2">
        <h2 className="text-2xl font-bold">ใบสั่งซื้อ {po.code}</h2>
        <div className="flex gap-2 items-center print:hidden">
          <Badge>{po.status}</Badge>
        </div>
        <div className="hidden print:block mt-2">
          <Badge>{po.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-muted-foreground">วันที่:</p>
          <p>{new Date(po.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Supplier:</p>
          <p>{po.supplier?.name || '-'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">หมายเหตุ:</p>
          <p>{po.note || '-'}</p>
        </div>
      </div>

      <Card className="print:border-none print:shadow-none">
        <CardContent className="p-4 print:p-0">
          <h3 className="text-lg font-semibold mb-4">รายการสินค้า</h3>
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">#</th>
                <th>สินค้า</th>
                <th>จำนวน</th>
                <th>ราคาต่อหน่วย</th>
                <th>รวม</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{index + 1}</td>
                  <td>{item.product?.name || '-'}</td>
                  <td>{item.quantity}</td>
                  <td>{item.costPrice.toLocaleString()} ฿</td>
                  <td>{(item.quantity * item.costPrice).toLocaleString()} ฿</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 print:hidden">
            <Button
              onClick={() => window.open(`/pos/purchases/orders/print/${po.id}`, '_blank')}
            >
              พิมพ์
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrderDetailPage;
