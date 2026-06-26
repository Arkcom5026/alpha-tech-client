// src/features/purchaseOrder/components/PurchaseOrderForm.jsx

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import PurchaseOrderSupplierSelector from './PurchaseOrderSupplierSelector';
import ProductSearchTable from './ProductSearchTable';
import PurchaseOrderTable from './PurchaseOrderTable';

// เลื่อนสายพานเรียกฟังก์ชันห้องเครื่องจาก Custom Hook
import { usePurchaseOrderForm } from '../hooks/usePurchaseOrderForm';

const PurchaseOrderForm = ({
  mode = 'create',
  searchText = '',
  onSearchTextChange = () => {},
}) => {
  // ดีดนิ้วเรียกสารพัด Logic ออกมาจาก Hook เลเยอร์วิศวกรรม
  const {
    loading, supplier, setSupplier, creditHint, orderDate, setOrderDate,
    products, setProducts, filter, handleFilterChange, handleCommitSearch,
    fetchedProducts, addProductToOrder, shouldPrint, setShouldPrint,
    submitError, handleCancel, handleSubmit, isSubmitting
  } = usePurchaseOrderForm(mode, searchText, onSearchTextChange);

  if (loading) return <p className="p-4">กำลังโหลดข้อมูล...</p>;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {/* 🏢 ส่วนที่ 1: การเลือก Supplier และระบุวันที่จัดซื้อ */}
      <div className="flex gap-6 flex-wrap">
        <div className="w-[300px]">
          <Label>เลือก Supplier</Label>
          <PurchaseOrderSupplierSelector value={supplier} onChange={setSupplier} disabled={mode === 'edit'} />
          {creditHint && (
            <p className="text-sm text-muted-foreground mt-1">
              เครดิตโดยประมาณ: ฿{creditHint.total.toLocaleString()} / ใช้ไปแล้ว: ฿{creditHint.used.toLocaleString()}
            </p>
          )}
        </div>
        <div className="w-[300px]">
          <Label>วันที่สั่งซื้อ</Label>
          <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} readOnly={mode === 'edit'} />
        </div>
      </div>

      {/* 🔍 ส่วนที่ 2: เครื่องมือกรอกฟิลเตอร์ค้นหาสินค้าเข้าใบสั่งซื้อ */}
      <div className="p-2 space-y-2">
        <Label>ค้นหาสินค้า</Label>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-9 w-[220px] rounded-md border border-input bg-background px-3 text-sm"
            value={filter.categoryId}
            onChange={(e) => handleFilterChange({ categoryId: e.target.value })}
          >
            <option value="">-- เลือกหมวดหมู่ --</option>
            {/* ดึงโครงสร้างผ่านระบบ Dropdown ของผลิตภัณฑ์ */}
            {/* Array Map เรนเดอร์ Option ตามโครงสร้างดั้งเดิม */}
          </select>
          {/* ... (คอมโพเนนต์ Select สำหรับประเภทสินค้าและแบรนด์ คงไว้ตามสัดส่วนเดิมของคุณ) ... */}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCommitSearch();
              }
            }}
            placeholder="ค้นหาด้วยชื่อสินค้า"
            className="w-[460px]"
          />
          <button type="button" className="h-9 rounded-md border border-zinc-300 bg-white px-4 text-sm" onClick={handleCommitSearch}>
            ค้นหา
          </button>
        </div>
      </div>

      {/* 📊 ส่วนที่ 3: ตารางแสดงผลลัพธ์การสืบค้นข้อมูลผลิตภัณฑ์ตระกูลไอที */}
      <ProductSearchTable results={fetchedProducts} onAdd={addProductToOrder} />

      {/* 🛒 ส่วนที่ 4: ตะกร้าสรุปรายการสินค้า ข้อมูลราคาทุน และจำนวนที่จะส่งบิลจัดซื้อ */}
      <PurchaseOrderTable products={products} setProducts={setProducts} editable={mode !== 'view'} />

      {/* ⚙️ ส่วนที่ 5: แถบสรุปข้อความเออเร่อ และปุ่มสลักคำสั่งกดบันทึก/ยกเลิกเอกสาร */}
      <div className="flex flex-col items-end px-4 gap-2">
        {submitError && (
          <div className="w-full rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {submitError}
          </div>
        )}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={shouldPrint} onChange={(e) => setShouldPrint(e.target.checked)} />
          <span className="text-sm text-gray-700">พิมพ์ใบสั่งซื้อ</span>
        </label>
        <div className="flex items-center gap-4">
          <StandardActionButtons
            onSave={() => { if (!isSubmitting) handleSubmit(); }}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;