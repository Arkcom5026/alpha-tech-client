// ✅ BarcodeWithQRRenderer (Production: font-only Code39 + optional QR)
// เป้าหมาย: สินค้าชิ้นเล็ก → ต้องย่อได้มากและยังสแกนเสถียร
// หมายเหตุ: ต้องมี @font-face ของ Code39 (เช่น C39HrP24DhTt) อยู่ในหน้า/Global CSS และใช้ class "c39-barcode"

import React from "react";
import QRCode from "react-qr-code";

/**
 * Props (คงไว้เพื่อ backward-compat)
 * - barcodeValue: string
 * - qrValue?: string
 * - productName?: string
 * - showProductName?: boolean (default true)
 *
 * - layout?: string (ยังรับไว้ แต่ไม่กระทบ logic; ทั้งหมดเป็น GRID)
 *
 * Font-only controls
 * - fontSizePx?: number (default 28)
 * - fontScaleX?: number (default 1.0)  // ความกว้างแท่ง/ความหนาแน่น
 *
 * Legacy controls (ยังรับไว้ แต่จะถูก map แบบปลอดภัย)
 * - barcodeHeight?: number (default 20)  // ถ้าไม่ส่ง fontSizePx จะ map จากอันนี้
 */
const BarcodeWithQRRenderer = ({
  barcodeValue,
  qrValue,
  productName,
  showProductName = true,
  // keep for API compatibility (ignored)
  layout = "grid",
  // font-only controls
  fontSizePx,
  fontScaleX = 1.0,
  // legacy
  barcodeHeight = 20,
}) => {
  if (!barcodeValue && !qrValue) return null;

  // ✅ เลือกขนาดฟอนต์ให้เหมาะกับงานพิมพ์ (ถ้าไม่ได้ส่ง fontSizePx)
  // ใช้ค่าเดิมที่เคยทำงานใน LIST font-only: สูงนิดแต่ย่อได้ดี
  const resolvedFontSizePx = Number.isFinite(Number(fontSizePx))
    ? Number(fontSizePx)
    : Math.max(18, Math.round(Number(barcodeHeight) * 2.2));

  const safeScaleX = Math.max(0.6, Math.min(1.8, Number(fontScaleX) || 1.0));

  const nameText = (productName ?? "").toString().trim();
  const shouldShowName = !!showProductName && nameText.length > 0;

  return (
    <div
      className="inline-flex flex-col items-center justify-center"
      style={{ width: "fit-content", maxWidth: "100%" }}
      data-layout={layout}
    >
      {/* ✅ ชื่อสินค้า: ให้หน้าหลักคุม clamp/width เองได้ (ถ้าไม่คุม ก็ยังแสดงแบบธรรมดา) */}
      {shouldShowName ? (
        <div className="barcode-product-name" style={{ width: "100%" }}>
          {nameText}
        </div>
      ) : null}

      {barcodeValue ? (
        <div className="m-0 p-0">
          {/* ✅ Font-only (Code39) — ต้องมี * ครอบเพื่อให้ครบ start/stop */}
          <div
            className="c39-barcode text-center leading-none"
            style={{
              fontSize: `${resolvedFontSizePx}px`,
              lineHeight: 1,
              transform: `scaleX(${safeScaleX})`,
              transformOrigin: "center top",
              display: "inline-block",
              marginTop: "1px",
              // กันโดน browser ปรับ spacing แปลก ๆ ในบางเครื่อง
              letterSpacing: "0px",
              whiteSpace: "nowrap",
            }}
          >
            *{barcodeValue}*
          </div>
        </div>
      ) : null}

      {qrValue ? (
        <div className="mt-1">
          <QRCode value={qrValue} size={60} />
        </div>
      ) : null}
    </div>
  );
};

export default BarcodeWithQRRenderer;
