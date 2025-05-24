// ✅ React Component: POForm (สร้างใบสั่งซื้อแบบสมบูรณ์)
// File: src/features/purchases/components/POForm.jsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from '@/components/ui/select';
import { getSuppliers, getProducts } from '@/features/purchases/api/poApi';

const POForm = ({ onSubmit, isLoading }) => {
  const [form, setForm] = useState({
    code: '',
    date: new Date().toISOString().slice(0, 10),
    note: '',
    supplierId: '',
    branchId: '',
    employeeId: '',
    items: [],
  });

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getSuppliers().then(setSuppliers);
    getProducts().then(setProducts);
  }, []);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][field] = value;
    setForm({ ...form, items: updatedItems });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { productId: '', quantity: 1, price: 0 }],
    });
  };

  const removeItem = (index) => {
    const updated = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="เลขที่ใบสั่งซื้อ" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
      <Input type="date" label="วันที่" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />

      <Select label="ผู้ขาย" value={form.supplierId} onValueChange={(val) => setForm({ ...form, supplierId: parseInt(val) })}>
        {suppliers.map((s) => (
          <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
        ))}
      </Select>

      <Input label="สาขา (branchId)" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: parseInt(e.target.value) })} />
      <Input label="พนักงาน (employeeId)" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: parseInt(e.target.value) })} />
      <Textarea label="หมายเหตุ" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />

      <div>
        <label className="block font-medium mb-1">รายการสินค้า</label>
        {form.items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center mb-2">
            <Select
              value={item.productId?.toString() || ''}
              onValueChange={(val) => handleItemChange(index, 'productId', parseInt(val))}
            >
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.title || `สินค้า #${p.id}`}
                </SelectItem>
              ))}
            </Select>

            <Input
              type="number"
              placeholder="จำนวน"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
              className="w-24"
            />
            <Input
              type="number"
              placeholder="ราคา"
              value={item.price}
              onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
              className="w-24"
            />
            <Button type="button" onClick={() => removeItem(index)} variant="destructive">
              ลบ
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addItem}>
          เพิ่มสินค้า
        </Button>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'กำลังบันทึก...' : 'บันทึกใบสั่งซื้อ'}
      </Button>
    </form>
  );
};

export default POForm;
