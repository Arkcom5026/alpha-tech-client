// ✅ BarcodeRenderer.jsx — แสดง Barcode ด้วย JsBarcode แบบ Dynamic Import
// 🔁 Path ใหม่: src/components/shared/barcode/BarcodeRenderer.jsx


import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

const BarcodeRenderer = ({ value, height = 30, width = 1.3 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        displayValue: true,
        height: parseFloat(height),
        width: parseFloat(width),
        fontSize: 12,
        margin: 0,
      });
    }
  }, [value, height, width]);

  return <svg ref={svgRef} />;
};

export default BarcodeRenderer;

// ✅ เพิ่มฟังก์ชัน handlePrint สำหรับการสั่งพิมพ์จากหน้าต่าง preview
export const handlePrint = () => {
  window.print();
};
