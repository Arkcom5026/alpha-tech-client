// ✅ BarcodeRenderer.jsx — แสดง Barcode ด้วย JsBarcode
// Path: src/components/shared/barcode/BarcodeRenderer.jsx

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

const BarcodeRenderer = ({
  value,
  height = 20,
  width = 0.8,

  // ✅ เพิ่มเพื่อรองรับ BarcodeWithQRRenderer (โหมด LIST/Code39)
  format = 'CODE128',
  displayValue = true,
  fontSize = 6,
  margin = 0,
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      JsBarcode(svgRef.current, value, {
        // ✅ รับ format จากภายนอก (เช่น 'CODE39')
        format: format || 'CODE128',

        // ✅ คุมการแสดงตัวเลขใต้บาร์จากภายนอก
        displayValue: Boolean(displayValue),

        height: parseFloat(height),
        width: parseFloat(width),

        // ✅ คุมฟอนต์/ระยะขอบได้
        fontSize: parseFloat(fontSize),
        margin: parseFloat(margin),
      });
    }
  }, [value, height, width, format, displayValue, fontSize, margin]);

  return (
    <div className="flex justify-center items-center">
      <svg ref={svgRef} />
    </div>
  );
};

export default BarcodeRenderer;

// ✅ เพิ่มฟังก์ชัน handlePrint สำหรับการสั่งพิมพ์จากหน้าต่าง preview
export const handlePrint = () => {
  window.print();
};
