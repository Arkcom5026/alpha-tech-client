// ✅ src/features/online/pages/HomeOnline.jsx
import React from 'react';
import ContentCarousel from './ContentCarousel';

const HomeOnline = () => {
  return (
    <div className="flex flex-col gap-8 px-4 py-6 max-w-screen-xl mx-auto">
      <div>
        <ContentCarousel />
      </div>

      {/* 🔹 Section: สินค้าแนะนำ */}
      <section>
        <h2 className="text-xl font-semibold mb-2">สินค้าแนะนำ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4].map((id) => (
            <div
              key={id}
              className="border rounded-lg p-3 shadow-sm hover:shadow transition text-sm"
            >
              <div className="aspect-square bg-gray-200 mb-2 rounded" />
              <p className="font-medium">ชื่อสินค้า {id}</p>
              <p className="text-xs text-gray-500">หมวดหมู่สินค้า</p>
              <button className="mt-2 bg-blue-600 text-white text-xs px-3 py-1 rounded">
                ดูรายละเอียด
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 Section: สินค้าขายดี */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">สินค้าขายดี</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[5, 6, 7, 8].map((id) => (
            <div
              key={id}
              className="border rounded-lg p-3 shadow-sm hover:shadow transition text-sm"
            >
              <div className="aspect-square bg-gray-200 mb-2 rounded" />
              <p className="font-medium">สินค้าขายดี {id}</p>
              <p className="text-xs text-gray-500">หมวดหมู่</p>
              <button className="mt-2 bg-blue-600 text-white text-xs px-3 py-1 rounded">
                ดูรายละเอียด
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeOnline;
