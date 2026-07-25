import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPurchaseOrderById } from '../api/purchaseOrderApi';

const formatMoney = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0.00';
  return n.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const PurchaseOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getPurchaseOrderById(id);
        if (!alive) return;
        setPurchaseOrder(data || null);
        if (!data) setError('ไม่พบใบสั่งซื้อ');
      } catch (err) {
        if (!alive) return;
        console.error(`❌ load purchase order detail (${id}) error:`, err);
        setPurchaseOrder(null);
        setError('ไม่สามารถโหลดข้อมูลใบสั่งซื้อได้');
      } finally {
        if (alive) setLoading(false);
      }
    };

    if (id) load();
    else {
      setLoading(false);
      setError('ไม่พบรหัสใบสั่งซื้อ');
    }

    return () => {
      alive = false;
    };
  }, [id]);

  const items = useMemo(
    () => (Array.isArray(purchaseOrder?.items) ? purchaseOrder.items : []),
    [purchaseOrder]
  );

  const total = useMemo(
    () => items.reduce((sum, item) => {
      const quantity = Number(item?.quantity ?? 0);
      const costPrice = Number(item?.costPrice ?? 0);
      return sum + quantity * costPrice;
    }, 0),
    [items]
  );

  if (loading) return <p className="p-4">กำลังโหลด...</p>;
  if (error || !purchaseOrder) {
    return <p className="p-4 text-red-500">{error || 'ไม่พบใบสั่งซื้อ'}</p>;
  }

  const po = purchaseOrder;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold">ใบสั่งซื้อ {po.code || '-'}</h2>
          <Badge className="mt-2">{po.status || '-'}</Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ย้อนกลับ
          </Button>
          <Button onClick={() => navigate(`../print/${po.id}`)}>
            พิมพ์
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-muted-foreground">วันที่:</p>
          <p>
            {po.createdAt
              ? new Date(po.createdAt).toLocaleDateString('th-TH')
              : '-'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Supplier:</p>
          <p>{po.supplier?.name || '-'}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-muted-foreground">หมายเหตุ:</p>
          <p className="whitespace-pre-line">{po.note || '-'}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">รายการสินค้า</h3>
          <table className="w-full min-w-[640px] table-auto text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">#</th>
                <th>สินค้า</th>
                <th className="text-right">จำนวน</th>
                <th className="text-right">ราคาต่อหน่วย</th>
                <th className="text-right">รวม</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    ไม่มีรายการสินค้า
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const quantity = Number(item?.quantity ?? 0);
                  const costPrice = Number(item?.costPrice ?? 0);
                  return (
                    <tr key={item?.id ?? `${item?.productId ?? 'item'}-${index}`} className="border-b">
                      <td className="py-2">{index + 1}</td>
                      <td>{item.product?.name || item.productName || '-'}</td>
                      <td className="text-right">{quantity.toLocaleString('th-TH')}</td>
                      <td className="text-right">{formatMoney(costPrice)} ฿</td>
                      <td className="text-right">{formatMoney(quantity * costPrice)} ฿</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td colSpan={4} className="pt-4 text-right">รวมทั้งสิ้น</td>
                <td className="pt-4 text-right">{formatMoney(total)} ฿</td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrderDetailPage;
