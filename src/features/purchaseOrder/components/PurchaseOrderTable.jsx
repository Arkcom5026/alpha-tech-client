import React, { useEffect, useRef } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const PurchaseOrderTable = ({ products = [], setProducts = () => { }, loading = false, editable = true }) => {
  const lastRowRef = useRef(null);

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChange = (id, field, value) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: Number(value) || 0 } : item
      )
    );
  };

  useEffect(() => {
    if (lastRowRef.current) {
      lastRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [products.length]);

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-[200px]">ชื่อสินค้า</TableHead>
            <TableHead className="text-center w-[160px]">หมวดหมู่</TableHead>
            <TableHead className="text-center">รายละเอียด</TableHead>
            <TableHead className="text-center w-[100px]">จำนวน</TableHead>
            <TableHead className="text-center w-[120px]">ราคาทุน</TableHead>
            <TableHead className="text-center w-[120px]">ราคารวม</TableHead>
            <TableHead className="text-center w-[120px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!loading && products.length > 0 ? (
            products.map((item, index) => {
              const total = item.quantity * item.costPrice;
              const isLast = index === products.length - 1;
              return (
                <TableRow key={item.id} ref={isLast ? lastRowRef : null}>
                  <TableCell className="text-center">{item.title || '-'}</TableCell>
                  <TableCell className="text-center align-middle">{item.template?.name || 'ไม่มีหมวดหมู่'}</TableCell>
                  <TableCell className="text-center">{item.description || '-'}</TableCell>
                  <TableCell className="text-center">
                    <input
                      type="number"
                      value={item.quantity}
                      min={1}
                      onChange={(e) => handleChange(item.id, 'quantity', e.target.value)}
                      className="w-20 text-center border rounded p-1"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <input
                      type="number"
                      value={item.costPrice}
                      min={0}
                      onChange={(e) => handleChange(item.id, 'costPrice', e.target.value)}
                      className="w-24 text-center border rounded p-1"
                    />
                  </TableCell>
                  <TableCell className="text-center">{total.toLocaleString()} ฿</TableCell>
                  {editable && (
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <StandardActionButtons
                          onDelete={() => {
                            if (confirm(`ต้องการลบรายการ ${item.title} ใช่หรือไม่?`)) {
                              handleDelete(item.id);
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={editable ? 7 : 6} className="text-center text-muted-foreground">
                {loading ? 'กำลังโหลดข้อมูล...' : 'ยังไม่มีรายการสินค้าในใบสั่งซื้อ'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseOrderTable;
