// src/features/online/pages/MarketplacePortalPage.jsx
// Marketplace Homepage Production UX Foundation
// Direction: search-first, product-first, mobile-safe, friendly professional commerce.

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

const MarketplacePortalPage = () => {
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [locStatus, setLocStatus] = useState('กำลังเตรียมตำแหน่งสำหรับค้นหาร้านใกล้คุณ...');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('หมวดหมู่ทั้งหมด');
  const [sortMode, setSortMode] = useState('nearest');

  const categoriesList = [
    { name: 'หมวดหมู่ทั้งหมด', icon: FaThLarge, count: 128, tone: 'bg-teal-50 text-teal-700' },
    { name: 'สมาร์ทโฟน', icon: FaMobileAlt, count: 42, tone: 'bg-sky-50 text-sky-700' },
    { name: 'แท็บเล็ต/ไอที', icon: FaTabletAlt, count: 18, tone: 'bg-violet-50 text-violet-700' },
    { name: 'โน้ตบุ๊ก/คอมพิวเตอร์', icon: FaLaptop, count: 24, tone: 'bg-indigo-50 text-indigo-700' },
    { name: 'แก็ดเจ็ต/หูฟัง', icon: FaHeadphones, count: 31, tone: 'bg-rose-50 text-rose-700' },
    { name: 'อุปกรณ์เสริม', icon: FaPlug, count: 57, tone: 'bg-amber-50 text-amber-700' },
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
      imgUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&q=80',
      category: 'แท็บเล็ต/ไอที',
      trust: 'พร้อมรับหน้าร้าน',
      badge: 'สต๊อกสด',
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
      imgUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=700&q=80',
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
      imgUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=700&q=80',
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
      imgUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80',
      category: 'โน้ตบุ๊ก/คอมพิวเตอร์',
      trust: 'ประกันร้านค้า',
      badge: 'ร้านแนะนำ',
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
      imgUrl: 'https://images.unsplash.com/photo-1609592424083-d95a89fb36d1?auto=format&fit=crop&w=700&q=80',
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
      imgUrl: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=700&q=80',
      category: 'แก็ดเจ็ต/หูฟัง',
      trust: 'รับวันนี้ได้',
      badge: 'พร้อมรับ',
    },
  ];

  const trustLayers = [
    { icon: FaShieldAlt, title: 'ร้านค้ายืนยันตัวตน', caption: 'เห็นข้อมูลร้านก่อนตัดสินใจ', tone: 'bg-teal-50 text-teal-700' },
    { icon: FaSignal, title: 'เช็กสต๊อกจากร้าน', caption: 'ลดความไม่แน่นอนก่อนเดินทาง', tone: 'bg-sky-50 text-sky-700' },
    { icon: FaTruck, title: 'เลือกรับหรือจัดส่ง', caption: 'เลือกวิธีที่เหมาะกับคุณ', tone: 'bg-violet-50 text-violet-700' },
    { icon: FaCheckCircle, title: 'ข้อมูลพร้อมตัดสินใจ', caption: 'ราคา ร้าน และความพร้อมอยู่ด้วยกัน', tone: 'bg-emerald-50 text-emerald-700' },
  ];

  const searchSuggestions = ['iPhone ใกล้ฉัน', 'MacBook พร้อมรับ', 'AirPods มีสต๊อก', 'สายชาร์จ USB‑C'];

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocStatus('เบราว์เซอร์ไม่รองรับตำแหน่ง ระบบจะแสดงร้านในพื้นที่หลักให้ก่อน');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocStatus('พร้อมแสดงสินค้าและร้านค้าใกล้ตำแหน่งของคุณ');
      },
      () => {
        setLocStatus('กำลังแสดงร้านค้าในพื้นที่นครสวรรค์ คุณเปลี่ยนพื้นที่ได้ภายหลัง');
      },
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

  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);

    return (
      <div className="flex items-center gap-0.5 text-[11px] text-amber-400">
        {Array.from({ length: 5 }).map((_, index) =>
          index < fullStars ? <FaStar key={index} /> : <FaRegStar key={index} />,
        )}
        <span className="ml-1 font-bold text-slate-500">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9] font-sans text-slate-900 antialiased selection:bg-teal-500 selection:text-white">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3" aria-label="Saduaksabuy หน้าแรก">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500 text-sm font-black tracking-wide text-white shadow-sm">
              SS
            </div>
            <div>
              <p className="text-sm font-black tracking-tight text-slate-950">SADUAKSABUY</p>
              <p className="text-[10px] font-semibold text-slate-500">ค้นหาใกล้ ซื้อได้มั่นใจ</p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
            <a href="/marketplace" className="text-teal-700">สินค้า</a>
            <a href="/partners" className="transition hover:text-teal-700">ร้านค้า</a>
            <a href="/how-it-works" className="transition hover:text-teal-700">วิธีใช้งาน</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-teal-700 sm:flex" aria-label="สินค้าที่ชอบ">
              <FaRegHeart />
            </button>
            <button type="button" className="relative hidden h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-teal-700 sm:flex" aria-label="การแจ้งเตือน">
              <FaBell />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <a href="/partner-portal" className="inline-flex items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 transition hover:border-teal-300 hover:bg-teal-100 sm:px-4">
              <FaUserShield />
              <span className="hidden sm:inline">สำหรับร้านค้า</span>
              <span className="sm:hidden">ร้านค้า</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-teal-100 bg-gradient-to-b from-teal-50/80 via-white to-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-teal-700 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  สินค้าจากร้านค้าใกล้คุณ
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
                  เจอสินค้าที่ต้องการ
                  <span className="block text-teal-600">โดยไม่ต้องค้นหาหลายที่</span>
                </h1>
                <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
                  ค้นหาสินค้า ดูร้านที่มีของพร้อมขาย เปรียบเทียบระยะทาง และเลือกวิธีรับสินค้าที่สะดวกได้ในที่เดียว
                </p>

                <div className="mt-7 rounded-[26px] border border-slate-200 bg-white p-2.5 shadow-[0_18px_50px_rgba(15,118,110,0.10)]">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <div className="flex flex-1 items-center gap-3 px-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                        <FaSearch />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="ค้นหาสินค้า แบรนด์ รุ่น หรือร้านค้า..."
                        className="h-12 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
                      />
                    </div>
                    <button type="button" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-500 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-teal-600 active:scale-[0.99]">
                      ค้นหาสินค้า
                      <FaArrowRight className="text-xs" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 px-2 pb-1">
                    {searchSuggestions.map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => setSearchQuery(suggestion)} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-teal-50 hover:text-teal-700">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 text-sm font-medium text-slate-500">
                  <FaMapMarkerAlt className="mt-0.5 shrink-0 text-teal-500" />
                  <span>{locStatus}</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[28px] border border-teal-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600"><FaWarehouse /></div>
                    <div>
                      <p className="text-sm font-black text-slate-950">เห็นความพร้อมก่อนเดินทาง</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">ข้อมูลสต๊อก ร้านค้า และระยะทางอยู่ในจุดเดียว ลดการโทรถามและค้นหาซ้ำ</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-sky-100 bg-sky-50/70 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600"><FaTruck /></div>
                    <div>
                      <p className="text-sm font-black text-slate-950">เลือกวิธีรับสินค้าที่เหมาะกับคุณ</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">รับที่ร้านหรือจัดส่ง โดยดูเงื่อนไขของแต่ละร้านก่อนตัดสินใจ</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/70 p-5 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600"><FaShieldAlt /></div>
                    <div>
                      <p className="text-sm font-black text-slate-950">ตัดสินใจซื้อด้วยข้อมูลที่ชัดเจน</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">ดูร้าน ราคา คะแนน ความพร้อม และการอัปเดตล่าสุดก่อนเลือกซื้อ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">เลือกจากหมวดหมู่</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">เริ่มจากสิ่งที่คุณกำลังหา</h2>
            </div>
            <span className="hidden text-sm font-medium text-slate-500 sm:block">เลือกหมวดเพื่อกรองสินค้าได้ทันที</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categoriesList.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.name;
              return (
                <button key={category.name} type="button" onClick={() => setActiveCategory(category.name)} className={`group rounded-[24px] border p-4 text-left transition ${isActive ? 'border-teal-300 bg-teal-50 shadow-sm' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-sm'}`}>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isActive ? 'bg-teal-500 text-white' : category.tone}`}><Icon /></div>
                  <p className="mt-4 text-sm font-black text-slate-900">{category.name}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{category.count} รายการ</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">สินค้าพร้อมขาย</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">สินค้าใกล้คุณที่เลือกซื้อได้ตอนนี้</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">แสดงข้อมูลที่จำเป็นต่อการตัดสินใจ โดยไม่ทำให้หน้าจอแน่นเกินไป</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setSortMode('nearest')} className={`rounded-2xl px-4 py-2.5 text-xs font-black transition ${sortMode === 'nearest' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>ใกล้ที่สุด</button>
                <button type="button" onClick={() => setSortMode('latest')} className={`rounded-2xl px-4 py-2.5 text-xs font-black transition ${sortMode === 'latest' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>อัปเดตล่าสุด</button>
                <span className="rounded-2xl bg-sky-50 px-4 py-2.5 text-xs font-black text-sky-700">{filteredProducts.length} รายการ</span>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {filteredProducts.slice(0, 5).map((product) => (
                  <article key={product.id} className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_18px_40px_rgba(15,118,110,0.10)]">
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      <img src={product.imgUrl} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-slate-700 shadow-sm backdrop-blur">{product.badge}</span>
                      <button type="button" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm transition hover:text-rose-500" aria-label={`บันทึก ${product.name}`}><FaRegHeart /></button>
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-teal-500 px-2.5 py-1 text-[10px] font-black text-white shadow-sm"><FaMapPin /> {product.distance}</span>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-teal-600">{product.category}</p>
                      <h3 className="mt-2 line-clamp-2 min-h-[42px] text-sm font-black leading-5 text-slate-950 transition group-hover:text-teal-700">{product.name}</h3>
                      <div className="mt-3 flex items-center justify-between gap-2">{renderRating(product.rating)}<span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400"><FaClock /> {product.update}</span></div>
                      <p className="mt-3 flex items-center gap-2 truncate text-xs font-semibold text-slate-500" title={product.shop}><FaStore className="shrink-0 text-teal-500" /><span className="truncate">{product.shop}</span></p>
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <div className="flex items-end justify-between gap-2">
                          <div><p className="text-[10px] font-semibold text-slate-400">ราคาเริ่มต้น</p><p className="mt-1 text-xl font-black tracking-tight text-slate-950">฿{product.price.toLocaleString()}</p></div>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">เหลือ {product.stock}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700"><FaCheckCircle /> {product.trust}</span>
                          <button type="button" className="inline-flex items-center gap-1 text-[11px] font-black text-teal-700 transition hover:text-teal-800">ดูสินค้า <FaChevronRight className="text-[9px]" /></button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                <FaSearch className="mx-auto text-2xl text-slate-300" />
                <p className="mt-4 text-base font-black text-slate-700">ยังไม่พบสินค้าที่ตรงกับการค้นหา</p>
                <p className="mt-2 text-sm font-medium text-slate-500">ลองเปลี่ยนคำค้นหรือเลือกหมวดหมู่อื่น</p>
              </div>
            )}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-3 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {trustLayers.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3 rounded-[22px] p-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.tone}`}><Icon /></div>
                  <div><p className="text-sm font-black text-slate-950">{item.title}</p><p className="mt-1 text-xs font-medium leading-5 text-slate-500">{item.caption}</p></div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="bg-[#F1F6F5] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div><p className="text-sm font-black text-slate-950">SADUAKSABUY</p><p className="mt-1 text-xs font-medium text-slate-500">Marketplace ที่ช่วยให้การค้นหาและตัดสินใจซื้อง่ายขึ้น</p></div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-slate-500">
            <a href="/marketplace" className="transition hover:text-teal-700">สินค้า</a>
            <a href="/partners" className="transition hover:text-teal-700">ร้านค้า</a>
            <a href="/support" className="transition hover:text-teal-700">ช่วยเหลือ</a>
            <a href="/partner-portal" className="text-teal-700 transition hover:text-teal-800">เข้าสู่ระบบร้านค้า</a>
          </div>
          <p className="text-xs font-medium text-slate-400">© {new Date().getFullYear()} Saduaksabuy</p>
        </div>
      </footer>
    </div>
  );
};

export default MarketplacePortalPage;
