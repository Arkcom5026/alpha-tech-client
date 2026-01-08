// ✅ src/features/stock/pages/StockDashboardPage.jsx
// Dashboard สต๊อกแบบ Table‑first โทนเรียบ โปร่ง ใช้งานจริง (ตามมาตรฐานโปรเจกต์)
// - ปุ่มมีสีพื้นหลังอ่อน (bg‑tint) เพื่อให้แตกต่างและดูสบายตา
// - Hover/Focus ยังชัดเจน
// - กริดยืดหยุ่น
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArrowRight = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

const Tile = ({ title, to, desc, color = "blue" }) => {
  const navigate = useNavigate();
  const colorMap = {
    blue: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-200",
    green: "bg-green-50 hover:bg-green-100 border-green-200 text-green-900 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-200",
    red: "bg-red-50 hover:bg-red-100 border-red-200 text-red-900 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-200",
    zinc: "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-900 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50 dark:text-zinc-100",
  };

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={`group w-full rounded-xl px-4 py-3 text-left transition shadow-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${colorMap[color]}`}
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold leading-tight">{title}</div>
          {desc && <div className="text-xs mt-1 leading-snug opacity-80">{desc}</div>}
        </div>
        <ArrowRight className="mt-0.5 opacity-60 group-hover:opacity-100" />
      </div>
    </button>
  );
};

const Section = ({ title, subtitle, children }) => (
  <section className="mb-7">
    <header className="mb-2">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{title}</h2>
      {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
    </header>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{children}</div>
  </section>
);

const StockDashboardPage = () => {
  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <h1 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-white">หน้าหลักสต๊อก</h1>

        <Section title="งานตรวจนับ / พร้อมขาย" subtitle="เริ่มรอบตรวจและติดตามความคืบหน้า">
          <Tile color="green" title="พร้อมขาย (Ready‑to‑Sell Audit)" to="/pos/stock/ready-audit" desc="เริ่ม/ดำเนินการตรวจสินค้าพร้อมขายเป็นรายรอบ" />
          <Tile color="blue" title="ประวัติการตรวจสต๊อก" to="/pos/stock/stock-audit" desc="ดูรอบตรวจที่ผ่านมา สถานะคงค้าง และสรุปผล" />
        </Section>

        <Section title="สินค้าและบาร์โค้ด" subtitle="ทำงานกับสินค้ารายชิ้นและการพิมพ์บาร์โค้ด">
          <Tile color="zinc" title="รายการสินค้า (Stock Items)" to="/pos/stock/items" desc="รายการสินค้ารายชิ้น สถานะ IN_STOCK / SOLD / CLAIMED ฯลฯ" />
          <Tile color="blue" title="พิมพ์บาร์โค้ด" to="/pos/stock/barcodes/print" desc="จัดกลุ่มเพื่อพิมพ์บาร์โค้ดตามใบตรวจรับ/รายการ" />
        </Section>

        <Section title="ราคาและโครงสร้างสินค้า" subtitle="โครงสร้างสินค้า (หมวด/ประเภท/แบรนด์/สเปก) และการตั้งราคาตามสาขา">
          <Tile color="blue" title="ราคาแต่ละสาขา (Branch Prices)" to="/pos/stock/branch-prices" desc="จัดการราคาขายตามสาขา และความพร้อมขาย" />
          <Tile color="zinc" title="สเปกสินค้า (SKU)" to="/pos/stock/templates" desc="กำหนดสเปกที่ขายจริง (SKU) เพื่อแยกราคา/สต๊อก เช่น 4GB/64GB" />
          <Tile color="zinc" title="แบรนด์" to="/pos/stock/profiles" desc="กำหนดแบรนด์/ยี่ห้อสินค้า เช่น Apple, ASUS, VIVO เพื่อเชื่อมกับสเปก (SKU)" />
          <Tile color="zinc" title="ประเภทสินค้า (Types)" to="/pos/stock/types" desc="กลุ่มประเภทสินค้า เช่น มือถือ คอมพิวเตอร์ อุปกรณ์" />
          <Tile color="zinc" title="หมวดสินค้า" to="/pos/stock/categories" desc="จัดกลุ่มหมวดหลักเพื่อการกรองและรายงาน (เช่น Mobile, Computer)" />
        </Section>
      </div>
    </div>
  );
};

export default StockDashboardPage;




