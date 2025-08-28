
// ✅ InStockBarcodeTable.jsx — รับ props.items และ fallback ไปที่ store
import React, { useMemo, useState } from 'react';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import ConfirmActionDialog from '@/components/shared/dialogs/ConfirmActionDialog';

const InStockBarcodeTable = ({ items }) => {
  const { barcodes, loadBarcodesAction, deleteSerialNumberAction, updateSerialNumberAction } = useBarcodeStore();
  const [openDelete, setOpenDelete] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [targetBarcode, setTargetBarcode] = useState('');
  const [newSN, setNewSN] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ใช้ props.items ถ้ามี ไม่งั้น fallback ไปที่ store
  const source = Array.isArray(items) ? items : barcodes;

  // ✅ รองรับทั้งกรณีมี stockItemId (scalar) และ stockItem (object)
  const isScanned = (b) => b?.stockItemId != null || b?.stockItem?.id != null;

  const scannedList = useMemo(
    () => (source || []).filter(isScanned),
    [source]
  );

  const refreshByBarcode = (barcode) => {
    const item = barcodes.find((b) => b.barcode === barcode);
    const receiptId =
      item?.receiptId ||
      item?.receiptItem?.receiptId ||
      item?.stockItem?.purchaseOrderReceiptItem?.receiptId;
    if (receiptId) loadBarcodesAction(receiptId);
  };

  const onAskDelete = (barcode) => {
    setTargetBarcode(barcode);
    setOpenDelete(true);
  };

  const onConfirmDelete = async () => {
    try {
      await deleteSerialNumberAction(targetBarcode);
      refreshByBarcode(targetBarcode);
      setErrorMessage('');
    } catch (err) {
      const msg = err?.response?.data?.error?.toString?.() || 'ไม่สามารถลบ SN ได้';
      setErrorMessage(`เกิดข้อผิดพลาด: ${msg}`);
    } finally {
      setOpenDelete(false);
      setTargetBarcode('');
    }
  };

  const onAskAdd = (barcode, currentSN) => {
    setTargetBarcode(barcode);
    setNewSN(currentSN || '');
    setOpenAdd(true);
  };

  const onConfirmAdd = async () => {
    if (!newSN.trim()) {
      setErrorMessage('กรุณากรอก SN ก่อนบันทึก');
      return;
    }
    try {
      await updateSerialNumberAction(targetBarcode, newSN.trim());
      refreshByBarcode(targetBarcode);
      setErrorMessage('');
    } catch (err) {
      const error = err?.response?.data?.error;
      const msg = error?.toString?.() || 'ไม่สามารถบันทึก SN ได้';
      if (msg.includes('SN นี้ถูกใช้ไปแล้ว')) {
        setErrorMessage('❌ SN นี้ถูกใช้ไปแล้วในสินค้ารายการอื่น กรุณาตรวจสอบอีกครั้ง');
      } else {
        setErrorMessage(`เกิดข้อผิดพลาด: ${msg}`);
        console.error('[onConfirmAdd] error:', err);
      }
    } finally {
      setOpenAdd(false);
      setTargetBarcode('');
      setNewSN('');
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      {errorMessage && (
        <div key={errorMessage} className="bg-red-100 text-red-700 px-4 py-2 text-sm border-b border-red-300">
          {errorMessage}
        </div>
      )}

      {/* Delete dialog */}
      <ConfirmActionDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="ยืนยันการลบ SN"
        description={`คุณต้องการลบ SN ของบาร์โค้ด ${targetBarcode} ใช่หรือไม่?`}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onConfirm={onConfirmDelete}
      />

      {/* Add/Edit SN dialog */}
      <ConfirmActionDialog
        open={openAdd}
        onOpenChange={setOpenAdd}
        title="เพิ่ม/แก้ไข SN"
        description={`กรอก SN สำหรับบาร์โค้ด ${targetBarcode}`}
        confirmText="บันทึก"
        cancelText="ยกเลิก"
        onConfirm={onConfirmAdd}
      >
        <div className="pt-2">
          <input
            className="border rounded px-3 py-2 w-full font-mono"
            placeholder="ระบุ SN ..."
            value={newSN}
            onChange={(e) => setNewSN(e.target.value)}
          />
          <div className="text-xs text-gray-500 mt-1">* SN ต้องไม่ซ้ำกับสินค้าอื่นในระบบ</div>
        </div>
      </ConfirmActionDialog>

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
              <td colSpan={6} className="text-center p-4 text-gray-500">ยังไม่มีสินค้าที่ถูกยิง</td>
            </tr>
          ) : (
            scannedList.map((item, index) => (
              <tr
                key={item.barcode + (item.serialNumber || item.stockItem?.serialNumber || '')}
                className="border-t hover:bg-green-50"
              >
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.productName ?? item.stockItem?.productName ?? '-'}</td>
                <td className="px-4 py-2 font-mono text-green-700">{item.barcode || '-'}</td>
                <td className="px-4 py-2 font-mono text-gray-700">
                  {item.serialNumber ?? item.stockItem?.serialNumber ?? '-'}
                </td>
                <td className="px-4 py-2 text-green-600">
                  {isScanned(item) ? '✅ พร้อมขาย' : '-'}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => onAskDelete(item.barcode)}
                    className="text-red-600 underline hover:text-red-800"
                  >
                    ลบ SN
                  </button>
                  <button
                    onClick={() =>
                      onAskAdd(item.barcode, item.serialNumber ?? item.stockItem?.serialNumber)
                    }
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    เพิ่ม/แก้ไข SN
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InStockBarcodeTable;

