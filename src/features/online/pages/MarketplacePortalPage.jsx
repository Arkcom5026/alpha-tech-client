// src/features/online/pages/MarketplacePortalPage.jsx
// Marketplace Homepage Production UX
// Direction: search-first, product-first, colorful by meaning, teal as a quiet platform signature.

import React, { useEffect, useMemo, useState } from 'react';
import {
  FaArrowRight,
  FaBell,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaHeadphones,
  FaLaptop,
  FaMapMarkerAlt,
  FaMapPin,
  FaMobileAlt,
  FaPlug,
  FaRegHeart,
  FaRegStar,
  FaSearch,
  FaShieldAlt,
  FaSignal,
  FaStar,
  FaStore,
  FaTabletAlt,
  FaThLarge,
  FaTruck,
  FaUserShield,
  FaWarehouse,
} from 'react-icons/fa';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 focus-visible:ring-offset-2';

const categoryStyles = [
  { surface: 'border-sky-100 bg-sky-50', icon: 'bg-white text-sky-600', count: 'bg-sky-100 text-sky-700' },
  { surface: 'border-violet-100 bg-violet-50', icon: 'bg-white text-violet-600', count: 'bg-violet-100 text-violet-700' },
  { surface: 'border-rose-100 bg-rose-50', icon: 'bg-white text-rose-600', count: 'bg-rose-100 text-rose-700' },
  { surface: 'border-amber-100 bg-amber-50', icon: 'bg-white text-amber-600', count: 'bg-amber-100 text-amber-700' },
  { surface: 'border-emerald-100 bg-emerald-50', icon: 'bg-white text-emerald-600', count: 'bg-emerald-100 text-emerald-700' },
  { surface: 'border-orange-100 bg-orange-50', icon: 'bg-white text-orange-600', count: 'bg-orange-100 text-orange-700' },
];

const trustStyles = [
  { surface: 'border-emerald-100 bg-emerald-50/70', icon: 'bg-emerald-100 text-emerald-700' },
  { surface: 'border-sky-100 bg-sky-50/70', icon: 'bg-sky-100 text-sky-700' },
  { surface: 'border-violet-100 bg-violet-50/70', icon: 'bg-violet-100 text-violet-700' },
  { surface: 'border-rose-100 bg-rose-50/70', icon: 'bg-rose-100 text-rose-700' },
];

const MarketplacePortalPage = () => {
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [locStatus, setLocStatus] = useState('กำลังเตรียมตำแหน่งของคุณ...');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('หมวดหมู่ทั้งหมด');
  const [sortMode, setSortMode] = useState('nearest');

  const categoriesList = [
    { name: 'หมวดหมู่ทั้งหมด', icon: FaThLarge, count: 128 },
    { name: 'สมาร์ทโฟน', icon: FaMobileAlt, count: 42 },
    { name: 'แท็บเล็ต/ไอที', icon: FaTabletAlt, count: 18 },
    { name: 'โน้ตบุ๊ก/คอมพิวเตอร์', icon: FaLaptop, count: 24 },
    { name: 'แก็ดเจ็ต/หูฟัง', icon: FaHeadphones, count: 31 },
    { name: 'อุปกรณ์เสริม', icon: FaPlug, count: 57 },
  ];

  const mockProducts = [
    {
      id: 1,
      name: 'iPad Pro 13" M4 ชิปเจเนอเรชันใหม่ Wi-Fi',
      price: 39900,
      shop: 'แอดวานซ์ เทค บรรพต (สำนักงานใหญ่)',
      stock: 2,
      distance: '0.2 กม.',
      rating: 4.8,
      update: '1 นาที',
      imgUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&q=82',
      category: 'แท็บเล็ต/ไอที',
      trust: 'พร้อมรับหน้าร้าน',
      badge: 'สต๊อกสด',
      badgeStyle: 'bg-sky-100 text-sky-800',
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
      badgeStyle: 'bg-violet-100 text-violet-800',
    },
    {
      id: 3,
      name: 'AirPods Pro รุ่นที่ 3 พร้อมเคสชาร์จ MagSafe (USB-C)',
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
      badgeStyle: 'bg-rose-100 text-rose-800',
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
      badgeStyle: 'bg-amber-100 text-amber-800',
    },
    {
      id: 5,
      name: 'พาวเวอร์แบงค์ชาร์จเร็วความจุสูง 30,000mAh PD 65W',
      price: 1590,
      shop: 'มินิมาร์ทและโมบายล์ชุมชนสามัคคี',
      stock: 42,
      distance: '2.5 กม.',
      rating: 4.5,
      update: '3 นาที',
      imgUrl: 'https://images.unsplash.com/photo-1609592424083-d95a89fb36d1?auto=format&fit=crop&w=700&q=82',
      category: 'อุปกรณ์เสริม',
      trust: 'ขายดีในพื้นที่',
      badge: 'คุ้มค่า',
      badgeStyle: 'bg-orange-100 text-orange-800',
    },
    {
      id: 6,
      name: 'สมาร์ทวอทช์ Ultra Edition หน้าจอ AMOLED 49mm',
      price: 9900,
      shop: 'ร้านชำไอทีลุงดี ใกล้สถานีรถไฟ',
      stock: 8,
      distance: '3.1 กม.',
      rating: 4.6,
      update: '7 นาที',
      imgUrl: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=700&q=82',
      category: 'แก็ดเจ็ต/หูฟัง',
      trust: 'รับวันนี้ได้',
      badge: 'พร้อมรับ',
      badgeStyle: 'bg-emerald-100 text-emerald-800',
    },
  ];

  const trustLayers = [
    { icon: FaShieldAlt, title: 'ร้านค้าตรวจสอบได้', caption: 'ซื้อจากร้านจริงในระบบ' },
    { icon: FaTruck, title: 'เลือกรับได้ตามสะดวก', caption: 'รับหน้าร้านหรือจัดส่ง' },
    { icon: FaSignal, title: 'เห็นความพร้อมก่อนซื้อ', caption: 'ข้อมูลสต๊อกอัปเดตล่าสุด' },
    { icon: FaCheckCircle, title: 'ตัดสินใจอย่างมั่นใจ', caption: 'เงื่อนไขแสดงอย่างชัดเจน' },
  ];

  const searchSuggestions = ['iPhone ใกล้ฉัน', 'MacBook พร้อมรับ', 'AirPods มีสต๊อก', 'สายชาร์จ USB-C'];

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocStatus('ค้นหาสินค้าจากพื้นที่เริ่มต้น');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocStatus('กำลังแสดงสินค้าจากร้านค้าใกล้ตำแหน่งของคุณ');
      },
      () => setLocStatus('กำลังแสดงสินค้าจากร้านค้าในเมืองนครสวรรค์'),
    );
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return mockProducts
      .filter((product) => {
        const matchesCategory = activeCategory === 'หมวดหมู่ทั้งหมด' || product.category === activeCategory;
        const matchesSearch =
          normalizedQuery.length === 0 ||
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.shop.toLowerCase().includes(normalizedQuery) ||
          product.category.toLowerCase().includes(normalizedQuery);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortMode === 'latest') return parseInt(a.update, 10) - parseInt(b.update, 10);
        return parseFloat(a.distance) - parseFloat(b.distance);
      });
  }, [activeCategory, searchQuery, sortMode]);

  const handleImageError = (event) => {
    event.currentTarget.style.display = 'none';
    event.currentTarget.parentElement?.querySelector('[data-image-fallback]')?.classList.remove('hidden');
  };

  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    return (
      <div className="flex items-center gap-0.5 text-[11px] text-amber-400" aria-label={`คะแนน ${rating} จาก 5`}>
        {Array.from({ length: 5 }).map((_, index) =>
          index < fullStars ? <FaStar key={index} /> : <FaRegStar key={index} />,
        )}
        <span className="ml-1 font-bold text-slate-500">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f7f6] font-sans text-slate-900 antialiased selection:bg-teal-200 selection:text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <a href="/" className={`flex shrink-0 items-center gap-3 rounded-2xl ${focusRing}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-xs font-black tracking-wider text-white shadow-sm">SS</div>
            <div>
              <p className="text-sm font-black tracking-[-0.02em] text-slate-950">SADUAKSABUY</p>
              <p className="mt-0.5 text-[9px] font-semibold tracking-[0.08em] text-slate-400">ตลาดสินค้าจากร้านค้าใกล้คุณ</p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-xs font-bold text-slate-500 lg:flex" aria-label="เมนูหลัก">
            <a href="/marketplace" aria-current="page" className={`rounded-xl px-2 py-2 text-teal-700 ${focusRing}`}>Marketplace</a>
            <a href="/partners" className={`rounded-xl px-2 py-2 transition hover:bg-slate-50 hover:text-slate-950 ${focusRing}`}>ร้านค้า</a>
            <a href="/how-it-works" className={`rounded-xl px-2 py-2 transition hover:bg-slate-50 hover:text-slate-950 ${focusRing}`}>วิธีใช้งาน</a>
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" aria-label="สินค้าที่สนใจ" className={`hidden h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 sm:flex ${focusRing}`}><FaRegHeart /></button>
            <button type="button" aria-label="การแจ้งเตือน" className={`relative hidden h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 sm:flex ${focusRing}`}>
              <FaBell /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <a href="/partner-portal" className={`inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 ${focusRing}`}>
              <FaUserShield className="text-teal-600" /><span className="hidden sm:inline">สำหรับร้านค้า</span><span className="sm:hidden">ร้านค้า</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-[#fffdf8]">
          <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
          <div className="absolute right-[4%] top-0 h-72 w-72 rounded-full bg-amber-100/55 blur-3xl" />
          <div className="absolute bottom-[-120px] left-[44%] h-64 w-64 rounded-full bg-rose-100/45 blur-3xl" />

          <div className="relative mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12">
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-800">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />ค้นหาจากร้านจริงและเห็นความพร้อมก่อนออกเดินทาง
                </div>

                <div className={`mt-5 max-w-3xl rounded-[28px] border border-slate-200 bg-white p-2.5 shadow-[0_18px_50px_rgba(15,23,42,0.10)] transition focus-within:border-teal-300 focus-within:shadow-[0_20px_55px_rgba(13,148,136,0.12)] focus-within:ring-4 focus-within:ring-teal-50`}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center gap-3 px-3">
                      <FaSearch className="shrink-0 text-lg text-sky-600" />
                      <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ค้นหาสินค้า แบรนด์ หมวดหมู่ หรือร้านค้า..." aria-label="ค้นหาสินค้า" className="h-12 w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:font-medium placeholder:text-slate-400" />
                    </div>
                    <button type="button" className={`inline-flex h-12 items-center justify-center gap-2 rounded-[19px] bg-teal-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98] ${focusRing}`}>
                      ค้นหาสินค้า <FaArrowRight className="text-xs" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">ค้นหายอดนิยม</span>
                  {searchSuggestions.map((suggestion, index) => {
                    const styles = [
                      'border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-100',
                      'border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100',
                      'border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100',
                      'border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100',
                    ];
                    return <button key={suggestion} type="button" onClick={() => setSearchQuery(suggestion)} className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition active:scale-[0.98] ${styles[index]} ${focusRing}`}>{suggestion}</button>;
                  })}
                </div>

                <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl">
                  เจอสินค้าที่ต้องการ
                  <span className="block text-slate-700">โดยไม่ต้องค้นหาหลายที่</span>
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">ค้นหาสินค้า ดูร้านที่มีของพร้อมขาย เปรียบเทียบระยะทาง และเลือกวิธีรับสินค้าที่เหมาะกับคุณได้ในที่เดียว</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 rounded-[26px] border border-sky-100 bg-sky-50/80 p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div><p className="text-[11px] font-bold text-sky-700">พื้นที่ค้นหาปัจจุบัน</p><p className="mt-1 text-sm font-extrabold text-slate-950">{locStatus}</p></div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm"><FaMapMarkerAlt /></div>
                  </div>
                  {userLocation.lat ? <p className="mt-3 text-[10px] font-semibold text-sky-600">ตำแหน่ง {userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)}</p> : null}
                </div>
                <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/80 p-4"><FaWarehouse className="text-emerald-600" /><p className="mt-3 text-xl font-black text-slate-950">{filteredProducts.length}</p><p className="mt-1 text-[11px] font-bold text-emerald-700">สินค้าพร้อมเลือก</p></div>
                <div className="rounded-[24px] border border-violet-100 bg-violet-50/80 p-4"><FaStore className="text-violet-600" /><p className="mt-3 text-xl font-black text-slate-950">128</p><p className="mt-1 text-[11px] font-bold text-violet-700">ร้านค้าในระบบ</p></div>
                <div className="col-span-2 rounded-[24px] border border-rose-100 bg-rose-50/80 p-4"><p className="text-[11px] font-bold text-rose-700">เลือกอย่างสบายใจ</p><p className="mt-1 text-sm font-extrabold text-slate-950">เห็นราคา ร้านค้า ความพร้อม และวิธีรับสินค้าก่อนตัดสินใจ</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200/70 bg-[#f3f6f5]">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[11px] font-extrabold tracking-[0.14em] text-violet-700">เลือกจากหมวดหมู่</p><h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950">เริ่มจากสิ่งที่คุณกำลังหา</h2></div><p className="max-w-md text-sm font-medium text-slate-500">เลือกหมวดเพื่อกรองสินค้าได้ทันที</p></div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categoriesList.map((category, index) => {
                const Icon = category.icon;
                const style = categoryStyles[index];
                const isActive = activeCategory === category.name;
                return (
                  <button key={category.name} type="button" aria-pressed={isActive} onClick={() => setActiveCategory(category.name)} className={`relative overflow-hidden rounded-[24px] border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 ${isActive ? 'border-slate-300 bg-white shadow-sm' : style.surface} ${focusRing}`}>
                    {isActive ? <span className="absolute inset-x-0 top-0 h-1 bg-teal-500" /> : null}
                    <div className="flex items-start justify-between gap-2"><span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? 'bg-teal-50 text-teal-700' : style.icon}`}><Icon /></span><span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${isActive ? 'bg-slate-100 text-slate-600' : style.count}`}>{category.count}</span></div>
                    <p className="mt-4 text-sm font-extrabold leading-5 text-slate-900">{category.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200/70 bg-[#fffdf9]">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-[11px] font-extrabold tracking-[0.14em] text-rose-700">สินค้าพร้อมขาย</p><h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">สินค้าใกล้คุณที่เลือกซื้อได้ตอนนี้</h2><p className="mt-2 text-sm font-medium text-slate-500">เปรียบเทียบราคา ร้านค้า และความพร้อมก่อนดูรายละเอียด</p></div><div className="flex flex-wrap items-center gap-2">
              <button type="button" aria-pressed={sortMode === 'nearest'} onClick={() => setSortMode('nearest')} className={`rounded-2xl px-3.5 py-2.5 text-xs font-extrabold transition active:scale-[0.98] ${sortMode === 'nearest' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} ${focusRing}`}>ใกล้ที่สุด</button>
              <button type="button" aria-pressed={sortMode === 'latest'} onClick={() => setSortMode('latest')} className={`rounded-2xl px-3.5 py-2.5 text-xs font-extrabold transition active:scale-[0.98] ${sortMode === 'latest' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} ${focusRing}`}>อัปเดตล่าสุด</button>
              <span className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-500">{filteredProducts.length} รายการ</span>
            </div></div>

            {filteredProducts.length > 0 ? (
              <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {filteredProducts.slice(0, 5).map((product) => (
                  <article key={product.id} className="group flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_38px_rgba(15,23,42,0.11)] focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-50">
                    <div className="relative aspect-[1.08] overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200">
                      <div data-image-fallback className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-sky-50 via-white to-violet-50"><div className="text-center"><FaWarehouse className="mx-auto text-3xl text-slate-300" /><p className="mt-2 text-xs font-bold text-slate-400">กำลังเตรียมภาพสินค้า</p></div></div>
                      <img src={product.imgUrl} alt="" onError={handleImageError} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" />
                      <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold shadow-sm ${product.badgeStyle}`}>{product.badge}</span>
                      <button type="button" aria-label={`บันทึก ${product.name}`} className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition hover:bg-rose-50 hover:text-rose-600 active:scale-95 ${focusRing}`}><FaRegHeart className="text-xs" /></button>
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-sky-600/95 px-2.5 py-1.5 text-[10px] font-extrabold text-white shadow-sm"><FaMapPin className="text-[9px]" />{product.distance}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[10px] font-extrabold tracking-[0.08em] text-slate-400">{product.category}</p>
                      <h3 className="mt-1.5 line-clamp-2 min-h-[42px] text-sm font-extrabold leading-5 text-slate-950">{product.name}</h3>
                      <div className="mt-3 flex items-center justify-between gap-2">{renderRating(product.rating)}<span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400"><FaClock />{product.update}</span></div>
                      <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500" title={product.shop}><FaStore className="shrink-0 text-violet-500" /><span className="truncate">{product.shop}</span></p>
                      <div className="mt-auto pt-4"><div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-semibold text-slate-400">ราคา</p><p className="text-xl font-black tracking-[-0.03em] text-slate-950">฿{product.price.toLocaleString()}</p></div><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-extrabold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />เหลือ {product.stock}</span></div>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3"><span className="inline-flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-emerald-700"><FaCheckCircle className="shrink-0" /><span className="truncate">{product.trust}</span></span><a href={`/marketplace/products/${product.id}`} className={`inline-flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-extrabold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 ${focusRing}`}>ดูสินค้า <FaChevronRight className="text-[9px]" /></a></div></div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><FaSearch className="mx-auto text-3xl text-slate-300" /><h3 className="mt-4 text-lg font-black text-slate-900">ยังไม่พบสินค้าที่ตรงกับการค้นหา</h3><p className="mt-2 text-sm font-medium text-slate-500">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่ทั้งหมดเพื่อดูสินค้าเพิ่มเติม</p><button type="button" onClick={() => { setSearchQuery(''); setActiveCategory('หมวดหมู่ทั้งหมด'); }} className={`mt-5 rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-teal-700 active:scale-[0.98] ${focusRing}`}>ดูสินค้าทั้งหมด</button></div>
            )}
          </div>
        </section>

        <section className="border-b border-slate-200/70 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-9 sm:px-6"><p className="text-[11px] font-extrabold tracking-[0.14em] text-emerald-700">ซื้อได้อย่างมั่นใจ</p><h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950">ข้อมูลที่ช่วยให้ตัดสินใจได้ง่ายขึ้น</h2>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{trustLayers.map((item, index) => { const Icon = item.icon; const style = trustStyles[index]; return <div key={item.title} className={`flex items-center gap-3 rounded-[22px] border px-4 py-3.5 transition hover:-translate-y-0.5 hover:shadow-sm ${style.surface}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}><Icon /></span><div><p className="text-sm font-extrabold text-slate-950">{item.title}</p><p className="mt-0.5 text-[11px] font-medium text-slate-500">{item.caption}</p></div></div>; })}</div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-9 sm:px-6"><div className="flex flex-col justify-between gap-5 rounded-[28px] border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-rose-50 p-6 sm:flex-row sm:items-center"><div><p className="text-[11px] font-extrabold tracking-[0.12em] text-violet-700">สำหรับร้านค้า</p><h2 className="mt-1 text-xl font-black tracking-[-0.025em] text-slate-950">เชื่อมสินค้าจากหน้าร้านเข้าสู่ Marketplace</h2><p className="mt-2 text-sm font-medium text-slate-500">ให้ลูกค้าเห็นสินค้าและความพร้อมของร้าน โดยยังคงจัดการข้อมูลจากระบบเดิม</p></div><a href="/partner-portal" className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 active:scale-[0.98] ${focusRing}`}>ดูระบบสำหรับร้านค้า <FaArrowRight className="text-xs" /></a></div></section>
      </main>

      <footer className="border-t border-slate-200 bg-[#eef2f1] px-4 py-6 sm:px-6"><div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left"><div><p className="text-sm font-black text-slate-950">SADUAKSABUY</p><p className="mt-1 text-xs font-medium text-slate-500">ค้นหา เลือกซื้อ และเชื่อมต่อกับร้านค้าใกล้คุณ</p></div><div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-bold text-slate-500"><a href="/marketplace" className={`rounded-lg px-1 py-1 transition hover:text-teal-700 ${focusRing}`}>Marketplace</a><a href="/partner-portal" className={`rounded-lg px-1 py-1 transition hover:text-violet-700 ${focusRing}`}>สำหรับร้านค้า</a><a href="/support" className={`rounded-lg px-1 py-1 transition hover:text-sky-700 ${focusRing}`}>ช่วยเหลือ</a><a href="/status" className={`rounded-lg px-1 py-1 transition hover:text-emerald-700 ${focusRing}`}>สถานะระบบ</a></div><p className="text-xs font-medium text-slate-400">© {new Date().getFullYear()} Saduaksabuy</p></div></footer>
    </div>
  );
};

export default MarketplacePortalPage;
