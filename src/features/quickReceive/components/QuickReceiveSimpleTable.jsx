



// =============================================================================
// File: src/features/quickReceive/components/QuickReceiveSimpleTable.jsx
// Purpose: Quick Receive (SIMPLE only) – per-row editing + save & remove actions
// Notes:
//  - No over/short logic. Qty is taken as-is (direct receive).
//  - Idempotency handled upstream via onSaveRow(dedupeKey) in the store.
//  - Expect each item shape: {
//      id, category, productType, productProfile, productTemplate,
//      name, model, mode, qty, costPrice,
//      isSaving?, isSaved?, error?
//    }
// =============================================================================
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const QuickReceiveSimpleTable = ({ items = [], setItems, onSaveRow, onRemoveRow, isFinalized = false }) => {
  const modeLabel = (m) => (m === 'SIMPLE' ? 'Simple' : (m === 'STRUCTURED' ? 'Structure' : '-'));

  const handleQtyChange = (id, value) => {
    const v = value === '' ? '' : Number(value);
    const qty = v === '' ? '' : (Number.isFinite(v) ? v : 0);
    setItems(items.map((it) => it.id === id ? { ...it, qty } : it));
  };

  const handleCostPriceChange = (id, value) => {
    const v = value === '' ? '' : Number(value);
    const costPrice = v === '' ? '' : (Number.isFinite(v) ? v : 0);
    setItems(items.map((it) => it.id === id ? { ...it, costPrice } : it));
  };

  const toggleEdit = (id, editing) => {
    setItems(items.map((it) => it.id === id ? { ...it, editMode: Boolean(editing) } : it));
  };

  const canSave = (it) => {
    if (it.isSaving) return false;
    if (isFinalized) return false; // lock all when finalized
    const q = Number(it.qty);
    if (!Number.isFinite(q) || q < 1) return false;
    if (it.costPrice === '' || it.costPrice === undefined) return true;
    const c = Number(it.costPrice);
    return Number.isFinite(c) && c >= 0;
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader className="bg-blue-100">
          <TableRow>
            <TableHead className="text-center w-[150px]">หมวดหมู่</TableHead>
            <TableHead className="text-center w-[130px]">ประเภท</TableHead>
            <TableHead className="text-center w-[130px]">ลักษณะ</TableHead>
            <TableHead className="text-center w-[130px]">รูปแบบ</TableHead>
            <TableHead className="text-center w-[160px]">ชื่อสินค้า</TableHead>
            <TableHead className="text-center w-[120px]">รุ่น</TableHead>
            <TableHead className="text-center w-[120px]">ประเภทสินค้า</TableHead>
            <TableHead className="text-center w-[90px]">จำนวน</TableHead>
            <TableHead className="text-center w-[110px]">ราคา/หน่วย</TableHead>
            <TableHead className="text-center w-[110px]">สถานะ</TableHead>
            <TableHead className="text-center w-[150px]">การกระทำ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(items) && items.length > 0 ? (
            items.map((it) => {
              const saved = Boolean(it.isSaved);
              const saving = Boolean(it.isSaving);
              const editing = Boolean(it.editMode);
              const lockInputs = isFinalized || saving || (!editing && saved);
              return (
                <TableRow key={it.id}>
                  <TableCell>{it.category || '-'}</TableCell>
                  <TableCell>{it.productType || '-'}</TableCell>
                  <TableCell>{it.productProfile || '-'}</TableCell>
                  <TableCell>{it.productTemplate || '-'}</TableCell>
                  <TableCell>{it.name}</TableCell>
                  <TableCell>{it.model || '-'}</TableCell>
                  <TableCell className="text-center">{modeLabel(it.mode ?? 'SIMPLE')}</TableCell>
                  <TableCell className="text-right">
                    <input
                      type="number"
                      step="1"
                      min={1}
                      className="w-20 h-8 text-right border rounded p-1"
                      placeholder="0"
                      value={it.qty === 0 ? '' : (it.qty ?? '')}
                      disabled={lockInputs}
                      onChange={(e) => handleQtyChange(it.id, e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-24 h-8 text-right border rounded p-1"
                      placeholder="0.00"
                      value={it.costPrice === 0 ? '' : (it.costPrice ?? '')}
                      disabled={lockInputs}
                      onChange={(e) => handleCostPriceChange(it.id, e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {isFinalized ? (
                      <span className="text-blue-800">FINALIZED</span>
                    ) : saving ? (
                      <span className="text-blue-700">กำลังบันทึก…</span>
                    ) : saved ? (
                      editing ? <span className="text-amber-700">EDITING</span> : <span className="text-green-700">SAVED</span>
                    ) : (
                      <span className="text-zinc-500">DRAFT</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {saved && !isFinalized && !editing ? (
                        <button
                          type="button"
                          className="px-3 py-1 rounded bg-amber-600 text-white disabled:opacity-50"
                          disabled={saving}
                          onClick={() => toggleEdit(it.id, true)}
                        >
                          แก้ไข
                        </button>
                      ) : null}

                      <button
                        type="button"
                        className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                        disabled={!canSave(it)}
                        onClick={() => {
                          if (onSaveRow) onSaveRow(it);
                          if (saved) toggleEdit(it.id, false);
                        }}
                      >
                        {saved && editing ? 'บันทึกแก้ไข' : 'บันทึก'}
                      </button>

                      {!isFinalized ? (
                        <button
                          type="button"
                          className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-50"
                          disabled={saving}
                          onClick={() => onRemoveRow && onRemoveRow(it)}
                        >
                          ลบ
                        </button>
                      ) : null}

                      {saved && editing && (
                        <button
                          type="button"
                          className="px-3 py-1 rounded bg-zinc-500 text-white"
                          onClick={() => toggleEdit(it.id, false)}
                        >
                          ยกเลิกแก้ไข
                        </button>
                      )}
                    </div>
                    {it.error ? (
                      <div className="mt-1 text-xs text-red-600">{String(it.error)}</div>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={11} className="text-center text-muted-foreground">
                ยังไม่มีรายการสินค้า
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuickReceiveSimpleTable;
