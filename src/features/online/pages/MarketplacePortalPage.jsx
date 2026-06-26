// src/features/online/pages/MarketplacePortalPage.jsx
// 🏛️ P1 Marketplace Console Standard
// Direction: Desktop-first, viewport-first, product-first, search-first, hyperlocal-first.

import React, { useMemo, useState, useEffect } from 'react';
import {
  FaStore,
  FaMapMarkerAlt,
  FaSearch,
  FaUserShield,
  FaMapPin,
  FaArrowRight,
  FaBolt,
  FaThLarge,
  FaMobileAlt,
  FaTabletAlt,
  FaLaptop,
  FaHeadphones,
  FaPlug,
  FaFire,
  FaSignal,
  FaClock,
  FaChevronRight,
  FaShieldAlt,
  FaTruck,
  FaCheckCircle,
  FaWarehouse,
  FaSyncAlt,
  FaChartLine,
  FaRegHeart,
  FaBell,
  FaStar,
  FaRegStar,
} from 'react-icons/fa';

const MarketplacePortalPage = () => {
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [locStatus, setLocStatus] = useState('กำลังเตรียมพร้อมรับพิกัด...');
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
      name: 'iPad Pro 13" M4 ชิปเจเนอเรชันใหม่ Wi‑Fi',
      price: 39900,
      shop: 'แอดวานซ์ เทค บรรพต (สำนักงานใหญ่)',
      stock: 2,
      distance: '0.2 กม.',
      rating: 4.8,
      update: '1 นาที',
      imgBg: 'from-slate-800 to-slate-950',
      imgUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80',
      category: 'แท็บเล็ต/ไอที',
      trust: 'พร้อมรับหน้าร้าน',
      badge: 'Live stock',
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
      imgBg: 'from-zinc-800 to-zinc-950',
      imgUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=500&q=80',
      category: 'สมาร์ทโฟน',
      trust: 'ร้านยืนยันแล้ว',
      badge: 'ใกล้ที่สุด',
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
      imgBg: 'from-zinc-700 to-zinc-900',
      imgUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=500&q=80',
      category: 'แก็ดเจ็ต/หูฟัง',
      trust: 'สต๊อกแน่นอน',
      badge: 'ขายดี',
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
      imgBg: 'from-slate-900 to-zinc-950',
      imgUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80',
      category: 'โน้ตบุ๊ก/คอมพิวเตอร์',
      trust: 'ประกันร้านค้า',
      badge: 'โปรร้าน',
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
      imgBg: 'from-slate-800 to-zinc-900',
      imgUrl: 'https://images.unsplash.com/photo-1609592424083-d95a89fb36d1?auto=format&fit=crop&w=500&q=80',
      category: 'อุปกรณ์เสริม',
      trust: 'ขายดีในพื้นที่',
      badge: 'คุ้มค่า',
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
      imgBg: 'from-neutral-800 to-neutral-950',
      imgUrl: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=500&q=80',
      category: 'แก็ดเจ็ต/หูฟัง',
      trust: 'รับวันนี้ได้',
      badge: 'พร้อมรับ',
    },
  ];

  const marketplaceStats = [
    { label: 'ร้านค้า', value: '128', icon: FaStore },
    { label: 'สินค้า', value: '3.4K', icon: FaWarehouse },
    { label: 'อัปเดต', value: '<5m', icon: FaSyncAlt },
  ];

  const trustLayers = [
    { icon: FaShieldAlt, title: 'ของแท้ 100%', caption: 'รับประกันศูนย์ไทย' },
    { icon: FaTruck, title: 'ส่งไวในพื้นที่', caption: 'รับภายใน 2 ชม.*' },
    { icon: FaSignal, title: 'เช็กสต๊อกสด', caption: 'อัปเดตเรียลไทม์' },
    { icon: FaCheckCircle, title: 'คืนง่าย', caption: 'ภายใน 7 วัน' },
  ];

  const searchSuggestions = ['iPhone ใกล้ฉัน', 'MacBook พร้อมรับ', 'AirPods มีสต๊อก', 'สายชาร์จ USB‑C'];

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocStatus('เบราว์เซอร์ของคุณไม่รองรับการระบุพิกัด');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocStatus('ดึงคลังสินค้าและสต๊อกพาร์ทเนอร์รอบพิกัดของคุณแล้ว');
      },
      () => {
        setLocStatus('ใช้พิกัดสำรองส่วนกลาง (เมืองนครสวรรค์)');
      },
    );
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return mockProducts
      .filter((product) => {
        const matchesCategory =
          activeCategory === 'หมวดหมู่ทั้งหมด' || product.category === activeCategory;

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

  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);

    return (
      <div className="flex items-center gap-0.5 text-[10px] text-amber-400">
        {Array.from({ length: 5 }).map((_, index) =>
          index < fullStars ? <FaStar key={index} /> : <FaRegStar key={index} />,
        )}
        <span className="ml-1 font-mono font-black text-slate-500">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF7F1] font-sans text-slate-900 antialiased selection:bg-orange-500 selection:text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-18%] h-[480px] w-[480px] rounded-full bg-orange-200/35 blur-3xl" />
        <div className="absolute right-[-12%] top-[18%] h-[440px] w-[440px] rounded-full bg-amber-100/60 blur-3xl" />
      </div>

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 px-5 py-3.5 shadow-[0_14px_36px_rgba(15,23,42,0.2)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5">
          <a href="/" className="flex items-center gap-3 select-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-xs font-black tracking-wider text-white shadow-lg shadow-orange-500/30 ring-1 ring-white/10">
              SS
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black leading-none tracking-tight text-white">
                SADUAK<span className="text-orange-500">SABUY</span>
              </span>
              <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Hyperlocal IT Market
              </span>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 lg:flex">
            <a href="/marketplace" className="text-white">Marketplace</a>
            <a href="/partners" className="transition hover:text-white">Partners</a>
            <a href="/how-it-works" className="transition hover:text-white">How it works</a>
          </nav>

          <div className="hidden items-center gap-4 text-white lg:flex">
            <button type="button" className="text-lg text-white/90 transition hover:text-orange-300">
              <FaMapMarkerAlt />
            </button>
            <button type="button" className="text-lg text-white/90 transition hover:text-orange-300">
              <FaRegHeart />
            </button>
            <button type="button" className="relative text-lg text-white/90 transition hover:text-orange-300">
              <FaBell />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-slate-950" />
            </button>
          </div>

          <a
            href="/partner-portal"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-lg shadow-black/10 transition hover:bg-orange-50"
          >
            <FaUserShield className="text-orange-500" />
            หลังบ้านพาร์ตเนอร์
          </a>
        </div>
      </header>

      {/* STATUS STRIP */}
      <section className="border-b border-orange-100/80 bg-white/55 px-5 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 text-[10px] font-bold text-slate-600">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            <FaMapMarkerAlt className="shrink-0 text-orange-500" />
            <span className="shrink-0 font-black uppercase tracking-[0.2em] text-orange-600">
              Radar active
            </span>
            <span className="text-slate-300">/</span>
            <span className="truncate">{locStatus}</span>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 font-black text-emerald-700">
              <FaSignal /> Inventory Online
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 font-mono font-black text-orange-600">
              GPS {userLocation.lat ? `${userLocation.lat.toFixed(4)} • ${userLocation.lng.toFixed(4)}` : 'standby'}
            </span>
          </div>
        </div>
      </section>

      <main className="px-5 py-5">
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* LEFT BUSINESS RAIL */}
          <aside className="space-y-4">
            <section className="relative overflow-hidden rounded-[28px] bg-slate-950 p-[18px] text-white shadow-2xl shadow-slate-300/50">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(249,115,22,0.28),transparent_38%)]" />
              <div className="relative z-10">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-orange-200">
                  <FaBolt />
                  Free SaaS POS
                </div>

                <h1 className="text-[25px] font-black leading-[1.05] tracking-[-0.04em]">
                  สินค้าทุกชนิด
                  <br />
                  ที่คุณอยากได้
                  <span className="block text-orange-400">ใกล้กว่าเดิม</span>
                </h1>

                <p className="mt-3 text-[11.5px] font-semibold leading-5 text-slate-300">
                  ค้นหาสินค้าจากร้านค้าใกล้ตัว พร้อมเช็กสต๊อก ระยะทาง และความพร้อมแบบเรียลไทม์
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {marketplaceStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                        <Icon className="mb-2 text-xs text-orange-300" />
                        <p className="text-sm font-black">{stat.value}</p>
                        <p className="text-[9px] font-bold text-slate-500">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                <a
                  href="/partner-portal"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-orange-500/25 transition hover:from-orange-600 hover:to-amber-600"
                >
                  ลงทะเบียนเปิดระบบร้านค้าฟรี
                  <FaArrowRight className="text-[10px]" />
                </a>
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">
                  <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <FaFire className="text-[10px]" />
                  </span>
                  Categories
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-orange-500">
                  Live
                  <span className="h-1 w-1 rounded-full bg-orange-500" />
                </span>
              </div>

              <div className="space-y-0.5">
                {categoriesList.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.name;

                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setActiveCategory(cat.name)}
                      className={`group flex w-full items-center justify-between gap-3 rounded-[18px] px-3 py-[7px] text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                          : 'text-slate-600 hover:bg-orange-50/80 hover:text-orange-600'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3.5">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-xl transition ${
                            isActive
                              ? 'bg-white/18 text-white'
                              : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-orange-500'
                          }`}
                        >
                          <Icon className="text-[11px]" />
                        </span>
                        <span className="truncate text-[11px] font-semibold tracking-normal">{cat.name}</span>
                      </span>

                      <span
                        className={`min-w-8 rounded-full px-2 py-0.5 text-center text-[9px] font-black ${
                          isActive
                            ? 'bg-white/22 text-white'
                            : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-orange-500'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-100/70 blur-2xl" />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3.5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                      Partner Radar
                    </p>
                    <h3 className="mt-1 text-sm font-black tracking-[-0.02em] text-slate-950">
                      ระบบร้านค้าพร้อมรับลูกค้าใกล้ตัว
                    </h3>
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-orange-400 shadow-lg shadow-slate-200">
                    <FaChartLine className="text-xs" />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    ['Live', 'สต๊อก'],
                    ['POS', 'พร้อม'],
                    ['Local', 'ค้นเจอ'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-black text-slate-950">{value}</p>
                      <p className="mt-0.5 text-[9px] font-bold text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>

                <a
                  href="/partner-portal"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-[11px] font-black text-white shadow-lg shadow-slate-200 transition hover:bg-slate-900"
                >
                  ดูระบบร้านค้า
                  <FaChevronRight className="text-[9px] text-orange-400" />
                </a>
              </div>
            </section>
          </aside>

          {/* RIGHT MARKETPLACE CONSOLE */}
          <section className="min-w-0 space-y-4">
            <section className="rounded-[28px] border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">
                    Hyperlocal Marketplace
                  </p>
                  <h2 className="mt-1 text-[30px] font-black leading-tight tracking-[-0.04em] text-slate-950">
                    สินค้าพร้อมขายใกล้คุณ
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    เลือกสินค้าจากร้านใกล้ตัว เห็นสต๊อก ระยะทาง และสถานะอัปเดตล่าสุด
                  </p>
                </div>

                <div className="grid w-full max-w-sm grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                    <p className="text-[9px] font-black text-emerald-700">พร้อมขาย</p>
                    <p className="text-xl font-black text-slate-950">{filteredProducts.length}</p>
                  </div>
                  <div className="rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2">
                    <p className="text-[9px] font-black text-orange-700">พื้นที่</p>
                    <p className="text-xl font-black text-slate-950">3 กม.</p>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2">
                    <p className="text-[9px] font-black text-blue-700">สต๊อก</p>
                    <p className="text-xl font-black text-slate-950">Live</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[22px] border border-slate-200 bg-white p-2 shadow-inner">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <div className="flex flex-1 items-center gap-3 px-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <FaSearch />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="ค้นหาสินค้า ร้านค้า หมวดหมู่ หรือแบรนด์ที่ใกล้คุณ..."
                      className="h-11 w-full bg-transparent text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-xs font-black text-white shadow-md shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600"
                  >
                    ค้นหาใกล้ฉัน
                    <FaArrowRight className="text-[10px]" />
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5 px-1 pb-1">
                  {searchSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setSearchQuery(suggestion)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur">
              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">
                    Nearby Product Stream
                  </p>
                  <h3 className="mt-1 text-[22px] font-black tracking-[-0.035em] text-slate-950">
                    สินค้าที่พร้อมรับวันนี้
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSortMode('nearest')}
                    className={`rounded-2xl px-3 py-2 text-[10px] font-black transition ${
                      sortMode === 'nearest'
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📍 ใกล้ที่สุด
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortMode('latest')}
                    className={`rounded-2xl px-3 py-2 text-[10px] font-black transition ${
                      sortMode === 'latest'
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🔥 อัปเดตล่าสุด
                  </button>
                  <span className="inline-flex items-center gap-1.5 rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2 text-[10px] font-mono font-black text-orange-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    {filteredProducts.length} ITEMS
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                {filteredProducts.slice(0, 5).map((product) => (
                  <article
                    key={product.id}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-[22px] border border-slate-200/70 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300/70 hover:shadow-xl hover:shadow-slate-300/40"
                  >
                    <div className={`relative aspect-[1.02] overflow-hidden bg-gradient-to-b ${product.imgBg}`}>
                      <img
                        src={product.imgUrl}
                        alt={product.name}
                        className="h-full w-full object-cover opacity-85 mix-blend-luminosity transition duration-700 group-hover:scale-110 group-hover:opacity-100 group-hover:mix-blend-normal"
                      />

                      <div className="absolute left-2 top-2 rounded-full border border-white/10 bg-slate-950/75 px-2 py-1 text-[8px] font-black text-white backdrop-blur">
                        {product.badge}
                      </div>

                      <button
                        type="button"
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/15 text-white backdrop-blur transition hover:bg-white hover:text-orange-500"
                      >
                        <FaRegHeart className="text-[10px]" />
                      </button>

                      <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-xl bg-orange-500 px-2.5 py-1 text-[9px] font-black text-white shadow-lg shadow-orange-500/30 ring-1 ring-white/20">
                        <FaMapPin className="text-[8px]" />
                        {product.distance}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-3.5">
                      <div>
                        <p className="mb-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-orange-500">
                          {product.category}
                        </p>
                        <h4 className="line-clamp-2 min-h-[34px] text-[12px] font-black leading-snug tracking-[-0.02em] text-slate-950 transition group-hover:text-orange-600">
                          {product.name}
                        </h4>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          {renderRating(product.rating)}
                          <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                            <FaClock />
                            {product.update}
                          </span>
                        </div>

                        <p className="mt-2 flex items-center gap-1.5 truncate text-[10px] font-bold text-slate-400" title={product.shop}>
                          <FaStore className="shrink-0 text-[9px]" />
                          <span className="truncate">{product.shop}</span>
                        </p>
                      </div>

                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <div className="flex items-end justify-between gap-2">
                          <div>
                            <p className="text-[9px] font-bold text-slate-400">เริ่มต้น</p>
                            <p className="text-xl font-black tracking-tight text-orange-500">
                              ฿{product.price.toLocaleString()}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {product.stock}
                            </p>
                          </div>
                        </div>

                        <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[8px] font-black text-emerald-700">
                          <FaCheckCircle />
                          {product.trust}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {trustLayers.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                        <Icon />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-950">{item.title}</p>
                        <p className="text-[9px] font-bold text-slate-400">{item.caption}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 px-5 py-4 text-white">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-3 md:flex-row">
          <div className="text-center md:text-left">
            <div className="text-xs font-black">
              SADUAK<span className="text-orange-500">SABUY</span>
            </div>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
              P1 Hyperlocal Commerce OS
            </p>
          </div>

          <div className="flex items-center gap-5 text-[10px] font-bold text-slate-400">
            <a href="/marketplace" className="transition hover:text-white">Marketplace</a>
            <a href="/partner-portal" className="transition hover:text-white">Partner</a>
            <a href="/support" className="transition hover:text-white">Support</a>
            <a href="/status" className="transition hover:text-white">Status</a>
            <a href="/partner-portal" className="inline-flex items-center gap-1 text-orange-400 transition hover:text-orange-300">
              Partner Login <FaChevronRight className="text-[8px]" />
            </a>
          </div>

          <div className="text-[10px] font-semibold text-slate-500">
            © {new Date().getFullYear()} SADUAKSABUY.COM
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketplacePortalPage;
