import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

const BarcodeRenderer = ({
  value,
  height = 20,
  width = 0.8,
  format = 'CODE128',
  displayValue = true,
  fontSize = 6,
  margin = 0,
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      JsBarcode(svgRef.current, value, {
        format: format || 'CODE128',
        displayValue: Boolean(displayValue),
        height: parseFloat(height),
        width: parseFloat(width),
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

export const handlePrint = () => {
  window.print();
};

export default BarcodeRenderer;
