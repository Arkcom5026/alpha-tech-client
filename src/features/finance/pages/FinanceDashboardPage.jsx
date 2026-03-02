//src/features/finance/pages/FinanceDashboardPage.jsx

import React from 'react'

const FinanceDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ================= HEADER ================= */}
        <div>
          <h1 className="text-3xl font-bold text-blue-800 tracking-tight">
            ระบบการเงิน (Finance Command Center)
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            ภาพรวมลูกหนี้ / เครดิตลูกค้า / การเคลื่อนไหวทางการเงินระดับสาขา
          </p>
        </div>

        {/* ================= SUMMARY CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
            <div className="text-sm text-gray-500">ยอดค้างรวม</div>
            <div className="text-3xl font-extrabold text-red-600 mt-2 tracking-tight">
              0.00 ฿
            </div>
            <div className="text-xs text-gray-400 mt-1">
              รวมยอดที่ยังไม่ได้ชำระทั้งหมด
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
            <div className="text-sm text-gray-500">จำนวนบิลค้าง</div>
            <div className="text-3xl font-extrabold text-orange-600 mt-2 tracking-tight">
              0 บิล
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ใบเสร็จที่สถานะยังไม่ครบถ้วน
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
            <div className="text-sm text-gray-500">เครดิตลูกค้าที่ใช้งาน</div>
            <div className="text-3xl font-extrabold text-purple-600 mt-2 tracking-tight">
              0 ราย
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ลูกค้าที่มีวงเงินหรือยอดค้าง
            </div>
          </div>
        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 mb-4">
            เมนูการจัดการ
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href="/pos/finance/ar"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
            >
              จัดการลูกหนี้ (Accounts Receivable)
            </a>

            <a
              href="/pos/finance/customer-credit"
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition shadow-sm"
            >
              ตรวจสอบเครดิตลูกค้า
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboardPage
