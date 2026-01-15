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
 * - showAsteriskText: แสดง *{barcodeValue}* ใต้บาร์โค้ด (โหมด list)
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
  showAsteriskText = false,
  useC39Font = false,
}) => {
  if (!barcodeValue && !qrValue) return null;

  const isList = layout === "list-vertical";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* ✅ โหมดเดิม: แสดงชื่อสินค้า */}
      {!isList && (
        <div
          className="text-xs font-medium text-center truncate w-full"
          style={{ marginBottom: `${marginTopText}px`, fontSize: `${fontSize}px` }}
        >
          {productName || "-"}
        </div>
      )}

      {barcodeValue && (
        <div className={isList ? "m-0 p-0" : "my-1"}>
          <BarcodeRenderer
            value={barcodeValue}
            height={barcodeHeight}
            width={barcodeWidth}
            fontSize={fontSize}
            format={barcodeFormat}
            // ✅ โหมด list: เราแสดง text เอง เพื่อคุม *...* และฟอนต์
            displayValue={!isList}
          />

          {/* ✅ แบบภาพที่ 3: แสดง *...* ใต้บาร์โค้ด */}
          {isList && showAsteriskText && (
            <div
              className={`${useC39Font ? "c39-font" : ""} text-center leading-none`}
              style={{
                fontSize: `${Math.max(12, fontSize + 6)}px`,
                marginTop: "1px",
              }}
            >
              *{barcodeValue}*
            </div>
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
