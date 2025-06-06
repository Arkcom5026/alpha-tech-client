import React from "react";
import QRCode from "react-qr-code";
import BarcodeRenderer from "@/components/shared/barcode/BarcodeRenderer";

const BarcodeWithQRRenderer = ({ barcodeValue, qrValue, productName, barcodeHeight = 60, barcodeWidth = 1.8 }) => {
  if (!barcodeValue && !qrValue) return null;

  return (
    <div className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded shadow-md w-full max-w-xs">
      <div className="text-sm font-medium mb-1 text-center truncate w-full">
        {productName || "-"}
      </div>

      {/* Barcode section */}
      {barcodeValue && (
        <div className="my-2">
          <BarcodeRenderer value={barcodeValue} height={barcodeHeight} width={barcodeWidth} />
        </div>
      )}

      {/* QR Code section */}
      {qrValue && (
        <div className="mt-2">
          <QRCode value={qrValue} size={100} />
        </div>
      )}
    </div>
  );
};

export default BarcodeWithQRRenderer;
