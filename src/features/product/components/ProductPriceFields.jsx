// ✅ src/features/product/components/ProductPriceFields.jsx

import React from 'react';

const ProductPriceFields = ({ 
  localPrices, 
  setLocalPrices
}) => {
  const handleAddPriceLevel = () => {
    const newLevel = localPrices.length + 1;
    const newPrice = {
      level: newLevel,
      price: 0,
      name: `ระดับ ${newLevel}`,
    };

    setLocalPrices((prev) => [...prev, newPrice]);
  };

  const handleDeletePriceLevel = (index) => {
    setLocalPrices((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePriceChange = (index, newValue) => {
    setLocalPrices((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, price: parseFloat(newValue) || 0 } : item
      )
    );
  };

  return (
    <div className="pt-4 border-t">
      <h3 className="font-semibold mb-2">ราคาขายแต่ละระดับ</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {localPrices.map((item, index) => (
          <div key={index} className="relative">
            <label className="block font-medium mb-1">
              ระดับที่ {item.level}
            </label>
            <input
              type="number"
              step="0.01"
              value={item.price}
              onChange={(e) => handlePriceChange(index, e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => handleDeletePriceLevel(index)}
              className="absolute top-0 right-0 text-red-600 text-sm"
            >
              🗑 ลบ
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddPriceLevel}
        className="text-blue-600 font-medium underline mt-2"
      >
        ➕ เพิ่มระดับราคา
      </button>
    </div>
  );
};

export default ProductPriceFields;
