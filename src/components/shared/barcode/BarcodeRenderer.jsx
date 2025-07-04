// ✅ BarcodeRenderer.jsx — แสดง Barcode ด้วย JsBarcode แบบ Dynamic Import
// 🔁 Path ใหม่: src/components/shared/barcode/BarcodeRenderer.jsx

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

const BarcodeRenderer = ({ value, height = 20, width = 0.8 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        displayValue: true,
        height: parseFloat(height),
        width: parseFloat(width),
        fontSize: 6,         
        margin: 0,
      });
    }
  }, [value, height, width]);

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
