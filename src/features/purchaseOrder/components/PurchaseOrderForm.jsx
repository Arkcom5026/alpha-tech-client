// src/features/purchaseOrder/components/PurchaseOrderForm.jsx

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import PurchaseOrderSupplierSelector from './PurchaseOrderSupplierSelector';
import ProductSearchTable from './ProductSearchTable';
import PurchaseOrderTable from './PurchaseOrderTable';

import { usePurchaseOrderForm } from '../hooks/usePurchaseOrderForm';

const PurchaseOrderForm = ({
  mode = 'create',
  searchText = '',
  onSearchTextChange = () => {},
}) => {
  const {
    loading,
    supplier,
    setSupplier,
    suppliers,
    suppliersLoading,
    creditHint,
    orderDate,
    setOrderDate,
    products,
    setProducts,
    filter,
    handleFilterChange,
    handleCommitSearch,
    fetchedProducts,
    productsLoading,
    addProductToOrder,
    shouldPrint,
    setShouldPrint,
    submitError,
    handleCancel,
    handleSubmit,
    isSubmitting,
    dropdowns,
    currentBranchId,
  } = usePurchaseOrderForm(mode, searchText, onSearchTextChange);

  if (loading) {
    return (
      <p className="p-4 text-sm font-bold text-slate-500 animate-pulse">
        กำลังโหลดข้อมูลโครงสร้าง...
      </p>
    );
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <div className="flex gap-6 flex-wrap">
        <div className="w-[300px]">
          <Label className="text-xs font-black text-slate-600">เลือก Supplier คู่ค้า</Label>
          <PurchaseOrderSupplierSelector
            value={supplier}
            onChange={setSupplier}
            disabled={mode === 'edit'}
            currentBranchId={currentBranchId}
            suppliers={suppliers}
            loading={suppliersLoading}
          />
          {creditHint && (
            <p className="text-xs font-bold text-slate-400 mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
              วงเงินเครดิต:{' '}
              <span className="text-slate-900 font-sans font-black">
                ฿{creditHint.total.toLocaleString()}
              </span>{' '}
              • ใช้ไป:{' '}
              <span className="text-amber-600 font-sans font-black">
                ฿{creditHint.used.toLocaleString()}
              </span>
            </p>
          )}
        </div>

        <div className="w-[300px]">
          <Label className="text-xs font-black text-slate-600">วันที่ออกเอกสารสั่งซื้อ</Label>
          <Input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            readOnly={mode === 'edit'}
            className="font-bold"
          />
        </div>
      </div>

      <div className="bg-slate-50/50 border border-slate-200/60 p-4 rounded-2xl space-y-3">
        <Label className="text-xs font-black text-slate-700">
          กล่องคัดกรองสินค้าเข้าบิลจัดซื้อ
        </Label>

        <div className="flex flex-wrap gap-2">
          <select
            className="h-9 w-[240px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none focus:border-orange-500 transition-colors cursor-pointer"
            value={filter.productTypeId}
            onChange={(e) => {
              handleFilterChange({ productTypeId: e.target.value });
              setTimeout(() => handleCommitSearch(), 50);
            }}
          >
            <option value="">-- เลือกประเภทสินค้า --</option>
            {(dropdowns?.productTypes || []).map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          <select
            className="h-9 w-[240px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none focus:border-orange-500 transition-colors cursor-pointer"
            value={filter.brandId}
            onChange={(e) => {
              handleFilterChange({ brandId: e.target.value });
              setTimeout(() => handleCommitSearch(), 50);
            }}
          >
            <option value="">-- เลือกแบรนด์ --</option>
            {(dropdowns?.brands || []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Input
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCommitSearch();
              }
            }}
            placeholder="พิมพ์ชื่อสินค้า หรือสแกนบาร์โค้ด..."
            className="w-[460px] rounded-xl text-xs font-bold"
          />

          <button
            type="button"
            className="h-9 rounded-xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
            onClick={handleCommitSearch}
          >
            ค้นหาสินค้า
          </button>

          {productsLoading && (
            <span className="text-xs font-bold text-slate-400 animate-pulse">
              กำลังค้นหา...
            </span>
          )}
        </div>
      </div>

      <ProductSearchTable results={fetchedProducts} onAdd={addProductToOrder} />

      <PurchaseOrderTable products={products} setProducts={setProducts} editable={mode !== 'view'} />

      <div className="flex flex-col items-end px-4 gap-2 pt-4 border-t border-slate-100">
        {submitError && (
          <div
            className="w-full rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-bold"
            role="alert"
          >
            ⚠️ {submitError}
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={shouldPrint}
            onChange={(e) => setShouldPrint(e.target.checked)}
            className="rounded text-orange-500 accent-orange-500 cursor-pointer w-4 h-4"
          />
          <span className="text-xs text-gray-600 font-bold">
            พ่นพิมพ์ใบสั่งซื้อออกสลิปทันทีเมื่อบันทึกเอกสารสำเร็จ
          </span>
        </label>

        <div className="flex items-center gap-4 mt-1">
          <StandardActionButtons
            onSave={() => {
              if (!isSubmitting) handleSubmit();
            }}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;
