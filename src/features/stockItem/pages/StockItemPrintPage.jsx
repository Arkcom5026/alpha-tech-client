// ✅ StockItemPrintPage.jsx — หน้าเลือกจำนวนและพิมพ์บาร์โค้ดจากใบรับสินค้า (ปรับเป็น Modal ค้นหาใบรับสินค้า)

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';


const StockItemPrintPage = () => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [quantitiesToPrint, setQuantitiesToPrint] = useState({});

  const { receipts, loadReceipts, items, loadItemsFromReceipt  } = usePurchaseOrderReceiptStore();
  

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  useEffect(() => {
    if (selectedReceipt?.id) {
      loadItemsFromReceipt(selectedReceipt.id);
    }
  }, [selectedReceipt, loadItemsFromReceipt]);

  const handleChangeQuantity = (itemId, value) => {
    setQuantitiesToPrint((prev) => ({ ...prev, [itemId]: parseInt(value, 10) || 0 }));
  };

  const handlePrint = (itemId) => {
    const qty = quantitiesToPrint[itemId] || 0;
    if (qty <= 0) return alert('กรุณาระบุจำนวนที่ต้องการพิมพ์');
    console.log('📦 พิมพ์บาร์โค้ด: ', { itemId, qty });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <Label>ใบรับสินค้า</Label>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">🔍 ค้นหาใบรับสินค้า</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <h2 className="text-lg font-bold mb-2">เลือกใบรับสินค้า</h2>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">#</th>
                  <th className="border px-2 py-1">วันที่รับ</th>
                  <th className="border px-2 py-1">ผู้ขาย</th>
                  <th className="border px-2 py-1">การเลือก</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r.id}>
                    <td className="border px-2 py-1 text-center">{r.id}</td>
                    <td className="border px-2 py-1 text-center">{new Date(r.receivedDate).toLocaleDateString()}</td>
                    <td className="border px-2 py-1">{r.supplier?.name}</td>
                    <td className="border px-2 py-1 text-center">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedReceipt(r);
                          setShowDialog(false);
                        }}
                      >
                        เลือก
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DialogContent>
        </Dialog>

        {selectedReceipt && (
          <div className="mt-2 text-sm text-muted-foreground">
            ✅ เลือกใบรับ #{selectedReceipt.id} | วันที่ {new Date(selectedReceipt.receivedDate).toLocaleDateString()} | ผู้ขาย: {selectedReceipt.supplier?.name}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">สินค้า</th>
              <th className="border px-2 py-1">จำนวนรับ</th>
              <th className="border px-2 py-1">จำนวนพิมพ์</th>
              <th className="border px-2 py-1">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="border px-2 py-1">{item.product?.title}</td>
                <td className="border px-2 py-1 text-center">{item.quantity}</td>
                <td className="border px-2 py-1 text-center">
                  <Input
                    type="number"
                    value={quantitiesToPrint[item.id] || ''}
                    onChange={(e) => handleChangeQuantity(item.id, e.target.value)}
                    min={0}
                    max={item.quantity}
                    className="w-20 text-center"
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <Button onClick={() => handlePrint(item.id)}>พิมพ์</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StockItemPrintPage;
