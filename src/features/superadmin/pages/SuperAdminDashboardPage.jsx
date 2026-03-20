import React from 'react';
import { Link } from 'react-router-dom';

const quickMenus = [
  {
    title: 'จัดการหมวดสินค้า',
    description: 'ดูแลข้อมูลหมวดสินค้ากลางของระบบ',
    to: '/superadmin/categories',
  },
  {
    title: 'จัดการประเภทสินค้า',
    description: 'กำหนดประเภทสินค้าและโครงสร้างข้อมูลกลาง',
    to: '/superadmin/product-types',
  },
  {
    title: 'จัดการแบรนด์',
    description: 'บริหารแบรนด์กลางที่ใช้ร่วมกันทั้งระบบ',
    to: '/superadmin/brands',
  },
  {
    title: 'จัดการสินค้า Global',
    description: 'ดูแลสินค้ากลางที่หลายสาขานำไปใช้งานต่อ',
    to: '/superadmin/products',
  },
  {
    title: 'จัดการสาขา',
    description: 'ตรวจสอบและดูแลโครงสร้างสาขาในระบบ',
    to: '/superadmin/branches',
  },
  {
    title: 'ตั้งค่าระบบ',
    description: 'จัดการค่ากลางและทิศทางการใช้งานระดับระบบ',
    to: '/superadmin/settings',
  },
];

const summaryCards = [
  {
    label: 'สถานะโหมด',
    value: 'GLOBAL',
    helper: 'SuperAdmin Session',
  },
  {
    label: 'ขอบเขตการเข้าถึง',
    value: 'Platform Level',
    helper: 'ไม่ผูก branch operation',
  },
  {
    label: 'บทบาทหลัก',
    value: 'Governance',
    helper: 'คุมข้อมูลกลางและโครงสร้าง',
  },
  {
    label: 'แนวทางใช้งาน',
    value: 'Readiness',
    helper: 'พร้อมต่อยอดเป็น platform dashboard',
  },
];

const SuperAdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              SUPERADMIN · GLOBAL MODE
            </div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Super Admin Dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              พื้นที่นี้ใช้สำหรับดูแลข้อมูลกลางของระบบ และควบคุมโครงสร้างระดับ Platform
              โดยแยกออกจากงานปฏิบัติการของสาขาอย่างชัดเจน
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 lg:max-w-sm">
            <div className="font-semibold">ข้อสำคัญ</div>
            <div className="mt-1 leading-6">
              หน้านี้ควรใช้สำหรับ Global Management เท่านั้น ไม่ควรนำ workflow งานขาย,
              สต๊อก, ลูกค้า หรือธุรกรรมรายสาขามาปะปนในโมดูลนี้
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="text-sm font-medium text-slate-500">{card.label}</div>
            <div className="mt-2 text-xl font-bold text-slate-900">{card.value}</div>
            <div className="mt-1 text-sm text-slate-500">{card.helper}</div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">เมนูหลักของ SuperAdmin</h2>
            <p className="mt-1 text-sm text-slate-500">
              เริ่มต้นจากโมดูล Global ที่จำเป็นก่อน แล้วค่อยขยายไปสู่ Platform Metrics และ Governance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickMenus.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="text-lg font-semibold text-slate-900 transition group-hover:text-blue-700">
                {item.title}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              <div className="mt-4 text-sm font-medium text-blue-700">เข้าสู่เมนู</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">แนวทางการออกแบบในระยะต่อไป</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="font-semibold text-slate-900">Global Master Data</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              เหมาะสำหรับ Category, ProductType, Brand และ Product กลาง ซึ่งหลายสาขาจะนำไปใช้งานต่อ
              โดยไม่ควรผูกกับ stock หรือราคา branch โดยตรง
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="font-semibold text-slate-900">Platform Governance</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ควรใช้สำหรับดูแลโครงสร้างระบบ การเปิดใช้ feature และ metrics เชิงสรุประดับ platform
              โดยไม่เจาะลงข้อมูลธุรกรรมรายสาขา
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuperAdminDashboardPage;
