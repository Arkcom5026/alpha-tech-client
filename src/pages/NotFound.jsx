// ✅ src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4 text-red-600">404</h1>
      <p className="text-lg text-gray-700 mb-4">ไม่พบหน้าที่คุณต้องการ</p>
      <Link to="/" className="text-blue-600 hover:underline">
        กลับสู่หน้าแรก
      </Link>
    </div>
  );
};

export default NotFound;
