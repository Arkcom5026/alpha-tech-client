

// ✅ BarcodeWithQRRenderer (รองรับโหมด LIST + Code39 + แสดง *...* + รองรับฟอนต์ C39HrP24DhTt)
import React from "react";
import QRCode from "react-qr-code";
import BarcodeRenderer from "@/components/shared/barcode/BarcodeRenderer";

/**
 * Props
 * - layout:
 *   - "grid" (default): แบบเดิม มีชื่อสินค้า + แสดง value ตาม BarcodeRenderer
 *   - "list-vertical": แบบภาพที่ 3 (แนวตั้ง ชิด ๆ) → ซ่อนชื่อสินค้า + คุม text เอง
 * - barcodeFormat: ส่งให้ BarcodeRenderer (เช่น "CODE39")
 *
 * - useC39Font: ถ้า true จะใช้ class "c39-font" (ให้ไปประกาศ @font-face ในหน้า Preview)
 */
const BarcodeWithQRRenderer = ({
  barcodeValue,
  qrValue,
  productName,
  barcodeHeight = 20,
  barcodeWidth = 1.8,
  fontSize = 10,
  marginTopText = 2,
  layout = "grid",
  barcodeFormat,
  // ✅ คุมการแสดงชื่อสินค้า (บางหน้าจะ render ชื่อเองแล้ว)
  showProductName = true,
}) => {
  if (!barcodeValue && !qrValue) return null;

  const isList = layout === "list-vertical";
  const shouldShowName = !isList && showProductName && (productName ?? '').toString().trim() !== '';

  return (
    <div
      className="inline-flex flex-col items-center justify-center"
      style={{ width: 'fit-content', maxWidth: '100%' }}
    >
      {/* ✅ โหมดเดิม: แสดงชื่อสินค้า (ถ้าเปิดใช้) */}
      {shouldShowName ? (
        <div
          className="text-xs font-medium text-center"
          style={{ marginBottom: `${marginTopText}px`, fontSize: `${fontSize}px`, width: '100%' }}
        >
          {productName}
        </div>
      ) : null}

      {barcodeValue && (
        <div className={isList ? 'm-0 p-0' : 'my-1'}>
          {/* ✅ LIST (font-only): ใช้ Code39 font วาดแท่งบาร์โดยตรง (ไม่ใช้ BarcodeRenderer) */}
          {isList ? (
            <>
              <div
                className="c39-barcode text-center leading-none"
                style={{
                  fontSize: `${Math.max(42, Math.round(barcodeHeight * 2.2))}px`,
                  lineHeight: 1,
                }}
              >
                *{barcodeValue}*
              </div>

              
            </>
          ) : (
            <>
              <BarcodeRenderer
                value={barcodeValue}
                height={barcodeHeight}
                width={barcodeWidth}
                fontSize={fontSize}
                format={barcodeFormat}
                // ✅ GRID เท่านั้นที่ให้ renderer แสดงตัวเลขใต้บาร์
                displayValue={!isList}
              />

              {/* (optional) สำหรับ GRID ถ้าอยากแสดง *...* เพิ่มเติมในอนาคต */}
              
            </>
          )}
        </div>
      )}

      {qrValue && (
        <div className={isList ? "mt-1" : "my-1"}>
          <QRCode value={qrValue} size={60} />
        </div>
      )}
    </div>
  );
};

export default BarcodeWithQRRenderer;

