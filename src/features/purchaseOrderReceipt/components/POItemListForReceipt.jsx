






// POItemListForReceipt.js

import React, { useEffect, useMemo, useState } from 'react';
import usePurchaseOrderReceiptStore from '../store/purchaseOrderReceiptStore';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// รับ formData เข้ามาเพื่อเอาค่าจากฟอร์มด้านบน
// รองรับการส่ง items (normalized) จาก Page เพื่อให้คอลัมน์หมวดหมู่/ประเภท/แบรนด์/โปรไฟล์/เทมเพลต แสดงได้แน่นอน
const POItemListForReceipt = ({ poId, receiptId, setReceiptId, formData, items }) => {
  const {
    loadOrderByIdAction,
    loadOrderById,
    currentOrder,
    loading,
    error,
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
  // ✅ Track quantities saved in THIS receipt session (so Finalize can compute status correctly even if reload is slow/fails)
  const [sessionSavedQty, setSessionSavedQty] = useState({});
  const [forceAccept, setForceAccept] = useState({});
  const [itemStatus, setItemStatus] = useState({});
  const [statusPromptShown, setStatusPromptShown] = useState({});
  const [finalizeError, setFinalizeError] = useState('');
  const [finalizeSuccess, setFinalizeSuccess] = useState('');
  const [finalizing, setFinalizing] = useState(false);
  // ✅ After finalizing successfully (or PO already finalized), lock the finalize button to prevent double-submit
  const [finalizedOnce, setFinalizedOnce] = useState(false);

  // ✅ If PO status already finalized (e.g., user revisits the page), lock finalize immediately
  const isPoFinalized = useMemo(() => {
    const status = String(currentOrder?.status || '').toUpperCase();
    return status === 'RECEIVED' || status === 'PARTIALLY_RECEIVED' || status === 'CANCELLED';
  }, [currentOrder?.status]);

  // ✅ UI guardrail: if user saved any line (or has receiptId) but hasn't finalized PO yet,
  // show an in-page warning (no dialog) to prevent forgetting the final "บันทึกใบรับสินค้า" step.
  const shouldShowFinalizeWarning = useMemo(() => {
    const hasReceipt = !!receiptId;
    const hasAnySaved = Object.keys(savedRows || {}).length > 0;

    // If backend already flipped status, no need to warn.
    return (hasReceipt || hasAnySaved) && !isPoFinalized;
  }, [receiptId, savedRows, isPoFinalized]);

  const [isInitialized, setIsInitialized] = useState(false);

  const getErrorMessage = (err) => {
    if (!err) return null;
    if (typeof err === 'string') return err;
    return err?.message || err?.response?.data?.message || 'กรุณาลองใหม่อีกครั้ง';
  };

  // ✅ prefer items passed from page (already normalized)
  // fallback to store currentOrder.items
  const listItems = useMemo(() => {
    const fromProps = Array.isArray(items) ? items : null;
    if (fromProps && fromProps.length) return fromProps;
    const fromStore = Array.isArray(currentOrder?.items) ? currentOrder.items : [];
    return fromStore;
  }, [items, currentOrder?.items]);

  useEffect(() => {
    // ถ้ามี items จาก props แล้ว ไม่ต้อง reload ซ้ำใน component (ลด side-effect)
    if (Array.isArray(items) && items.length) return;

    if (poId) {
      setIsInitialized(false);
      const fn = loadOrderByIdAction || loadOrderById;

      // Defensive: avoid breaking if store export shape changes
      try {
        fn?.(poId);
      } catch (err) {
        console.error('📛 loadOrderById error:', err);
      }
    }
  }, [poId, loadOrderByIdAction, loadOrderById, items]);

  useEffect(() => {
    const initSource = listItems;
    if (Array.isArray(initSource) && initSource.length && !isInitialized) {
      const initQuantities = {};
      const initPrices = {};
      const initTotals = {};

      initSource.forEach((item) => {
        // ✅ UX: default receive qty = remaining quantity (ordered - already received)
        const ordered = Number(item.quantity || 0);
        const received = Number(item.receivedQuantity || 0) + Number(sessionSavedQty[item.id] || 0);
        const qtyToSet = Math.max(ordered - received, 0);
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
  }, [listItems, isInitialized, sessionSavedQty]);

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
    const item = (listItems || []).find((i) => i.id === itemId);
    if (!item || Number.isNaN(num) || num < 0) return;

    const received = Number(item.receivedQuantity || 0);
    const total = num + received;
    const isIncomplete = total < Number(item.quantity || 0);

    // NOTE: keep existing heuristic as-is (minimal disruption)
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

      const payload = {
        quantity: qtyToReceive,
        costPrice: costPriceToReceive,
        purchaseOrderReceiptId: newReceiptId,
        purchaseOrderItemId: item.id,
        // ✅ ส่งเฉพาะตอนที่ user ติ๊ก (ไม่ติ๊ก = behavior เดิม 100%)
        forceAccept: !!forceAccept[item.id],
      };

      await addReceiptItemAction(payload);

      // ✅ remember what we just saved in this session (used for finalize + over-receive guard)
      setSessionSavedQty((prev) => ({ ...prev, [item.id]: qtyToReceive }));

      // ✅ mark saved row
      setSavedRows((prev) => ({ ...prev, [item.id]: true }));
      setEditMode((prev) => ({ ...prev, [item.id]: false }));
      setFinalizeError('');

      // ✅ refresh order to reflect receivedQuantity / status
      const fn = loadOrderByIdAction || loadOrderById;
      try {
        fn?.(poId);
      } catch (err) {
        // ignore refresh failure (do not break UX)
        console.warn('⚠️ reload order after save failed:', err);
      }
    } catch (err) {
      console.error('❌ saveItem error:', err);
      setFinalizeError(getErrorMessage(err) || 'บันทึกรายการไม่สำเร็จ');
    } finally {
      setSaving((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleConfirmFinalize = async () => {
    if (finalizedOnce || isPoFinalized) return; // already finalized (session or DB status)
    // reset UI messages
    setFinalizeError('');
    setFinalizeSuccess('');
    // ✅ IMPORTANT: use listItems as source of truth (supports items passed from page)
    const hasAnyReceiptActivityNow =
      !!receiptId ||
      Object.keys(savedRows || {}).length > 0 ||
      (listItems || []).some((it) => Number(it.receivedQuantity || 0) > 0);

    // Guard: do not allow finalize if no receipt activity at all
    if (!hasAnyReceiptActivityNow) {
      setFinalizeError('ยังไม่มีการบันทึกรับสินค้าในใบนี้');
      return;
    }

    // ✅ Your intent: must confirm/save every line before finalizing (except already fully received lines)
    const allRowsConfirmedNow = (listItems || []).every((it) => {
      const ordered = Number(it.quantity || 0);
      const receivedDb = Number(it.receivedQuantity || 0);
      const isAlreadyFullyReceived = receivedDb >= ordered;
      return isAlreadyFullyReceived || !!savedRows[it.id];
    });

    if (!allRowsConfirmedNow) {
      setFinalizeError('กรุณากดปุ่ม “บันทึก” ให้ครบทุกรายการก่อน แล้วค่อยกด “บันทึกใบรับสินค้า”');
      return;
    }

    // ✅ Calculate status using: DB receivedQuantity + quantities saved in THIS session
    // This prevents "บันทึกใบรับสินค้า" from setting PARTIALLY_RECEIVED just because reload is slow.
    const allDone = (listItems || []).every((it) => {
      const status = itemStatus[it.id];
      if (status === 'done') return true;

      const ordered = Number(it.quantity || 0);
      const receivedDb = Number(it.receivedQuantity || 0);
      const receivedSession = Number(sessionSavedQty[it.id] || 0);
      const receivedTotal = receivedDb + receivedSession;
      return receivedTotal >= ordered;
    });

    const statusToSet = allDone ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
    try {
      setFinalizing(true);
      await updatePurchaseOrderStatusAction({ id: currentOrder.id, status: statusToSet });

      // ✅ lock finalize button immediately (even if refresh fails)
      setFinalizedOnce(true);

      // ✅ Refresh order so FE reflects new status immediately
      const fn = loadOrderByIdAction || loadOrderById;
      try {
        fn?.(poId);
      } catch (e) {
        console.warn('⚠️ reload order after finalize failed:', e);
      }

      setFinalizeSuccess(
        `บันทึกใบรับสินค้าเรียบร้อย (สถานะ: ${statusToSet === 'RECEIVED' ? 'รับครบแล้ว' : 'รับบางส่วน'})`
      );
    } catch (err) {
      console.error('❌ finalize error:', err);
      setFinalizeError(getErrorMessage(err) || 'บันทึกสถานะใบสั่งซื้อไม่สำเร็จ');
    } finally {
      setFinalizing(false);
    }
  };

  if (loading || !isInitialized) return <p>กำลังโหลดรายการสินค้า...</p>;

  if (error && !currentOrder) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
        <div className="font-semibold">โหลดรายการสินค้าไม่สำเร็จ</div>
        <div className="break-words">{getErrorMessage(error)}</div>
      </div>
    );
  }

  // ✅ Compute whether PO is fully received (remaining = 0 for every line) — used to preview the status that will be set on finalize
  const allRemainingZero = (listItems || []).every((it) => {
    const ordered = Number(it.quantity || 0);
    const receivedDb = Number(it.receivedQuantity || 0);
    const receivedSession = Number(sessionSavedQty[it.id] || 0);
    const remaining = Math.max(ordered - (receivedDb + receivedSession), 0);
    return remaining === 0;
  });

  // ✅ Allow finalize whenever there is receipt activity.
  const hasAnyReceiptActivity =
    !!receiptId ||
    Object.keys(savedRows || {}).length > 0 ||
    (listItems || []).some((it) => Number(it.receivedQuantity || 0) > 0);

  const isAnyRowSaving = Object.values(saving || {}).some(Boolean);

  // ✅ New rule: If "รับแล้ว" has any value (>0), treat it as already confirmed.
  // This covers the case where user previously saved items (receivedQuantity updated in DB)
  // even if the current session didn't click "บันทึก" again.
  const allRowsConfirmed = (listItems || []).every((it) => {
    const receivedDb = Number(it.receivedQuantity || 0);
    return receivedDb > 0 || !!savedRows[it.id];
  });

  // ✅ Finalize button must be disabled if PO already finalized in DB
  const canFinalize =
    hasAnyReceiptActivity &&
    allRowsConfirmed &&
    !isAnyRowSaving &&
    !finalizing &&
    !finalizedOnce &&
    !isPoFinalized;

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-lg font-semibold">รายการสินค้าในใบสั่งซื้อ</h2>

      {shouldShowFinalizeWarning && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          <div className="font-semibold">มีการบันทึกรายการแล้ว แต่ยังไม่ได้บันทึกใบรับสินค้า</div>
          <div className="mt-1">
            กรุณากดปุ่ม <span className="font-semibold">“บันทึกใบรับสินค้า”</span> ด้านล่าง เพื่ออัปเดตสถานะใบสั่งซื้อให้ถูกต้อง
          </div>
        </div>
      )}

      {finalizeError && (
        <div className="rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-700">{finalizeError}</div>
      )}

      {(finalizeSuccess || isPoFinalized) && (
        <div className="rounded-md border border-green-300 bg-green-50 p-2 text-sm text-green-800">
          {finalizeSuccess ||
            `บันทึกใบรับสินค้าเรียบร้อย (สถานะ: ${
              String(currentOrder?.status || '').toUpperCase() === 'RECEIVED' ? 'รับครบแล้ว' : 'รับบางส่วน'
            })`}
        </div>
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
              <TableHead className="text-center w-[70px]">รับแล้ว</TableHead>
              <TableHead className="text-center w-[70px]">คงเหลือ</TableHead>
              <TableHead className="text-center w-[100px]">ราคาที่สั่ง</TableHead>
              <TableHead className="text-center w-[100px]">จำนวนที่รับ</TableHead>
              <TableHead className="text-center w-[100px]">ราคาที่รับ</TableHead>
              <TableHead className="text-center w-[100px]">รวม</TableHead>
              <TableHead className="text-center w-[120px]">จัดการ</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {(listItems || []).map((item) => {
              // ✅ defensive hierarchy names (kept, minimal disruption)
              const catName =
                item.categoryName ??
                item.product?.category?.name ??
                item.product?.productType?.category?.name ??
                item.product?.template?.productProfile?.productType?.category?.name ??
                item.product?.productTemplate?.productProfile?.productType?.category?.name ??
                item.category?.name ??
                item.product?.categoryName ??
                '-';

              const typeName =
                item.productTypeName ??
                item.product?.productType?.name ??
                item.product?.productTemplate?.productProfile?.productType?.name ??
                item.productType?.name ??
                item.product?.productTypeName ??
                '-';

              const brandName =
                item.brandName ??
                item.product?.brand?.name ??
                item.product?.productProfile?.brand?.name ??
                item.product?.template?.brand?.name ??
                item.product?.template?.productProfile?.brand?.name ??
                item.product?.productTemplate?.productProfile?.brand?.name ??
                item.brand?.name ??
                item.product?.brandName ??
                '-';

              const profileName =
                item.profileName ??
                item.product?.productProfile?.name ??
                item.product?.template?.productProfile?.name ??
                item.productProfile?.name ??
                item.product?.productProfileName ??
                '-';

              const templateName =
                item.templateName ??
                item.product?.template?.name ??
                item.product?.productTemplate?.name ??
                item.template?.name ??
                item.productTemplate?.name ??
                item.productTemplateName ??
                '-';

              const productName =
                item.productName ??
                item.product?.name ??
                item.product?.template?.name ??
                item.product?.productTemplate?.name ??
                item.name ??
                '-';

              const received = Number(item.receivedQuantity || 0);
              const qtyOrdered = Number(item.quantity || 0);

              const quantity = receiptQuantities[item.id] ?? '';
              const price = receiptPrices[item.id] ?? '';
              const total = Number(receiptTotals[item.id] ?? 0);

              const isSaved = !!savedRows[item.id];
              const isEditing = !!editMode[item.id];
              // ✅ Production UX: if DB already has received (>0), treat as confirmed → button becomes “แก้ไข”
              const isConfirmed = received > 0 || isSaved;
              const canEdit = isEditing || !isConfirmed;

              const qtyToReceive = Number(quantity === '' ? 0 : quantity);
              const qtyForValidate = canEdit ? qtyToReceive : 0;

              const receivedSession = Number(sessionSavedQty[item.id] || 0);
              const remaining = Math.max(qtyOrdered - (received + receivedSession), 0);
              const isFullyReceived = remaining <= 0;

              const nextTotalReceived = received + receivedSession + qtyForValidate;
              const isOver = canEdit && nextTotalReceived > qtyOrdered;
              const showStatusPrompt = canEdit && !!statusPromptShown[item.id];
              const isStatusSelected = itemStatus[item.id] === 'done' || itemStatus[item.id] === 'pending';

              const disableSave =
                !!saving[item.id] ||
                isFullyReceived ||
                quantity === '' ||
                (showStatusPrompt && !isStatusSelected) ||
                (isOver && !forceAccept[item.id]);

              return (
                <TableRow key={item.id}>
                  <TableCell>{catName}</TableCell>
                  <TableCell>{typeName}</TableCell>
                  <TableCell>{brandName}</TableCell>
                  <TableCell>{profileName}</TableCell>
                  <TableCell>{templateName}</TableCell>
                  <TableCell>{productName}</TableCell>

                  <TableCell className="text-center px-2 py-1">{qtyOrdered}</TableCell>
                  <TableCell className="text-center px-2 py-1">{received}</TableCell>
                  <TableCell className="text-center px-2 py-1">{remaining}</TableCell>
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
                      disabled={!canEdit || isFullyReceived}
                    />

                    {isOver && !isFullyReceived && (
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

                    {showStatusPrompt && !isFullyReceived && (
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
                      disabled={!canEdit || isFullyReceived}
                    />
                  </TableCell>

                  <TableCell className="text-right px-2 py-1">{total.toFixed(2)}</TableCell>

                  <TableCell className="text-center px-2 py-1">
                    <div className="flex items-center justify-center gap-2">
                      {!isConfirmed || isEditing ? (
                        <button
                          type="button"
                          className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                          onClick={() => handleSaveItem(item)}
                          disabled={disableSave}
                        >
                          {saving[item.id] ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="px-3 py-1 rounded border"
                          onClick={() => setEditMode((prev) => ({ ...prev, [item.id]: true }))}
                          disabled={isFullyReceived}
                        >
                          แก้ไข
                        </button>
                      )}

                      {isEditing && (
                        <button
                          type="button"
                          className="px-3 py-1 rounded border"
                          onClick={() => setEditMode((prev) => ({ ...prev, [item.id]: false }))}
                        >
                          ยกเลิก
                        </button>
                      )}

                      {isConfirmed && <span className="text-xs text-green-700">ยืนยันแล้ว</span>}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Finalize section (outside table) */}
      <div className="flex items-center justify-end gap-4">
        <div className="text-sm text-right">
          <div className="text-gray-700">
            เงื่อนไข: รายการที่มี <span className="font-semibold">รับแล้ว</span> (&gt; 0) จะถือว่าเคยยืนยันแล้ว
          </div>
          <div className="mt-1 text-xs text-gray-600">
            เมื่อกดบันทึก ระบบจะตั้งสถานะเป็น{' '}
            <span className="font-semibold">{allRemainingZero ? 'รับครบแล้ว' : 'รับบางส่วน'}</span>
          </div>
          {!allRowsConfirmed && (
            <div className="mt-1 text-xs text-amber-700">
              ยังมีบางรายการที่ <span className="font-semibold">รับแล้ว = 0</span> และยังไม่ได้กด “บันทึก”
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleConfirmFinalize}
          disabled={!canFinalize}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {finalizing ? 'กำลังบันทึก...' : finalizedOnce || isPoFinalized ? 'บันทึกแล้ว' : 'บันทึกใบรับสินค้า'}
        </button>
      </div>
    </div>
  );
};

export default POItemListForReceipt;







