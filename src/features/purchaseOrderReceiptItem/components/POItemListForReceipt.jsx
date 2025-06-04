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
        currentOrder?.items?.forEach((item) => {
          initQuantities[item.id] = 0;
        });
        setReceiptQuantities(initQuantities);
      });
    }
  }, [poId]);

  const handleQuantityChange = (itemId, value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return;
    setReceiptQuantities((prev) => {
      const updated = { ...prev, [itemId]: num };

      const item = currentOrder?.items?.find((i) => i.id === itemId);
      if (!item) return updated;

      const received = Number(item.receivedQuantity || 0);
      const total = num + received;
      const isIncomplete = total < item.quantity;

      if ((num === 0 || isIncomplete) && !statusPromptShown[itemId]) {
        setStatusPromptShown((prevShown) => ({ ...prevShown, [itemId]: true }));
      }

      return updated;
    });
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

  const handleSaveItem = async (itemId) => {
    try {
      const quantity = Number(receiptQuantities[itemId]);
      const item = currentOrder.items.find((i) => i.id === itemId);
      const received = Number(item.receivedQuantity || 0);
      const total = quantity + received;

      const isOver = total > item.quantity;
      const isIncomplete = total < item.quantity;
      const isStatusSelected = itemStatus[item.id] === 'done' || itemStatus[item.id] === 'pending';

      if ((quantity === 0 || isIncomplete) && !isStatusSelected) {
        setStatusPromptShown((prev) => ({ ...prev, [itemId]: true }));
        return;
      }

      if (isOver && !forceAccept[itemId]) {
        return;
      }

      setSaving((prev) => ({ ...prev, [itemId]: true }));
      let currentReceiptId = receiptId;

      if (!currentReceiptId) {
        const newReceipt = await createReceiptAction({ purchaseOrderId: poId, deliveryNoteNumber });
        currentReceiptId = newReceipt?.id;
        if (!currentReceiptId) throw new Error('ไม่สามารถสร้างใบรับสินค้าได้');
        setReceiptId(currentReceiptId);
      }

      const isSaved = received > 0 || savedRows[itemId];
      const isEditing = editMode[itemId];

      if (isSaved && isEditing) {
        await updateReceiptItemAction({ purchaseOrderReceiptId: currentReceiptId, purchaseOrderItemId: itemId, quantity });
        setEditMode((prev) => ({ ...prev, [itemId]: false }));
        setSavedRows((prev) => ({ ...prev, [itemId]: true }));
      } else if (!isSaved) {
        await addReceiptItemAction({ purchaseOrderReceiptId: currentReceiptId, purchaseOrderItemId: itemId, quantity });
        setSavedRows((prev) => ({ ...prev, [itemId]: true }));
      }
    } catch (err) {
      console.error('❌ บันทึกรายการไม่สำเร็จ:', err);
    } finally {
      setSaving((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleFinalizeReceipt = () => {
    setFinalizeMode(true);
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">รายการสินค้าในใบสั่งซื้อ</h2>
      <table className="w-full table-auto border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">รหัสสินค้า</th>
            <th className="border px-2 py-1">ชื่อสินค้า</th>
            <th className="border px-2 py-1">จำนวนที่สั่ง</th>
            <th className="border px-2 py-1">จำนวนที่รับ</th>
            <th className="border px-2 py-1">จัดการ</th>
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
                <td className="border px-2 py-1 text-center">{item.product?.id || '-'}</td>
                <td className="border px-2 py-1">{item.product?.title}</td>
                <td className="border px-2 py-1 text-center">{item.quantity}</td>
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
                <td className="border px-2 py-1 text-center space-x-1">
                  {!isSaved && (
                    <button
                      onClick={() => handleSaveItem(item.id)}
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
