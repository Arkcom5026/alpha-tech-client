// src/features/online/pages/MarketplacePortalPage.jsx
// Marketplace Homepage Production UX
// Direction: one-screen discovery — search, category, products. Nothing else.

import React, { useMemo, useState } from 'react';
import {
  FaArrowRight,
  FaBell,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaHeadphones,
  FaLaptop,
  FaMapPin,
  FaMobileAlt,
  FaPlug,
  FaRegHeart,
  FaRegStar,
  FaSearch,
  FaStar,
  FaStore,
  FaTabletAlt,
  FaThLarge,
  FaUserShield,
  FaWarehouse,
} from 'react-icons/fa';

const categories = [
  { name: 'ทั้งหมด', fullName: 'หมวดหมู่ทั้งหมด', icon: FaThLarge, count: 128, tone: 'sky' },
  { name: 'สมาร์ทโฟน', fullName: 'สมาร์ทโฟน', icon: FaMobileAlt, count: 42, tone: 'violet' },
  { name: 'แท็บเล็ต', fullName: 'แท็บเล็ต/ไอที', icon: FaTabletAlt, count: 18, tone: 'rose' },
  { name: 'คอมพิวเตอร์', fullName: 'โน้ตบุ๊ก/คอมพิวเตอร์', icon: FaLaptop, count: 24, tone: 'amber' },
  { name: 'แก็ดเจ็ต', fullName: 'แก็ดเจ็ต/หูฟัง', icon: FaHeadphones, count: 31, tone: 'emerald' },
  { name: 'อุปกรณ์เสริม', fullName: 'อุปกรณ์เสริม', icon: FaPlug, count: 57, tone: 'orange' },
];

const categoryTone = {
  sky: 'border-sky-200 bg-sky-50 text-sky-700',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  orange: 'border-orange-200 bg-orange-50 text-orange-700',
};

const products = [
  {
    id: 1,
    name: 'iPad Pro 13" M4 ชิปเจเนอเรชันใหม่ Wi‑Fi',
    price: 39900,
    shop: 'แอดวานซ์ เทค บรรพต',
    stock: 2,
    distance: '0.2 กม.',
    rating: 4.8,
    update: '1 นาที',
    imgUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&q=82',
    category: 'แท็บเล็ต/ไอที',
    trust: 'พร้อมรับหน้าร้าน',
    badge: 'สต๊อกสด',
    badgeClass: 'bg-sky-100 text-sky-800',
  },
  {
    id: 2,
    name: 'iPhone 17 Pro Max 512GB (Space Black)',
    price: 48900,
    shop: 'บริษัท แอดวานซ์ เทค จำกัด',
    stock: 4,
    distance: '0.8 กม.',
    rating: 4.9,
    update: '2 นาที',
    imgUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=700&q=82',
    category: 'สมาร์ทโฟน',
    trust: 'ร้านยืนยันแล้ว',
    badge: 'ใกล้ที่สุด',
    badgeClass: 'bg-violet-100 text-violet-800',
  },
  {
    id: 3,
    name: 'AirPods Pro รุ่นที่ 3 พร้อมเคสชาร์จ MagSafe (USB‑C)',
    price: 8900,
    shop: 'ร้านโมบายเซ็นเตอร์ นครสวรรค์',
    stock: 15,
    distance: '1.5 กม.',
    rating: 4.7,
    update: '4 นาที',
    imgUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=700&q=82',
    category: 'แก็ดเจ็ต/หูฟัง',
    trust: 'สต๊อกแน่นอน',
    badge: 'ขายดี',
    badgeClass: 'bg-rose-100 text-rose-800',
  },
  {
    id: 4,
    name: 'MacBook Air 13" ชิป M3 (Midnight)',
    price: 34900,
    shop: 'บริษัท แมคไวร์ บิวสิมัตต์ จำกัด',
    stock: 3,
    distance: '2.1 กม.',
    rating: 4.9,
    update: '5 นาที',
    imgUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=82',
    category: 'โน้ตบุ๊ก/คอมพิวเตอร์',
    trust: 'ประกันร้านค้า',
    badge: 'โปรร้าน',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  {
    id: 5,
    name: 'พาวเวอร์แบงค์ชาร์จเร็ว 30,000mAh PD 65W',
    price: 1590,
    shop: 'มินิมาร์ทและโมบายล์ชุมชน',
    stock: 42,
    distance: '2.5 กม.',
    rating: 4.5,
    update: '3 นาที',
    imgUrl: 'https://images.unsplash.com/photo-1609592424083-d95a89fb36d1?auto=format&fit=crop&w=700&q=82',
    category: 'อุปกรณ์เสริม',
    trust: 'ขายดีในพื้นที่',
    badge: 'คุ้มค่า',
    badgeClass: 'bg-orange-100 text-orange-800',
  },
];

const MarketplacePortalPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('หมวดหมู่ทั้งหมด');
  const [sortMode, setSortMode] = useState('nearest');

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products
      .filter((product) => {
        const categoryMatch =
          activeCategory === 'หมวดหมู่ทั้งหมด' || product.category === activeCategory;
        const searchMatch =
          !query ||
          product.name.toLowerCase().includes(query) ||
          product.shop.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);

        return categoryMatch && searchMatch;
      })
      .sort((a, b) => {
        if (sortMode === 'latest') return parseInt(a.update, 10) - parseInt(b.update, 10);
        return parseFloat(a.distance) - parseFloat(b.distance);
      });
  }, [activeCategory, searchQuery, sortMode]);

  const handleImageError = (event) => {
    event.currentTarget.style.display = 'none';
    event.currentTarget.parentElement
      ?.querySelector('[data-image-fallback]')
      ?.classList.remove('hidden');
  };

  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    return (
      <div className="flex items-center gap-0.5 text-[10px] text-amber-400">
        {Array.from({ length: 5 }).map((_, index) =>
          index < fullStars ? <FaStar key={index} /> : <FaRegStar key={index} />,
        )}
        <span className="ml-1 font-bold text-slate-500">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f8f7] font-sans text-slate-900 antialiased">
      <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-5">
        <div className="mx-auto flex h-full max-w-[1560px] items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-xs font-black text-white">SS</span>
            <div>
              <p className="text-sm font-black tracking-tight text-slate-950">SADUAKSABUY</p>
              <p className="text-[9px] font-semibold text-slate-400">สินค้าจากร้านค้าใกล้คุณ</p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-xs font-bold text-slate-500 lg:flex">
            <a href="/marketplace" aria-current="page" className="text-teal-700">Marketplace</a>
            <a href="/partners" className="transition hover:text-slate-950">ร้านค้า</a>
            <a href="/how-it-works" className="transition hover:text-slate-950">วิธีใช้งาน</a>
          </nav>

          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="สินค้าที่สนใจ" className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 sm:flex">
              <FaRegHeart />
            </button>
            <button type="button" aria-label="การแจ้งเตือน" className="relative hidden h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 sm:flex">
              <FaBell />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <a href="/partner-portal" className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-teal-200 hover:text-teal-700">
              <FaUserShield className="text-teal-600" />
              <span className="hidden sm:inline">สำหรับร้านค้า</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1560px] px-4 py-3 sm:px-5 lg:h-[calc(100vh-4rem)] lg:min-h-0 lg:overflow-hidden">
        <section>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex h-14 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-100/70">
              <FaSearch className="shrink-0 text-lg text-sky-600" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="ค้นหาสินค้า แบรนด์ หมวดหมู่ หรือร้านค้า"
                className="h-full w-full bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-slate-400"
              />
              <button type="button" className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-extrabold text-white transition hover:bg-teal-700 active:scale-[0.98]">
                ค้นหา <FaArrowRight className="text-xs" />
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => setSortMode('nearest')} aria-pressed={sortMode === 'nearest'} className={`h-10 rounded-xl px-3 text-xs font-bold transition ${sortMode === 'nearest' ? 'bg-sky-100 text-sky-800' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
                ใกล้ที่สุด
              </button>
              <button type="button" onClick={() => setSortMode('latest')} aria-pressed={sortMode === 'latest'} className={`h-10 rounded-xl px-3 text-xs font-bold transition ${sortMode === 'latest' ? 'bg-amber-100 text-amber-800' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
                ล่าสุด
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = activeCategory === category.fullName;
              return (
                <button
                  key={category.fullName}
                  type="button"
                  onClick={() => setActiveCategory(category.fullName)}
                  aria-pressed={active}
                  className={`relative flex h-14 items-center gap-2 rounded-2xl border px-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                    active
                      ? 'border-slate-300 bg-white shadow-sm after:absolute after:inset-x-5 after:top-0 after:h-0.5 after:rounded-full after:bg-teal-500'
                      : categoryTone[category.tone]
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/80"><Icon /></span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-extrabold text-slate-900">{category.name}</span>
                    <span className="text-[10px] font-bold opacity-70">{category.count}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-3">
          <div className="mb-2 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.12em] text-rose-600">สินค้าพร้อมขาย</p>
              <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-950">สินค้าใกล้คุณ</h1>
            </div>
            <span className="text-xs font-bold text-slate-400">{filteredProducts.length} รายการ</span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid items-start grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {filteredProducts.map((product) => (
                <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <div data-image-fallback className="absolute inset-0 hidden items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-violet-50">
                      <div className="absolute -left-8 bottom-5 h-24 w-24 rotate-12 rounded-[28px] border border-sky-100 bg-white/80" />
                      <div className="absolute -right-6 top-4 h-28 w-28 -rotate-12 rounded-[32px] border border-violet-100 bg-white/75" />
                      <div className="relative text-center">
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <FaWarehouse className="text-2xl text-slate-400" />
                        </span>
                        <p className="mt-3 text-xs font-extrabold text-slate-500">กำลังเตรียมภาพสินค้า</p>
                      </div>
                    </div>
                    <img src={product.imgUrl} alt="" onError={handleImageError} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                    <span className={`absolute left-2.5 top-2.5 rounded-full px-2 py-1 text-[9px] font-extrabold ${product.badgeClass}`}>{product.badge}</span>
                    <button type="button" aria-label={`บันทึก ${product.name}`} className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-sm transition hover:text-rose-600"><FaRegHeart className="text-[10px]" /></button>
                    <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-sky-600 px-2 py-1 text-[9px] font-extrabold text-white"><FaMapPin className="text-[8px]" />{product.distance}</span>
                  </div>

                  <div className="p-3">
                    <p className="text-[9px] font-extrabold tracking-wide text-slate-400">{product.category}</p>
                    <h2 className="mt-1 line-clamp-2 min-h-[36px] text-[13px] font-extrabold leading-[1.35] text-slate-950">{product.name}</h2>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {renderRating(product.rating)}
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-slate-400"><FaClock />{product.update}</span>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500"><FaStore className="shrink-0 text-violet-500" /><span className="truncate">{product.shop}</span></p>

                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <div className="flex items-end justify-between gap-2">
                        <p className="text-lg font-black tracking-tight text-slate-950">฿{product.price.toLocaleString()}</p>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-extrabold text-emerald-700">เหลือ {product.stock}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="inline-flex min-w-0 items-center gap-1 text-[9px] font-bold text-emerald-700"><FaCheckCircle /><span className="truncate">{product.trust}</span></span>
                        <a href={`/marketplace/products/${product.id}`} className="inline-flex shrink-0 items-center gap-1 text-[10px] font-extrabold text-slate-700 hover:text-teal-700">ดูสินค้า <FaChevronRight className="text-[8px]" /></a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
              <div className="text-center">
                <FaSearch className="mx-auto text-3xl text-slate-300" />
                <p className="mt-3 font-extrabold text-slate-900">ไม่พบสินค้าที่ค้นหา</p>
                <button type="button" onClick={() => { setSearchQuery(''); setActiveCategory('หมวดหมู่ทั้งหมด'); }} className="mt-3 rounded-xl bg-teal-600 px-4 py-2 text-xs font-extrabold text-white">ดูสินค้าทั้งหมด</button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MarketplacePortalPage;
