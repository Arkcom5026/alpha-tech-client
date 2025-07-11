import React, { useEffect, useState, useCallback } from 'react';
import usePurchaseOrderReceiptStore from '../store/purchaseOrderReceiptStore';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ✨ CHANGED: รับ formData เข้ามาเพื่อเอาค่าจากฟอร์มด้านบน
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
  const [finalizeMode, setFinalizeMode] = useState(false);
  const [itemStatus, setItemStatus] = useState({});
  const [statusPromptShown, setStatusPromptShown] = useState({});
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (poId) {
      setIsInitialized(false);
      loadOrderById(poId);
    }
  }, [poId, loadOrderById]);

  useEffect(() => {
    if (currentOrder && currentOrder.id === parseInt(poId, 10) && !isInitialized) {
      const initQuantities = {};
      const initPrices = {};
      const initTotals = {};
      currentOrder.items.forEach((item) => {
        const remainingQty = item.quantity - item.receivedQuantity;
        const qtyToSet = remainingQty > 0 ? remainingQty : 0;
        const priceToSet = item.costPrice || 0;
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
    setReceiptTotals((prev) => ({
      ...prev,
      [itemId]: quantity * costPrice
    }));
  };

  const handleQuantityChange = (itemId, value) => {
    const num = Number(value);
    const item = currentOrder.items.find((i) => i.id === itemId);
    if (!item || isNaN(num) || num < 0) return;

    const received = Number(item.receivedQuantity || 0);
    const total = num + received;
    const isIncomplete = total < item.quantity;
    
    // This logic seems specific, keeping it as is.
    const shouldWarn = item.quantity > 10 && value.toString().startsWith("1");

    setReceiptQuantities((prev) => ({
      ...prev,
      [itemId]: num,
    }));
    const price = receiptPrices[itemId] ?? item.costPrice ?? 0;
    calculateTotal(itemId, num, price);

    if ((num === 0 || isIncomplete || shouldWarn) && !statusPromptShown[itemId]) {
      setStatusPromptShown((prev) => ({ ...prev, [itemId]: true, }));
    } else if (!isIncomplete && !shouldWarn && statusPromptShown[itemId]) {
      setStatusPromptShown((prev) => {
        const newShown = { ...prev };
        delete newShown[itemId];
        return newShown;
      });
    }
  };

  const handlePriceChange = (itemId, value) => {
    const costPrice = Number(value);
    if (isNaN(costPrice) || costPrice < 0) return;
    setReceiptPrices((prev) => ({
      ...prev,
      [itemId]: costPrice
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
        // ✨ CHANGED: ส่งข้อมูลจากฟอร์มเข้าไปใน action เพื่อสร้างใบรับของ
        const newReceipt = await createReceiptAction({
          purchaseOrderId: poId,
          note: formData.note,
          supplierTaxInvoiceNumber: formData.supplierTaxInvoiceNumber,
          supplierTaxInvoiceDate: formData.supplierTaxInvoiceDate,
        });
        newReceiptId = newReceipt.id;
        setReceiptId(newReceiptId);
      }

      const payload = {
        quantity: receiptQuantities[item.id],
        costPrice: receiptPrices[item.id],
        receiptId: newReceiptId,
        purchaseOrderItemId: item.id,
      };
      await addReceiptItemAction(payload);
      setSavedRows((prev) => ({ ...prev, [item.id]: true }));
    } catch (error) {
      console.error('❌ saveItem error:', error);
    } finally {
      setSaving((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleConfirmFinalize = () => {
    const allSaved = currentOrder.items.every((item) => savedRows[item.id]);
    if (!allSaved) return alert('กรุณาบันทึกรายการสินค้าทั้งหมดก่อน');

    const allDone = currentOrder.items.every((item) => {
      const status = itemStatus[item.id];
      return status === 'done' || (item.receivedQuantity || 0) >= item.quantity;
    });
    const statusToSet = allDone ? 'COMPLETED' : 'PARTIAL';
    updatePurchaseOrderStatusAction({ id: currentOrder.id, status: statusToSet });
    setFinalizeMode(false);
  };

  if (loading || !isInitialized) return <p>กำลังโหลดรายการสินค้า...</p>;

  const allSaved = currentOrder?.items?.every((item) => savedRows[item.id]);

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-lg font-semibold">รายการสินค้าในใบสั่งซื้อ</h2>
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader className="bg-blue-100">
            <TableRow>              
              <TableHead className="text-center w-[150px]">หมวดหมู่</TableHead>
              <TableHead className="text-center w-[130px]">ประเภท</TableHead>
              <TableHead className="text-center w-[130px]">ลักษณะ</TableHead>
              <TableHead className="text-center w-[130px]">รูปแบบ</TableHead>
              <TableHead className="text-center w-[120px]">ชื่อ</TableHead>
              <TableHead className="text-center w-[120px]">รุ่น</TableHead>
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
              const received = Number(item.receivedQuantity || 0);
              const quantity = receiptQuantities[item.id] ?? '';
              const price = receiptPrices[item.id] ?? '';
              const total = receiptTotals[item.id] ?? 0;
              const isSaved = savedRows[item.id];
              const isEditing = editMode[item.id];
              const isOver = (Number(quantity) + received) > item.quantity;
              const showStatusPrompt = statusPromptShown[item.id];
              const isStatusSelected = itemStatus[item.id] === 'done' || itemStatus[item.id] === 'pending';
              const disableSave = saving[item.id] || quantity === '' ||
                ((showStatusPrompt && !isStatusSelected) ||
                  (isOver && !forceAccept[item.id]));
              
              return (
                <TableRow key={item.id}>
                  <TableCell>{item.product?.category || '-'}</TableCell>
                  <TableCell>{item.product?.productType || '-'}</TableCell>
                  <TableCell>{item.product?.productProfile || '-'}</TableCell>
                  <TableCell>{item.product?.productTemplate || '-'}</TableCell>                  
                  <TableCell>{item.product?.name || '-'}</TableCell>
                  <TableCell>{item.product?.model || '-'}</TableCell>                  
                  <TableCell className="text-center px-2 py-1">{item.quantity}</TableCell>
                  <TableCell className="text-center px-2 py-1">{item.costPrice}</TableCell>
                  <TableCell className="px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      className="w-20 text-center border rounded px-1 py-0.5"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      onFocus={() => handleFocusQuantity(item.id)}
                      onBlur={() => handleBlurQuantity(item.id)}
                      disabled={isSaved && !isEditing}
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
                      className="w-24 text-center border rounded px-1 py-0.5"
                      value={price}
                      onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      disabled={isSaved && !isEditing}
                    />
                  </TableCell>
                  <TableCell className="text-right px-2 py-1">{total.toFixed(2)}</TableCell>
                  <TableCell className="text-center px-2 py-1">
                    {!isSaved && (
                      <button
                        onClick={() => handleSaveItem(item)}
                        disabled={disableSave}
                        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving[item.id] ? '...' : 'บันทึก'}
                      </button>
                    )}
                    {isSaved && (
                      <button
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
