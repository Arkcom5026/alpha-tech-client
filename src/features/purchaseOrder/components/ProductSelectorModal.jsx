import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@/components/ui/table';

import usePurchaseOrderStore from '../store/purchaseOrderStore';

const ProductSelectorModal = ({ open, onClose, onConfirm, branchId }) => {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [initialLoaded, setInitialLoaded] = useState(false);

  const { loadProductsPurchaseOrder, productList: products } = usePurchaseOrderStore();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (open && debouncedSearch.trim() !== '') {
      loadProductsPurchaseOrder({ search: debouncedSearch, limit: 50 });
      setInitialLoaded(true);
    }
  }, [open, branchId, debouncedSearch, loadProductsPurchaseOrder]);

  const toggleSelect = (product) => {
    const exists = selected.find((p) => p.id === product.id);
    if (exists) {
      setSelected((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      setSelected((prev) => [
        ...prev,
        {
          id: product.id,
          name: product.title,
          unit: product.unit || product.template?.unit || '-',
          unitPrice: product.cost ?? product.template?.cost ?? 0,
          quantity: 1,
        },
      ]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selected);
    setSelected([]);
    setSearch('');
    setInitialLoaded(false);
    onClose();
  };

  const totalPrice = selected.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>เลือกสินค้า</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="ค้นหาชื่อสินค้า"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อสินค้า</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>หน่วย</TableHead>
                <TableHead className="text-right">เลือก</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const isSelected = selected.some((p) => p.id === product.id);
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>{product.categoryName || '-'}</TableCell>
                    <TableCell>{product.unit || product.template?.unit || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={isSelected ? 'secondary' : 'outline'}
                        onClick={() => toggleSelect(product)}
                      >
                        {isSelected ? '✓ เลือกแล้ว' : 'เลือก'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {products.length === 0 && initialLoaded && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    ไม่พบสินค้าที่ค้นหา
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {selected.length > 0 && (
            <div className="text-sm text-right text-muted-foreground">
              รายการที่เลือก: {selected.length} รายการ | รวม {totalPrice.toLocaleString()} บาท
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
            <Button onClick={handleConfirm} disabled={selected.length === 0}>
              ✅ เพิ่ม {selected.length} รายการ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelectorModal;
