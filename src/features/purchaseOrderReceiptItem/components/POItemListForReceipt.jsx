import React, { useEffect, useState } from 'react';
import usePurchaseOrderReceiptStore from '../../purchaseOrderReceipt/store/purchaseOrderReceiptStore';

const POItemListForReceipt = ({ poId, receiptId, setReceiptId, deliveryNoteNumber }) => {
  const {
    loadOrderById,
    currentOrder,
    loading,
    updateReceiptItemAction,
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

  useEffect(() => {
    if (poId) {
      loadOrderById(poId).then(() => {
        const initQuantities = {};
        const initPrices = {};
        const initTotals = {};
        currentOrder?.items?.forEach((item) => {
          initQuantities[item.id] = item.quantity || 0;
          initPrices[item.id] = item.costPrice || 0;
          initTotals[item.id] = (item.quantity || 0) * (item.costPrice || 0);
        });
        setReceiptQuantities(initQuantities);
        setReceiptPrices(initPrices);
        setReceiptTotals(initTotals);
        console.log(currentOrder);
      });
    }
  }, [poId]);

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
    const shouldWarn = item.quantity > 10 && value.toString().startsWith("1");

    setReceiptQuantities((prev) => ({
      ...prev,
      [itemId]: num,
    }));

    calculateTotal(itemId, num, receiptPrices[item.id] || 0);

    if ((num === 0 || isIncomplete || shouldWarn) && !statusPromptShown[itemId]) {
      setStatusPromptShown((prev) => ({
        ...prev,
        [itemId]: true,
      }));
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
    calculateTotal(itemId, receiptQuantities[itemId] || 0, costPrice);
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
        const newReceipt = await createReceiptAction({
          purchaseOrderId: poId,
          note: deliveryNoteNumber,
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

      const res = await addReceiptItemAction(payload);
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

  if (loading) return <p>กำลังโหลดรายการสินค้า...</p>;
  const allSaved = currentOrder?.items?.every((item) => savedRows[item.id]);

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-lg font-semibold">รายการสินค้าในใบสั่งซื้อ</h2>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-center px-2 py-1">ชื่อสินค้า</th>
              <th className="text-center px-2 py-1">หมวดหมู่</th>
              <th className="text-center px-2 py-1">รายละเอียด</th>
              <th className="text-center px-2 py-1">จำนวนสั่งซื้อ</th>
              <th className="text-center px-2 py-1">ราคาสั่งซื้อ</th>
              <th className="text-center px-2 py-1">จำนวนตรวจรับ</th>
              <th className="text-center px-2 py-1">ราคาตรวจรับ</th>
              <th className="text-center px-2 py-1">ยอดรวม</th>
              <th className="text-center px-2 py-1">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {(currentOrder?.items || []).map((item) => {
              const received = Number(item.receivedQuantity || 0);
              const quantity = receiptQuantities[item.id] ?? 0;
              const total = quantity + received;
              const isSaved = savedRows[item.id];
              const isEditing = editMode[item.id];
              const isOver = total > item.quantity;
              const isIncomplete = total < item.quantity;
              const showStatusPrompt = statusPromptShown[item.id];
              const isStatusSelected = itemStatus[item.id] === 'done' || itemStatus[item.id] === 'pending';
              const disableSave = saving[item.id] || quantity == null ||
                ((statusPromptShown[item.id] && !isStatusSelected) ||
                  (isOver && !forceAccept[item.id]));

              return (
                <tr key={item.id} className={isSaved ? 'bg-blue-100' : ''}>
                  <td className="border px-2 py-1">{item.product?.name || '-'}</td>
                  <td className="border px-2 py-1 text-center">{item.product?.template?.name || 'ไม่มีหมวดหมู่'}</td>
                  <td className="border px-2 py-1 text-center">{item.product?.description || '-'}</td>
                  <td className="border px-2 py-1 text-center">{item.quantity}</td>
                  <td className="border px-2 py-1 text-center">{item.costPrice}</td>
                  <td className="border px-2 py-1 text-center">
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
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      className="w-24 text-center border rounded px-1 py-0.5"
                      value={receiptPrices[item.id] ?? 0}
                      onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      disabled={isSaved && !isEditing}
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">{receiptTotals[item.id]?.toFixed(2)}</td>
                  <td className="border px-2 py-1 text-center space-x-1">
                    {!isSaved && (
                      <button
                        onClick={() => handleSaveItem(item)}
                        disabled={disableSave}
                        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving[item.id] ? 'กำลังบันทึก...' : 'บันทึก'}
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
