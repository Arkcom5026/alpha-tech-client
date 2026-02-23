

// POItemListForReceipt.js (patched)

import React, { useEffect, useState } from 'react';
import usePurchaseOrderReceiptStore from '../store/purchaseOrderReceiptStore';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// รับ formData เข้ามาเพื่อเอาค่าจากฟอร์มด้านบน
const POItemListForReceipt = ({ poId, receiptId, setReceiptId, formData }) => {
  const {
    loadOrderById,
    currentOrder,
    loading,
    addReceiptItemAction,
    createReceiptAction,
    updatePurchaseOrderStatusAction,
  } = usePurchaseOrderReceiptStore();

  const [receiptQuantities, setReceiptQuantities] = useState({});
  const [receiptPrices, setReceiptPrices] = useState({});
  const [receiptTotals, setReceiptTotals] = useState({});
  const [saving, setSaving] = useState({});
  const [editMode, setEditMode] = useState({});
  const [savedRows, setSavedRows] = useState({});
  const [forceAccept, setForceAccept] = useState({});
  const [itemStatus, setItemStatus] = useState({});
  const [statusPromptShown, setStatusPromptShown] = useState({});
  const [finalizeError, setFinalizeError] = useState('');

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (poId) {
      setIsInitialized(false);
      loadOrderById(poId);
    }
  }, [poId, loadOrderById]);

  useEffect(() => {
    if (currentOrder && currentOrder.id === Number(poId) && !isInitialized) {
      const initQuantities = {};
      const initPrices = {};
      const initTotals = {};
      (currentOrder.items || []).forEach((item) => {
        const qty = Number(item.quantity || 0);
        const received = Number(item.receivedQuantity || 0);
        const remainingQty = qty - received;
        const qtyToSet = remainingQty > 0 ? remainingQty : 0;
        const priceToSet = Number(item.costPrice || 0);
        initQuantities[item.id] = qtyToSet;
        initPrices[item.id] = priceToSet;
        initTotals[item.id] = qtyToSet * priceToSet;
      });
      setReceiptQuantities(initQuantities);
      setReceiptPrices(initPrices);
      setReceiptTotals(initTotals);
      setIsInitialized(true);
    }
  }, [currentOrder, poId, isInitialized]);

  const calculateTotal = (itemId, quantity, costPrice) => {
    const q = Number(quantity) || 0;
    const c = Number(costPrice) || 0;
    setReceiptTotals((prev) => ({
      ...prev,
      [itemId]: q * c,
    }));
  };

  const handleQuantityChange = (itemId, value) => {
    const num = Number(value);
    const item = (currentOrder?.items || []).find((i) => i.id === itemId);
    if (!item || Number.isNaN(num) || num < 0) return;

    const received = Number(item.receivedQuantity || 0);
    const total = num + received;
    const isIncomplete = total < Number(item.quantity || 0);

    const shouldWarn = Number(item.quantity || 0) > 10 && value.toString().startsWith('1');

    setReceiptQuantities((prev) => ({
      ...prev,
      [itemId]: num,
    }));
    const price = receiptPrices[item.id] ?? Number(item.costPrice || 0);
    calculateTotal(itemId, num, price);

    if ((num === 0 || isIncomplete || shouldWarn) && !statusPromptShown[itemId]) {
      setStatusPromptShown((prev) => ({ ...prev, [itemId]: true }));
    } else if (!isIncomplete && !shouldWarn && statusPromptShown[itemId]) {
      setStatusPromptShown((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }
  };

  const handlePriceChange = (itemId, value) => {
    const costPrice = Number(value);
    if (Number.isNaN(costPrice) || costPrice < 0) return;
    setReceiptPrices((prev) => ({
      ...prev,
      [itemId]: costPrice,
    }));
    const quantity = receiptQuantities[itemId] ?? 0;
    calculateTotal(itemId, quantity, costPrice);
  };

  const handleBlurQuantity = (itemId) => {
    setReceiptQuantities((prev) => {
      const current = prev[itemId];
      return { ...prev, [itemId]: current === '' || current === null ? 0 : current };
    });
  };

  const handleFocusQuantity = (itemId) => {
    setReceiptQuantities((prev) => {
      const current = prev[itemId];
      return { ...prev, [itemId]: current === 0 ? '' : current };
    });
  };

  const handleSaveItem = async (item) => {
    try {
      setSaving((prev) => ({ ...prev, [item.id]: true }));
      let newReceiptId = receiptId;

      if (!newReceiptId) {
        // สร้างใบรับของครั้งแรก พร้อมค่าจากฟอร์มด้านบน
        const newReceipt = await createReceiptAction({
          purchaseOrderId: Number(poId),
          note: (formData?.note ?? '').trim(),
          supplierTaxInvoiceNumber: (formData?.supplierTaxInvoiceNumber ?? '').trim() || null,
          supplierTaxInvoiceDate: formData?.supplierTaxInvoiceDate || null,
          receivedAt: formData?.receivedAt || new Date().toISOString().slice(0, 10),
        });
        newReceiptId = newReceipt.id;
        setReceiptId(newReceiptId);
      }

      const qtyToReceive = Number(receiptQuantities[item.id] ?? 0);
      const costPriceToReceive = Number(receiptPrices[item.id] ?? 0);

      // NOTE (Minimal Disruption):
      // - PO Receipt สามารถรับเกิน PO ได้ (ตาม business rule ใหม่) แต่ "receivedQuantity" ฝั่ง PO ยังคงยึดจากการยิง SN เข้าสต๊อก (Stock-based) เท่านั้น
      // - เราจะเปิดทางเฉพาะกรณีผู้ใช้ติ๊กยืนยันรับเกิน (forceAccept) เพื่อไม่กระทบโฟลว์เดิม
      const payload = {
        quantity: qtyToReceive,
        costPrice: costPriceToReceive,
        purchaseOrderReceiptId: newReceiptId,
        purchaseOrderItemId: item.id,
        // ✅ ส่งเฉพาะตอนที่ user ติ๊ก (ไม่ติ๊ก = behavior เดิม 100%)
        forceAccept: !!forceAccept[item.id],
      };

      await addReceiptItemAction(payload);
      setSavedRows((prev) => ({ ...prev, [item.id]: true }));
      setEditMode((prev) => ({ ...prev, [item.id]: false }));
      setFinalizeError('');
    } catch (error) {
      console.error('❌ saveItem error:', error);
    } finally {
      setSaving((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleConfirmFinalize = () => {
    const allSaved = (currentOrder?.items || []).every((item) => savedRows[item.id]);
    if (!allSaved) { setFinalizeError('กรุณาบันทึกรายการสินค้าทั้งหมดก่อน'); return; }

    const allDone = (currentOrder?.items || []).every((item) => {
      const status = itemStatus[item.id];
      return status === 'done' || (Number(item.receivedQuantity || 0) >= Number(item.quantity || 0));
    });
    const statusToSet = allDone ? 'COMPLETED' : 'PARTIALLY_RECEIVED';
    updatePurchaseOrderStatusAction({ id: currentOrder.id, status: statusToSet });
    setFinalizeError('');
  };

  if (loading || !isInitialized) return <p>กำลังโหลดรายการสินค้า...</p>;

  const allSaved = currentOrder?.items?.every((item) => savedRows[item.id]);

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-lg font-semibold">รายการสินค้าในใบสั่งซื้อ</h2>
      {finalizeError && (
        <div className="rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-700">{finalizeError}</div>
      )}
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader className="bg-blue-100">
            <TableRow>
              <TableHead className="text-center w-[150px]">หมวดหมู่</TableHead>
              <TableHead className="text-center w-[130px]">ประเภท</TableHead>
              <TableHead className="text-center w-[130px]">แบรนด์</TableHead>
              <TableHead className="text-center w-[130px]">โปรไฟล์</TableHead>
              <TableHead className="text-center w-[130px]">เทมเพลต</TableHead>
              <TableHead className="text-center w-[200px]">ชื่อสินค้า</TableHead>
              <TableHead className="text-center w-[80px]">จำนวนที่สั่ง</TableHead>
              <TableHead className="text-center w-[100px]">ราคาที่สั่ง</TableHead>
              <TableHead className="text-center w-[100px]">จำนวนที่รับ</TableHead>
              <TableHead className="text-center w-[100px]">ราคาที่รับ</TableHead>
              <TableHead className="text-center w-[100px]">รวม</TableHead>
              <TableHead className="text-center w-[120px]">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(currentOrder?.items || []).map((item) => {
              // normalize product hierarchy names for display (defensive + lenient)
              const catName = item.product?.category?.name
                ?? item.product?.productTemplate?.productProfile?.productType?.category?.name
                ?? item.category?.name
                ?? item.categoryName
                ?? item.product?.categoryName
                ?? '-';
              const typeName = item.product?.productType?.name
                ?? item.product?.productTemplate?.productProfile?.productType?.name
                ?? item.productType?.name
                ?? item.productTypeName
                ?? item.product?.productTypeName
                ?? '-';
              const brandName = item.product?.brand?.name
                ?? item.brand?.name
                ?? item.brandName
                ?? item.product?.brandName
                ?? '-';
              const profileName = item.product?.productProfile?.name
                ?? item.product?.productTemplate?.productProfile?.name
                ?? item.productProfile?.name
                ?? item.productProfileName
                ?? item.product?.productProfileName
                ?? '-';
              const templateName = item.product?.productTemplate?.name
                ?? item.productTemplate?.name
                ?? item.productTemplateName
                ?? '-';
              const productName = item.product?.name
                ?? item.product?.productTemplate?.name
                ?? item.name
                ?? item.productName
                ?? '-';
              const received = Number(item.receivedQuantity || 0);
              const qtyOrdered = Number(item.quantity || 0);
              const quantity = receiptQuantities[item.id] ?? '';
              const price = receiptPrices[item.id] ?? '';
              const total = Number(receiptTotals[item.id] ?? 0);
              const isSaved = !!savedRows[item.id];
              const isEditing = !!editMode[item.id];
              const canEdit = isEditing || !isSaved;
              const isOver = (Number(quantity) + received) > qtyOrdered;
              const showStatusPrompt = !!statusPromptShown[item.id];
              const isStatusSelected = itemStatus[item.id] === 'done' || itemStatus[item.id] === 'pending';
              const disableSave = !!(
                saving[item.id]
                || quantity === ''
                || ((showStatusPrompt && !isStatusSelected) || (isOver && !forceAccept[item.id]))
              );

              return (
                <TableRow key={item.id}>
                  <TableCell>{catName}</TableCell>
                  <TableCell>{typeName}</TableCell>
                  <TableCell>{brandName}</TableCell>
                  <TableCell>{profileName}</TableCell>
                  <TableCell>{templateName}</TableCell>
                  <TableCell>{productName}</TableCell>
                  <TableCell className="text-center px-2 py-1">{qtyOrdered}</TableCell>
                  <TableCell className="text-center px-2 py-1">{Number(item.costPrice || 0)}</TableCell>
                  <TableCell className="px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      className="w-20 text-right border rounded px-1 py-0.5"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      onFocus={() => handleFocusQuantity(item.id)}
                      onBlur={() => handleBlurQuantity(item.id)}
                      disabled={!canEdit}
                    />
                    {isOver && (
                      <label className="flex items-center text-xs mt-1">
                        <input
                          type="checkbox"
                          checked={!!forceAccept[item.id]}
                          onChange={(e) => setForceAccept((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                          className="mr-1"
                        />
                        ยืนยันรับแม้เกิน
                      </label>
                    )}
                    {showStatusPrompt && (
                      <div className="text-xs mt-1 space-y-1">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`itemStatus-${item.id}`}
                            checked={itemStatus[item.id] === 'done'}
                            onChange={() => setItemStatus((prev) => ({ ...prev, [item.id]: 'done' }))}
                            className="mr-1"
                          />
                          ยืนยันรับเท่านี้
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`itemStatus-${item.id}`}
                            checked={itemStatus[item.id] === 'pending'}
                            onChange={() => setItemStatus((prev) => ({ ...prev, [item.id]: 'pending' }))}
                            className="mr-1"
                          />
                          ค้างส่ง
                        </label>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-24 text-right border rounded px-1 py-0.5"
                      value={price === 0 ? '' : price}
                      onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      disabled={!canEdit}
                    />
                  </TableCell>
                  <TableCell className="text-right px-2 py-1">{total.toFixed(2)}</TableCell>
                  <TableCell className="text-center px-2 py-1">
                    {(!isSaved || isEditing) && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSaveItem(item)}
                          disabled={disableSave}
                          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving[item.id] ? '...' : (isSaved ? 'บันทึก' : 'บันทึก')}
                        </button>
                        {isSaved && isEditing && (
                          <button
                            type="button"
                            onClick={() => setEditMode((prev) => ({ ...prev, [item.id]: false }))}
                            className="bg-gray-200 text-gray-900 px-2 py-1 rounded hover:bg-gray-300"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </div>
                    )}
                    {isSaved && !isEditing && (
                      <button
                        type="button"
                        onClick={() => setEditMode((prev) => ({ ...prev, [item.id]: true }))}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        แก้ไข
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="pt-4 text-right">
        <button
          onClick={handleConfirmFinalize}
          disabled={!allSaved}
          className="bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          บันทึกใบรับสินค้า
        </button>
      </div>
    </div>
  );
};

export default POItemListForReceipt;





