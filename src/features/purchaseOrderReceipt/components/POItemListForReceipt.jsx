// src/features/purchaseOrderReceipt/components/POItemListForReceipt.jsx

import React, { useEffect, useMemo, useState } from 'react';
import usePurchaseOrderReceiptStore from '../store/purchaseOrderReceiptStore';
import { Save, Edit2, X, CheckCircle2, AlertTriangle, AlertCircle, ShoppingCart, Percent, Layers, Landmark } from 'lucide-react';

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
  const [sessionSavedQty, setSessionSavedQty] = useState({});
  const [forceAccept, setForceAccept] = useState({});
  const [itemStatus, setItemStatus] = useState({});
  const [statusPromptShown, setStatusPromptShown] = useState({});
  const [finalizeError, setFinalizeError] = useState('');
  const [finalizeSuccess, setFinalizeSuccess] = useState('');
  const [finalizing, setFinalizing] = useState(false);
  const [finalizedOnce, setFinalizedOnce] = useState(false);

  const isPoFinalized = useMemo(() => {
    const status = String(currentOrder?.status || '').toUpperCase();
    return status === 'RECEIVED' || status === 'PARTIALLY_RECEIVED' || status === 'CANCELLED';
  }, [currentOrder?.status]);

  const shouldShowFinalizeWarning = useMemo(() => {
    const hasReceipt = !!receiptId;
    const hasAnySaved = Object.keys(savedRows || {}).length > 0;
    return (hasReceipt || hasAnySaved) && !isPoFinalized;
  }, [receiptId, savedRows, isPoFinalized]);

  const [isInitialized, setIsInitialized] = useState(false);

  const getErrorMessage = (err) => {
    if (!err) return null;
    if (typeof err === 'string') return err;
    return err?.message || err?.response?.data?.message || 'กรุณาลองใหม่อีกครั้ง';
  };

  const listItems = useMemo(() => {
    const fromProps = Array.isArray(items) ? items : null;
    if (fromProps && fromProps.length) return fromProps;
    const fromStore = Array.isArray(currentOrder?.items) ? currentOrder.items : [];
    return fromStore;
  }, [items, currentOrder?.items]);

  useEffect(() => {
    if (Array.isArray(items) && items.length) return;
    if (poId) {
      setIsInitialized(false);
      const fn = loadOrderByIdAction || loadOrderById;
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
    setReceiptTotals((prev) => ({ ...prev, [itemId]: q * c }));
  };

  const handleQuantityChange = (itemId, value) => {
    const num = Number(value);
    const item = (listItems || []).find((i) => i.id === itemId);
    if (!item || Number.isNaN(num) || num < 0) return;

    const received = Number(item.receivedQuantity || 0);
    const total = num + received;
    const isIncomplete = total < Number(item.quantity || 0);
    
    const shouldWarn = Number(item.quantity || 0) > 10 && value.toString().startsWith('1');

    setReceiptQuantities((prev) => ({ ...prev, [itemId]: num }));
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

    setReceiptPrices((prev) => ({ ...prev, [itemId]: costPrice }));
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
        forceAccept: !!forceAccept[item.id],
      };

      await addReceiptItemAction(payload);
      setSessionSavedQty((prev) => ({ ...prev, [item.id]: qtyToReceive }));
      setSavedRows((prev) => ({ ...prev, [item.id]: true }));
      setEditMode((prev) => ({ ...prev, [item.id]: false }));
      setFinalizeError('');

      const fn = loadOrderByIdAction || loadOrderById;
      try { fn?.(poId); } catch (err) { console.warn('⚠️ reload error:', err); }
    } catch (err) {
      console.error('❌ saveItem error:', err);
      setFinalizeError(getErrorMessage(err) || 'บันทึกรายการไม่สำเร็จ');
    } finally {
      setSaving((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleConfirmFinalize = async () => {
    if (finalizedOnce || isPoFinalized) return;
    setFinalizeError('');
    setFinalizeSuccess('');

    const hasAnyReceiptActivityNow =
      !!receiptId ||
      Object.keys(savedRows || {}).length > 0 ||
      (listItems || []).some((it) => Number(it.receivedQuantity || 0) > 0);

    if (!hasAnyReceiptActivityNow) {
      setFinalizeError('ยังไม่มีการบันทึกรับสินค้าในใบนี้');
      return;
    }

    const allRowsConfirmedNow = (listItems || []).every((it) => {
      const ordered = Number(it.quantity || 0);
      const receivedDb = Number(it.receivedQuantity || 0);
      return receivedDb >= ordered || !!savedRows[it.id];
    });

    if (!allRowsConfirmedNow) {
      setFinalizeError('กรุณากดปุ่ม “บันทึก” ให้ครบทุกรายการก่อน แล้วค่อยกด “บันทึกใบรับสินค้า”');
      return;
    }

    const allDone = (listItems || []).every((it) => {
      if (itemStatus[it.id] === 'done') return true;
      const ordered = Number(it.quantity || 0);
      const receivedDb = Number(it.receivedQuantity || 0);
      const receivedSession = Number(sessionSavedQty[it.id] || 0);
      return (receivedDb + receivedSession) >= ordered;
    });

    const statusToSet = allDone ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
    try {
      setFinalizing(true);
      await updatePurchaseOrderStatusAction({ id: currentOrder.id, status: statusToSet });
      setFinalizedOnce(true);

      const fn = loadOrderByIdAction || loadOrderById;
      try { fn?.(poId); } catch (e) { console.warn('⚠️ reload failed:', e); }

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

  if (loading || !isInitialized) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-slate-400 font-bold select-none">
        <span className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span>กำลังถอดรหัสและเรนเดอร์โครงสร้างรายการสินค้า...</span>
      </div>
    );
  }

  if (error && !currentOrder) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-xs font-black text-rose-600 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-rose-500" />
        <span>โหลดรายการสินค้าไม่สำเร็จ: {getErrorMessage(error)}</span>
      </div>
    );
  }

  const allRemainingZero = (listItems || []).every((it) => {
    const ordered = Number(it.quantity || 0);
    const receivedDb = Number(it.receivedQuantity || 0);
    const receivedSession = Number(sessionSavedQty[it.id] || 0);
    return Math.max(ordered - (receivedDb + receivedSession), 0) === 0;
  });

  const allRowsConfirmed = (listItems || []).every((it) => Number(it.receivedQuantity || 0) > 0 || !!savedRows[it.id]);
  
  const hasAnyReceiptActivity =
    !!receiptId ||
    Object.keys(savedRows || {}).length > 0 ||
    (listItems || []).some((it) => Number(it.receivedQuantity || 0) > 0);

  const isAnyRowSaving = Object.values(saving || {}).some(Boolean);
  const canFinalize = hasAnyReceiptActivity && allRowsConfirmed && !isAnyRowSaving && !finalizing && !finalizedOnce && !isPoFinalized;

  return (
    <div className="space-y-4 w-full select-none animate-fadeIn">
      
      <div className="flex items-center justify-between px-2 pt-2">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <ShoppingCart className="w-4 h-4 text-slate-400" /> รายการสินค้าประจำใบตรวจรับสินค้า
        </h2>
      </div>

      {shouldShowFinalizeWarning && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4 text-xs font-bold text-amber-800 flex items-start gap-2.5 shadow-sm animate-slideUp">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-amber-950">ตรวจพบการบันทึกไอเทมแถวย่อยค้างอยู่!</div>
            <div className="opacity-90 mt-0.5 leading-relaxed">กรุณาเลื่อนลงไปด้านล่างสุดเพื่อกดปุ่ม <span className="font-black text-orange-600 underline">“บันทึกใบรับสินค้า”</span> เพื่อส่งสัญญาณอัปเดตสเตตัสเข้าฐานข้อมูลส่วนกลางให้เสร็จสมบูรณ์</div>
          </div>
        </div>
      )}

      {finalizeError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-xs font-black text-rose-600 flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-500" /> {finalizeError}
        </div>
      )}

      {(finalizeSuccess || isPoFinalized) && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50 p-3 text-xs font-black text-emerald-700 flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            {finalizeSuccess ||
              `บันทึกใบรับสินค้าพัสดุเรียบร้อยแล้ว (สถานะใน Store: ${
                String(currentOrder?.status || '').toUpperCase() === 'RECEIVED' ? 'ตรวจรับของครบถ้วน' : 'รับสินค้าไว้บางส่วน'
              })`}
          </span>
        </div>
      )}

      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-[11px] font-black uppercase tracking-wider select-none">
                <th className="p-3 w-32 text-center">หมวดหมู่</th>
                <th className="p-3 w-28 text-center">ประเภท</th>
                <th className="p-3 w-28 text-center">แบรนด์</th>
                <th className="p-3 w-24 text-center">โปรไฟล์</th>
                <th className="p-3 w-24 text-center">เทมเพลต</th>
                <th className="p-3 w-44"><Layers className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> ชื่อสินค้าพัสดุ</th>
                <th className="p-3 w-16 text-center">จำนวนสั่ง</th>
                <th className="p-3 w-16 text-center bg-slate-100/50">รับแล้ว</th>
                <th className="p-3 w-16 text-center text-orange-600">คงเหลือ</th>
                <th className="p-3 w-20 text-right"><Percent className="w-3 h-3 inline mr-0.5" /> ราคาที่สั่ง</th>
                <th className="p-3 w-24 text-center bg-orange-500/5 text-orange-700">จำนวนรับจริง</th>
                <th className="p-3 w-24 text-center bg-orange-500/5 text-orange-700">ราคาที่รับจริง</th>
                <th className="p-3 w-24 text-right text-slate-900 font-black"><Landmark className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> ยอดรวม</th>
                <th className="p-3 w-24 text-center">จัดการแถว</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {(listItems || []).map((item) => {
                const catName =
                  item.categoryName ??
                  item.product?.categoryName ??
                  item.product?.productType?.globalProductType?.category?.name ??
                  '-';
                const typeName = item.productTypeName ?? item.product?.productTypeName ?? item.product?.productType?.name ?? '-';
                const brandName = item.brandName ?? item.product?.brandName ?? item.product?.brand?.name ?? '-';
                const profileName = item.profileName ?? item.product?.productProfileName ?? '-';
                const templateName =
                  item.templateName ??
                  item.product?.templateName ??
                  item.product?.templateProduct?.name ??
                  '-';
                const productName = item.productName ?? item.product?.name ?? item.name ?? '-';

                const received = Number(item.receivedQuantity || 0);
                const qtyOrdered = Number(item.quantity || 0);

                const quantity = receiptQuantities[item.id] ?? '';
                const price = receiptPrices[item.id] ?? '';
                const total = Number(receiptTotals[item.id] ?? 0);

                const isSaved = !!savedRows[item.id];
                const isEditing = !!editMode[item.id];
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

                const disableSave = !!saving[item.id] || isFullyReceived || quantity === '' || (showStatusPrompt && !isStatusSelected) || (isOver && !forceAccept[item.id]);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                    <td className="p-3 text-slate-400 font-semibold text-center truncate max-w-[120px]">{catName}</td>
                    <td className="p-3 text-slate-400 text-center truncate max-w-[110px]">{typeName}</td>
                    <td className="p-3 text-slate-500 font-bold text-center truncate max-w-[110px]">{brandName}</td>
                    <td className="p-3 text-slate-400 text-center truncate max-w-[100px]">{profileName}</td>
                    <td className="p-3 text-slate-400 text-center truncate max-w-[100px]">{templateName}</td>
                    <td className="p-3 font-black text-slate-900 group-hover:text-orange-500 transition-colors truncate max-w-[160px]" title={productName}>{productName}</td>

                    <td className="p-3 text-center font-bold font-mono text-slate-500">{qtyOrdered}</td>
                    <td className="p-3 text-center font-bold font-mono bg-slate-50/60 text-slate-600">{received}</td>
                    <td className="p-3 text-center font-black font-mono text-orange-600 bg-orange-500/[0.02]">{remaining}</td>
                    <td className="p-3 text-right font-semibold font-sans text-slate-500">฿{Number(item.costPrice || 0).toLocaleString()}</td>

                    <td className="p-3 bg-orange-500/[0.01]">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          className="w-16 h-8 text-right font-black font-sans border border-slate-200 rounded-lg px-2 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          onFocus={() => handleFocusQuantity(item.id)}
                          onBlur={() => handleBlurQuantity(item.id)}
                          disabled={!canEdit || isFullyReceived}
                        />

                        {isOver && !isFullyReceived && (
                          <label className="inline-flex items-center text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200/40 px-1.5 py-0.5 rounded mt-1 select-none animate-fadeIn cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!forceAccept[item.id]}
                              onChange={(e) => setForceAccept((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                              className="mr-1 accent-rose-600"
                            />
                            ยืนยันรับเกินบิล
                          </label>
                        )}

                        {showStatusPrompt && !isFullyReceived && (
                          <div className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200/40 p-1.5 rounded-lg mt-1 space-y-1 select-none animate-fadeIn">
                            <label className="flex items-center cursor-pointer">
                              <input type="radio" name={`itemStatus-${item.id}`} checked={itemStatus[item.id] === 'done'} onChange={() => setItemStatus((prev) => ({ ...prev, [item.id]: 'done' }))} className="mr-1 accent-amber-600" />
                              ยืนยันตัดยอดเท่านี้
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input type="radio" name={`itemStatus-${item.id}`} checked={itemStatus[item.id] === 'pending'} onChange={() => setItemStatus((prev) => ({ ...prev, [item.id]: 'pending' }))} className="mr-1 accent-amber-600" />
                              ออกค้างคิวส่งของเพิ่ม
                            </label>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-3 bg-orange-500/[0.01]">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-20 h-8 text-right font-bold font-sans border border-slate-200 rounded-lg px-2 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50"
                        value={price === 0 ? '' : price}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        disabled={!canEdit || isFullyReceived}
                      />
                    </td>

                    <td className="p-3 text-right font-black font-sans text-slate-900 text-sm">
                      ฿{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 transform scale-95 origin-center select-none">
                        {!isConfirmed || isEditing ? (
                          <button
                            type="button"
                            onClick={() => handleSaveItem(item)}
                            disabled={disableSave}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs border border-slate-900 rounded-xl shadow-sm transform active:scale-95 transition-all disabled:opacity-40 disabled:transform-none select-none shrink-0"
                          >
                            <Save className="w-3 h-3 text-slate-300" />
                            <span>{saving[item.id] ? 'บันทึก...' : 'บันทึก'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditMode((prev) => ({ ...prev, [item.id]: true }))}
                            disabled={isFullyReceived}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200/60 rounded-xl transform active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:transform-none shrink-0"
                          >
                            <Edit2 className="w-3 h-3 text-slate-400" />
                            <span>แก้ไข</span>
                          </button>
                        )}

                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => setEditMode((prev) => ({ ...prev, [item.id]: false }))}
                            className="h-7 w-7 inline-flex items-center justify-center bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl text-rose-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isConfirmed && (
                          <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-500/10 px-2 py-1 rounded-md select-none shrink-0 flex items-center gap-0.5 animate-fadeIn">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ยืนยันแล้ว
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div className="text-left space-y-0.5 font-bold text-xs text-slate-500">
          <div className="flex items-center gap-1 text-slate-700 font-black"><AlertCircle className="w-3.5 h-3.5 text-slate-400" /> เงื่อนไขกฎเหล็กคลัง:</div>
          <div className="opacity-90 pl-4">ระบบจะคัดกรองแถวที่มีค่า <span className="font-black text-slate-800">"รับแล้ว (&gt; 0)"</span> ถือว่าผ่านสิทธิ์การตรวจสอบความสมดุลเอกสาร</div>
          <div className="opacity-90 pl-4 mt-0.5">
            เมื่อกดส่งสัญญานบันทึกภาพบิล ระบบจะทำการอัปเดตสเตตัสกลางเป็น:{' '}
            <span className="font-black text-orange-600 px-1.5 py-0.5 bg-orange-50 rounded-md text-xs font-sans ml-0.5 shadow-inner">{allRemainingZero ? 'RECEIVED (รับครบแล้ว)' : 'PARTIALLY_RECEIVED (รับบางส่วน)'}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={!canFinalize}
          onClick={handleConfirmFinalize}
          className={`flex items-center justify-center gap-1.5 px-5 h-11 text-xs sm:text-sm font-black rounded-xl border border-orange-400/10 shadow-sm transform active:scale-95 transition-all duration-300 shrink-0 self-start md:self-auto ${
            !canFinalize
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-[0_4px_15px_rgba(249,115,22,0.2)] hover:-translate-y-0.5'
          }`}
        >
          {finalizing ? (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-orange-100" />
          )}
          <span>{finalizing ? 'กำลังบันทึก...' : finalizedOnce || isPoFinalized ? 'บันทึกสำเร็จแล้ว' : 'บันทึกใบรับสินค้าประจำสาขา'}</span>
        </button>
      </div>

    </div>
  );
};

export default POItemListForReceipt;