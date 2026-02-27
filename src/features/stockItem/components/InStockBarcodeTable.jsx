// ✅ InStockBarcodeTable.jsx — รับ props.items และ fallback ไปที่ store
// Standard: No dialog confirm/alert. ใช้ UI-based inline confirm เท่านั้น

import React, { useMemo, useState } from 'react';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const safeText = (v) => {
  if (v == null) return '';
  return String(v);
};

const getErrMsg = (err, fallback) => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;
};

const InStockBarcodeTable = ({ items }) => {
  const { barcodes, loadBarcodesAction, deleteSerialNumberAction, updateSerialNumberAction } = useBarcodeStore();

  // ใช้ props.items ถ้ามี ไม่งั้น fallback ไปที่ store
  const source = Array.isArray(items) ? items : barcodes;

  // ✅ รองรับทั้งกรณีมี stockItemId (scalar) และ stockItem (object)
  const isScanned = (b) => b?.stockItemId != null || b?.stockItem?.id != null;

  const scannedList = useMemo(() => (Array.isArray(source) ? source : []).filter(isScanned), [source]);

  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [workingBarcode, setWorkingBarcode] = useState('');

  // inline edit
  const [editBarcode, setEditBarcode] = useState('');
  const [newSN, setNewSN] = useState('');

  // inline delete confirm
  const [confirmDeleteBarcode, setConfirmDeleteBarcode] = useState('');

  const findReceiptIdByBarcode = (barcode) => {
    const list = Array.isArray(source) ? source : [];
    const item = list.find((b) => b?.barcode === barcode) || (Array.isArray(barcodes) ? barcodes.find((b) => b?.barcode === barcode) : null);

    return (
      item?.receiptId ||
      item?.purchaseOrderReceiptId ||
      item?.receiptItem?.receiptId ||
      item?.purchaseOrderReceiptItem?.receiptId ||
      item?.stockItem?.purchaseOrderReceiptItem?.receiptId ||
      item?.stockItem?.purchaseOrderReceiptId ||
      null
    );
  };

  const refreshByBarcode = async (barcode) => {
    const receiptId = findReceiptIdByBarcode(barcode);
    if (receiptId) {
      await loadBarcodesAction(receiptId);
    }
  };

  const onAskDelete = (barcode) => {
    setErrorMessage('');
    setConfirmDeleteBarcode(barcode);
    // ถ้ามีโหมดแก้ไขอยู่ให้ปิดก่อนเพื่อกันสับสน
    if (editBarcode) {
      setEditBarcode('');
      setNewSN('');
    }
  };

  const onConfirmDelete = async () => {
    const barcode = confirmDeleteBarcode;
    if (!barcode) return;

    setWorkingBarcode(barcode);
    setErrorMessage('');

    try {
      await deleteSerialNumberAction(barcode);
      await refreshByBarcode(barcode);
    } catch (err) {
      const msg = getErrMsg(err, 'ไม่สามารถลบ SN ได้');
      setErrorMessage(`เกิดข้อผิดพลาด: ${msg}`);
    } finally {
      setWorkingBarcode('');
      setConfirmDeleteBarcode('');
    }
  };

  const onAskEdit = (barcode, currentSN) => {
    setErrorMessage('');
    setEditBarcode(barcode);
    setNewSN(safeText(currentSN));
    // ถ้ามี confirm delete อยู่ให้ปิดก่อน
    if (confirmDeleteBarcode) setConfirmDeleteBarcode('');
  };

  const onCancelEdit = () => {
    setEditBarcode('');
    setNewSN('');
  };

  const onSaveEdit = async () => {
    const barcode = editBarcode;
    if (!barcode) return;

    const nextSN = newSN.trim();
    if (!nextSN) {
      setErrorMessage('กรุณากรอก SN ก่อนบันทึก');
      return;
    }

    setWorkingBarcode(barcode);
    setErrorMessage('');

    try {
      await updateSerialNumberAction(barcode, nextSN);
      await refreshByBarcode(barcode);
      setEditBarcode('');
      setNewSN('');
    } catch (err) {
      const msg = getErrMsg(err, 'ไม่สามารถบันทึก SN ได้');
      if (String(msg).includes('SN นี้ถูกใช้ไปแล้ว')) {
        setErrorMessage('❌ SN นี้ถูกใช้ไปแล้วในสินค้ารายการอื่น กรุณาตรวจสอบอีกครั้ง');
      } else {
        setErrorMessage(`เกิดข้อผิดพลาด: ${msg}`);
        console.error('[onSaveEdit] error:', err);
      }
    } finally {
      setWorkingBarcode('');
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      {errorMessage && (
        <div
          key={errorMessage}
          className="bg-rose-50 text-rose-700 px-4 py-2 text-sm border-b border-rose-200"
        >
          {errorMessage}
        </div>
      )}

      <table className="min-w-full text-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">สินค้า</th>
            <th className="px-4 py-2 text-left">บาร์โค้ด</th>
            <th className="px-4 py-2 text-left">SN</th>
            <th className="px-4 py-2 text-left">สถานะ</th>
            <th className="px-4 py-2 text-left">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {scannedList.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center p-4 text-gray-500">
                ยังไม่มีสินค้าที่ถูกยิง
              </td>
            </tr>
          ) : (
            scannedList.map((item, index) => {
              const barcode = safeText(item?.barcode);
              const currentSN = item?.serialNumber ?? item?.stockItem?.serialNumber ?? '';
              const isWorking = workingBarcode === barcode;
              const isEditing = editBarcode === barcode;
              const isDeleteConfirm = confirmDeleteBarcode === barcode;

              return (
                <React.Fragment key={barcode + safeText(currentSN)}>
                  <tr className="border-t hover:bg-green-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{item.productName ?? item.stockItem?.productName ?? '-'}</td>
                    <td className="px-4 py-2 font-mono text-green-700">{barcode || '-'}</td>
                    <td className="px-4 py-2 font-mono text-gray-700">{safeText(currentSN) || '-'}</td>
                    <td className="px-4 py-2 text-green-600">{isScanned(item) ? '✅ พร้อมขาย' : '-'}</td>
                    <td className="px-4 py-2 space-x-3">
                      <button
                        type="button"
                        onClick={() => onAskDelete(barcode)}
                        className="text-rose-700 underline hover:text-rose-900"
                        disabled={!barcode || isWorking}
                      >
                        ลบ SN
                      </button>
                      <button
                        type="button"
                        onClick={() => onAskEdit(barcode, currentSN)}
                        className="text-blue-700 underline hover:text-blue-900"
                        disabled={!barcode || isWorking}
                      >
                        เพิ่ม/แก้ไข SN
                      </button>
                    </td>
                  </tr>

                  {/* Inline delete confirm (no dialog) */}
                  {isDeleteConfirm && (
                    <tr className="border-t bg-white">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm flex flex-wrap items-center justify-between gap-2">
                          <div>
                            ยืนยันลบ SN ของบาร์โค้ด <span className="font-mono font-semibold">{barcode}</span> ?
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteBarcode('')}
                              className="px-3 py-1 rounded border bg-white hover:bg-gray-50"
                              disabled={isWorking}
                            >
                              ยกเลิก
                            </button>
                            <button
                              type="button"
                              onClick={onConfirmDelete}
                              className="px-3 py-1 rounded bg-rose-700 text-white hover:bg-rose-800"
                              disabled={isWorking}
                            >
                              {isWorking ? 'กำลังลบ...' : 'ยืนยันลบ'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Inline edit SN (no dialog) */}
                  {isEditing && (
                    <tr className="border-t bg-white">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                          <div className="text-sm font-semibold">เพิ่ม/แก้ไข SN</div>
                          <div className="text-xs text-gray-600 mt-1">
                            บาร์โค้ด: <span className="font-mono">{barcode}</span> • * SN ต้องไม่ซ้ำกับสินค้าอื่นในระบบ
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <input
                              className="border rounded px-3 py-2 w-[320px] max-w-full font-mono"
                              placeholder="ระบุ SN ..."
                              value={newSN}
                              onChange={(e) => setNewSN(e.target.value)}
                              disabled={isWorking}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  onSaveEdit();
                                }
                                if (e.key === 'Escape') {
                                  e.preventDefault();
                                  onCancelEdit();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={onCancelEdit}
                              className="px-3 py-2 rounded border bg-white hover:bg-gray-50"
                              disabled={isWorking}
                            >
                              ยกเลิก
                            </button>
                            <button
                              type="button"
                              onClick={onSaveEdit}
                              className="px-3 py-2 rounded bg-blue-700 text-white hover:bg-blue-800"
                              disabled={isWorking}
                            >
                              {isWorking ? 'กำลังบันทึก...' : 'บันทึก'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InStockBarcodeTable;


