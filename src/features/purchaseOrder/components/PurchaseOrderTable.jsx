import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const PurchaseOrderTable = ({ purchaseOrders = [], loading = false, onDelete }) => {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">เลขที่ใบสั่งซื้อ</TableHead>
            <TableHead className="text-center">Supplier</TableHead>
            <TableHead className="text-center">วันที่</TableHead>
            <TableHead className="text-center">จำนวน</TableHead>
            <TableHead className="text-center">ยอดรวม</TableHead>
            <TableHead className="text-center">สถานะ</TableHead>
            <TableHead className="text-center">การจัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!loading && purchaseOrders.length > 0 ? (
            purchaseOrders.map((po) => {
              const itemCount = po.items?.length || 0;
              const totalAmount = po.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;

              return (
                <TableRow key={po.id}>
                  <TableCell className="text-center">{po.code || `PO-${po.id}`}</TableCell>
                  <TableCell className="text-center">{po.supplier?.name || '-'}</TableCell>
                  <TableCell className="text-center">{new Date(po.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">{itemCount} รายการ</TableCell>
                  <TableCell className="text-center">{totalAmount.toLocaleString()} ฿</TableCell>
                  <TableCell className="text-center">
                    <Badge className={statusColors[po.status] || ''}>{po.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <StandardActionButtons
                        onViewLink={`/pos/purchases/orders/view/${po.id}`}
                        onEditLink={`/pos/purchases/orders/edit/${po.id}`}
                        onDelete={() => {
                          if (window.confirm(`ต้องการลบใบสั่งซื้อ ${po.code} ใช่หรือไม่?`)) {
                            onDelete?.(po.id);
                          }
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                {loading ? 'กำลังโหลดข้อมูล...' : 'ไม่พบข้อมูลใบสั่งซื้อ'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseOrderTable;
