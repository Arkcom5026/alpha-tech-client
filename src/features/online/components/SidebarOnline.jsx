// ✅ SidebarOnline.jsx (mock version สำหรับจัด layout)
import React, { useState } from "react";

const mockCategories = [
  { id: "1", name: "โน้ตบุ๊ค" },
  { id: "2", name: "จอมอนิเตอร์" },
  { id: "3", name: "อุปกรณ์เสริม" },
  { id: "4", name: "โซล่าเซลล์" },
  { id: "5", name: "เน็ตเวิร์ค" },
];

const SidebarOnline = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  const handleCategoryToggle = (e) => {
    const categoryId = e.target.value;
    const updated = [...selectedCategoryIds];
    const index = updated.indexOf(categoryId);
    if (index === -1) {
      updated.push(categoryId);
    } else {
      updated.splice(index, 1);
    }
    setSelectedCategoryIds(updated);
  };

  return (
    <div className="bg-white border rounded-xl p-4 text-sm">
      <h1 className="text-lg font-semibold mb-4">ค้นหาสินค้า</h1>

      {/* Search Text */}
      <input
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        type="text"
        placeholder="พิมพ์ชื่อสินค้าหรือคำค้น..."
        className="w-full border px-3 py-1 rounded mb-4"
      />

      {/* Category Filter */}
      <div className="mb-4">
        <h2 className="font-medium mb-2">หมวดหมู่สินค้า</h2>
        <div className="space-y-1 max-h-52 overflow-y-auto">
          {mockCategories.map((item) => (
            <label key={item.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={item.id}
                onChange={handleCategoryToggle}
                checked={selectedCategoryIds.includes(item.id)}
              />
              <span>{item.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarOnline;
