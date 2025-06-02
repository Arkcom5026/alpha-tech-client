import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableFooter } from '@/components/ui/table';
import ProductSelectorModal from './ProductSelectorModal';
import useEmployeeStore from '@/store/employeeStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const PurchaseOrderProductTable = ({ products = [], setProducts }) => {
  const [openModal, setOpenModal] = useState(false);
  const { branch } = useEmployeeStore();

  const handleQuantityChange = (index, value) => {
    const updated = [...products];
    updated[index].quantity = Math.max(1, parseInt(value) || 1);
    setProducts(updated);
  };

  const handleRemove = (index) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const handleAddProducts = (selected) => {
    const existingIds = (Array.isArray(products) ? products : []).map((p) => p.id);
    const newItems = selected.filter((item) => !existingIds.includes(item.id));
    setProducts([...(Array.isArray(products) ? products : []), ...newItems]);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value);
  };

  const productArray = Array.isArray(products) ? products : [];

  const grandTotal = Array.isArray(productArray)
    ? productArray.reduce((sum, item) => {
        const quantity = item.quantity || 0;
        const unitPrice = item.unitPrice || 0;
        return sum + quantity * unitPrice;
      }, 0)
    : 0;

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>สินค้า</TableHead>
            <TableHead>จำนวน</TableHead>
            <TableHead>หน่วย</TableHead>
            <TableHead>ราคาต่อหน่วย</TableHead>
            <TableHead>รวม</TableHead>
            <TableHead className="text-right">การจัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productArray.map((item) => {
            const quantity = item.quantity || 0;
            const unitPrice = item.unitPrice || 0;
            const subtotal = quantity * unitPrice;

            return (
              <TableRow key={item.id}>
                <TableCell>{item.name || '-'}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={quantity}
                    min={1}
                    onChange={(e) => handleQuantityChange(productArray.findIndex(p => p.id === item.id), e.target.value)}
                  />
                </TableCell>
                <TableCell>{item.unit || '-'}</TableCell>
                <TableCell>{formatCurrency(unitPrice)}</TableCell>
                <TableCell>{formatCurrency(subtotal)}</TableCell>
                <TableCell className="text-right">
                  <StandardActionButtons
                    onDelete={() => handleRemove(productArray.findIndex(p => p.id === item.id))}
                    hideEdit
                  />
                </TableCell>
              </TableRow>
            );
          })}
          {productArray.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                ยังไม่มีสินค้าที่จะสั่งซื้อ
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {productArray.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-right font-bold">รวมทั้งหมด</TableCell>
              <TableCell className="font-bold">{formatCurrency(grandTotal)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>

      <div className="flex justify-end">
        <StandardActionButtons
          showCreate
          onAdd={() => setOpenModal(true)}
        />
      </div>

      <ProductSelectorModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleAddProducts}
        branchId={branch?.id}
      />
    </div>
  );
};

export default PurchaseOrderProductTable;
