
// ✅ BarcodeWithQRRenderer (ปรับขนาดตัวอักษร และลดช่องว่างด้านบน)
import React from "react";
import QRCode from "react-qr-code";
import BarcodeRenderer from "@/components/shared/barcode/BarcodeRenderer";

const BarcodeWithQRRenderer = ({ barcodeValue, qrValue, productName, barcodeHeight = 20, barcodeWidth = 1.8, fontSize = 10, marginTopText = 2 }) => {
  if (!barcodeValue && !qrValue) return null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center"> {/* <--- ลบ padding และ border ออก */}
      <div className="text-xs font-medium text-center truncate w-full" style={{ marginBottom: `${marginTopText}px`, fontSize: `${fontSize}px` }}>
        {productName || "-"}
      </div>

      {barcodeValue && (
        <div className="my-1">
          <BarcodeRenderer value={barcodeValue} height={barcodeHeight} width={barcodeWidth} fontSize={fontSize} />
        </div>
      )}

      {qrValue && (
        <div className="my-1">
          <QRCode value={qrValue} size={60} />
        </div>
      )}
    </div>
  );
};

export default BarcodeWithQRRenderer;
