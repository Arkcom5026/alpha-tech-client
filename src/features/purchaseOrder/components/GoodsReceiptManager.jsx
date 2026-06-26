import React, { useEffect, useState } from 'react';
import { useGoodsReceiptStore } from '../store/goodsReceiptStore';
import { useProcurementScanner } from '../hooks/useProcurementScanner';
import { receiptPrismaAdapter } from '../adapters/receiptPrismaAdapter';
import { goodsReceiptService } from '../services/goodsReceiptService';

export const GoodsReceiptManager = ({ purchaseOrderId }) => {
  const {
    receivedItems,
    initializeReceipt,
    addBarcodeItem,
    addSerialNumber,
    isReceiptValid,
    errorMsg,
  } = useGoodsReceiptStore();

  const [activeSerialProduct, setActiveSerialProduct] = useState(null); // ควบคุมเปิดปิด Serial Modal

  // เรียกใช้หน่วยยิงสแกนบาร์โค้ด และส่งข้อมูลไปยัง Store เพื่อตรวจสอบประเภทสินค้า
  const { inputRef, focusScanner } = useProcurementScanner((barcode) => {
    if (activeSerialProduct) {
      // หากอยู่ในโหมดสแกน Serial Number รายชิ้น
      addSerialNumber(activeSerialProduct.productId, barcode);
    } else {
      // สแกนเพิ่มตัวสินค้าเข้าไปในตารางรับของเข้าคลังปกติ
      addBarcodeItem(barcode);
    }
  });

  useEffect(() => {
    initializeReceipt(purchaseOrderId);
    focusScanner(); // บังคับโฟกัสเมื่อหน้าจอโหลดสำเร็จ
  }, [purchaseOrderId]);

  const handleSubmit = async () => {
    if (!isReceiptValid) return;

    try {
      const state = useGoodsReceiptStore.getState();
      const prismaDTO = receiptPrismaAdapter.transform(state.receivedItems, purchaseOrderId);
      await goodsReceiptService.submitGoodsReceipt(prismaDTO);
      alert('บันทึกรับสินค้าเข้าคลังสำเร็จ');
    } catch (err) {
      alert(`การบันทึกขัดข้อง: ${err.message}`);
    }
  };

  return (
    <div className="goods-receipt-container" onClick={focusScanner}>
      {/* ส่วนแสดงผลแจ้งเตือนจากระบบ Logic Control */}
      {errorMsg && <div className="error-banner">{errorMsg}</div>}
      
      {/* ซ่อนตัวสแกนจริงทางกายภาพเพื่อให้รับคีย์บอร์ดเวดจ์สแกนได้ตลอดเวลา */}
      <input ref={inputRef} type="text" className="hidden-scanner-input" />
      
      {/* ตารางแสดงรายการตรวจรับ (ได้รับมอบหมายให้ Orchestrator ควบคุมสถานะและตารางรับสินค้า) */}
      <table>
        <thead>
          <tr>
            <th>ชื่อสินค้า</th>
            <th>สั่งใน PO</th>
            <th>รับจริง</th>
            <th>ประเภท</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {receivedItems.map((item) => (
            <tr key={item.productId}>
              <td>{item.name}</td>
              <td>{item.orderedQty}</td>
              <td>{item.receivedQty}</td>
              <td>{item.productType}</td>
              <td>
                {item.productType === 'SERIAL' && (
                  <button onClick={() => setActiveSerialProduct(item)}>
                    สแกน Serial ({item.serialNumbers.length}/{item.receivedQty})
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button disabled={!isReceiptValid} onClick={handleSubmit}>
        บันทึกรับสินค้าลงสต็อกจริง
      </button>
    </div>
  );
};