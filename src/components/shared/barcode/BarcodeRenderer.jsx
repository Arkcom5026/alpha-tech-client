// ✅ BarcodeRenderer.jsx — แสดง Barcode ด้วย JsBarcode แบบ Dynamic Import
// 🔁 Path ใหม่: src/components/shared/barcode/BarcodeRenderer.jsx

import React, { useEffect, useRef } from "react";

const sizeOptions = {
  sm: { width: 1, height: 40, fontSize: 10 },
  md: { width: 2, height: 50, fontSize: 14 },
  lg: { width: 3, height: 60, fontSize: 18 },
};

const BarcodeRenderer = ({ value = "", size = "md", options = {} }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const generate = async () => {
      try {
        const JsBarcode = (await import("jsbarcode")).default;
        if (svgRef.current && value) {
          const sizeSetting = sizeOptions[size] || sizeOptions.md;
          JsBarcode(svgRef.current, value, {
            format: "CODE128",
            displayValue: true,
            ...sizeSetting,
            ...options,
          });
        }
      } catch (error) {
        console.error("Barcode generation failed:", error);
      }
    };

    generate();
  }, [value, size, options]);

  return <svg ref={svgRef} />;
};

export default BarcodeRenderer;
