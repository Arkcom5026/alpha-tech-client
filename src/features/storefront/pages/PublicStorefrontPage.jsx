import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import apiClient from '@/utils/apiClient';
import PublicProductImage from '@/features/storefront/components/PublicProductImage';

const DEFAULT_TOKENS = {
  brandPrimary: '#1e40af',
  brandAccent: '#f59e0b',
  surface: '#ffffff',
  text: '#111827',
};

const DEFAULT_SECTIONS = [
  { id: 'hero', type: 'HERO', enabled: true },
  { id: 'featured-products', type: 'FEATURED_PRODUCTS', enabled: true },
  { id: 'product-grid', type: 'PRODUCT_GRID', enabled: true },
  { id: 'fulfillment', type: 'FULFILLMENT', enabled: true },
  { id: 'contact', type: 'CONTACT', enabled: true },
];

const DEFAULT_CONTENT = {
  heroHeadline: 'เลือกสินค้าที่ใช่ จากร้านที่คุณไว้วางใจ',
  heroSupportingText: 'ค้นหาและเลือกซื้อสินค้าจากสต๊อกของร้านโดยตรง พร้อมราคาและสถานะล่าสุด',
};

const money = (value) => Number(value || 0).toLocaleString('th-TH');

const ProductCard = ({ product, shopSlug, compact = false }) => (
  <Link
    to={`/${shopSlug}/products/${product.id}`}
    className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <article>
      <div className={`${compact ? 'aspect-[4/3]' : 'aspect-square'} overflow-hidden bg-slate-100`}>
        <PublicProductImage src={product.coverImageUrl} alt={product.name} className="h-full w-full object-contain" />
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {product.brand?.name || product.productType?.name || 'สินค้า'}
        </p>
        <h3 className="mt-1 line-clamp-2 font-bold text-slate-900">{product.name}</h3>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-xl font-black text-slate-900">฿{money(product.priceOnline)}</p>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.availability?.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {product.availability?.status === 'AVAILABLE' ? 'พร้อมจำหน่าย' : 'สินค้าหมด'}
          </span>
        </div>
        <p className="mt-3 text-sm font-bold text-blue-700">ดูรายละเอียดสินค้า →</p>
      </div>
    </article>
  </Link>
);

const PublicStorefrontPage = () => {
  const { shopSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [storeState, setStoreState] = useState({ loading: true, storefront: null, notFound: false, error: '' });
  const [productState, setProductState] = useState({
    loading: true,
    items: [],
    facets: { categories: [], brands: [] },
    pagination: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    error: '',
  });
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');

  const query = useMemo(() => ({
    q: searchParams.get('q') || '',
    categoryId: searchParams.get('categoryId') || '',
    brandId: searchParams.get('brandId') || '',
    sort: searchParams.get('sort') || 'name_asc',
    page: Math.max(Number(searchParams.get('page') || 1), 1),
  }), [searchParams]);

  useEffect(() => setSearchText(query.q), [query.q]);

  useEffect(() => {
    let active = true;
    const slug = encodeURIComponent(shopSlug || '');

    apiClient.get(`/sales/storefronts/${slug}`, { skipAuthBootstrap: true })
      .then((response) => {
        if (!active) return;
        const storefront = response?.data?.data || null;
        setStoreState({ loading: false, storefront, notFound: !storefront, error: '' });
      })
      .catch((error) => {
        if (!active) return;
        const status = error?.response?.status;
        const code = error?.response?.data?.code;
        if (status === 404 || code === 'STOREFRONT_NOT_FOUND') {
          setStoreState({ loading: false, storefront: null, notFound: true, error: '' });
          return;
        }
        setStoreState({
          loading: false,
          storefront: null,
          notFound: false,
          error: error?.response?.data?.message || 'ไม่สามารถโหลดหน้าร้านได้ในขณะนี้',
        });
      });

    return () => { active = false; };
  }, [shopSlug]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(query.page), pageSize: '24', sort: query.sort });
    if (query.q) params.set('q', query.q);
    if (query.categoryId) params.set('categoryId', query.categoryId);
    if (query.brandId) params.set('brandId', query.brandId);

    setProductState((current) => ({ ...current, loading: true, error: '' }));
    apiClient.get(`/sales/storefronts/${encodeURIComponent(shopSlug || '')}/products?${params.toString()}`, { skipAuthBootstrap: true })
      .then((response) => {
        if (!active) return;
        const data = response?.data?.data || {};
        setProductState({
          loading: false,
          items: data.items || [],
          facets: data.facets || { categories: [], brands: [] },
          pagination: data.pagination || { page: query.page, pageSize: 24, total: 0, totalPages: 0 },
          error: '',
        });
      })
      .catch((error) => {
        if (!active) return;
        setProductState((current) => ({
          ...current,
          loading: false,
          items: [],
          error: error?.response?.data?.message || 'ไม่สามารถค้นหาสินค้าได้',
        }));
      });

    return () => { active = false; };
  }, [shopSlug, query.q, query.categoryId, query.brandId, query.sort, query.page]);

  const updateQuery = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value == null || (key === 'sort' && value === 'name_asc')) next.delete(key);
      else next.set(key, String(value));
    });
    if (!Object.prototype.hasOwnProperty.call(changes, 'page')) next.delete('page');
    setSearchParams(next);
  };

  const experience = storeState.storefront?.experience || {};
  const content = experience.contentConfiguration || {};
  const tokens = useMemo(() => ({ ...DEFAULT_TOKENS, ...(experience.themeTokens || {}) }), [experience.themeTokens]);
  const sections = useMemo(() => (
    Array.isArray(experience.sectionConfiguration) && experience.sectionConfiguration.length
      ? experience.sectionConfiguration
      : DEFAULT_SECTIONS
  ).filter((section) => section.enabled !== false), [experience.sectionConfiguration]);

  if (storeState.loading) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 p-8 text-slate-600">กำลังโหลดหน้าร้าน...</main>;
  }

  if (storeState.error) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 p-8 text-center text-red-700">{storeState.error}</main>;
  }

  if (storeState.notFound || !storeState.storefront) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">🏪</div>
          <h1 className="mt-5 text-2xl font-bold">ร้านนี้กำลังจัดเตรียมหน้าร้าน</h1>
          <p className="mt-2 text-sm text-slate-500">เจ้าของร้านกำลังเพิ่มข้อมูลและสินค้า โปรดกลับมาเยี่ยมชมอีกครั้งในภายหลัง</p>
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">กลับหน้า Marketplace</Link>
        </section>
      </main>
    );
  }

  const storefront = storeState.storefront;
  const products = productState.items;
  const featured = products.filter((product) => product.availability?.status === 'AVAILABLE').slice(0, 3);
  const hasFilters = Boolean(query.q || query.categoryId || query.brandId || query.sort !== 'name_asc');

  const discoveryControls = (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <form
        className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px_auto]"
        onSubmit={(event) => { event.preventDefault(); updateQuery({ q: searchText.trim() }); }}
      >
        <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="ค้นหาชื่อสินค้า บาร์โค้ด แบรนด์ หรือหมวดหมู่" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500" />
        <select value={query.categoryId} onChange={(event) => updateQuery({ categoryId: event.target.value })} className="rounded-xl border border-slate-300 px-3 py-3">
          <option value="">ทุกหมวดหมู่</option>
          {productState.facets.categories.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.count})</option>)}
        </select>
        <select value={query.brandId} onChange={(event) => updateQuery({ brandId: event.target.value })} className="rounded-xl border border-slate-300 px-3 py-3">
          <option value="">ทุกแบรนด์</option>
          {productState.facets.brands.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.count})</option>)}
        </select>
        <select value={query.sort} onChange={(event) => updateQuery({ sort: event.target.value })} className="rounded-xl border border-slate-300 px-3 py-3">
          <option value="name_asc">ชื่อ A–Z</option>
          <option value="newest">เพิ่มล่าสุด</option>
          <option value="price_asc">ราคาต่ำไปสูง</option>
          <option value="price_desc">ราคาสูงไปต่ำ</option>
        </select>
        <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700">ค้นหา</button>
      </form>
      {hasFilters ? (
        <button type="button" onClick={() => { setSearchText(''); setSearchParams({}); }} className="mt-3 text-sm font-bold text-blue-700 hover:underline">
          ล้างคำค้นและตัวกรอง
        </button>
      ) : null}
    </section>
  );

  const pagination = productState.pagination;
  const paginationControls = pagination.totalPages > 1 ? (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="แบ่งหน้าสินค้า">
      <button type="button" disabled={pagination.page <= 1} onClick={() => updateQuery({ page: pagination.page - 1 })} className="rounded-xl border px-4 py-2 font-bold disabled:opacity-40">ก่อนหน้า</button>
      <span className="text-sm text-slate-600">หน้า {pagination.page} จาก {pagination.totalPages}</span>
      <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => updateQuery({ page: pagination.page + 1 })} className="rounded-xl border px-4 py-2 font-bold disabled:opacity-40">ถัดไป</button>
    </nav>
  ) : null;

  const renderSection = (section) => {
    if (section.type === 'HERO') {
      const heroStyle = content.heroImageUrl
        ? {
          backgroundColor: tokens.brandAccent,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${content.heroImageUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }
        : { background: tokens.brandAccent };

      return (
        <section key={section.id} className="overflow-hidden rounded-3xl p-8 shadow-sm md:p-12" style={heroStyle}>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-800/70">ยินดีต้อนรับ</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-slate-950 md:text-5xl">
            {content.heroHeadline || DEFAULT_CONTENT.heroHeadline}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-800/75">
            {content.heroSupportingText || DEFAULT_CONTENT.heroSupportingText}
          </p>
        </section>
      );
    }

    if (section.type === 'FEATURED_PRODUCTS') {
      return (
        <section key={section.id}>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Featured</p>
              <h2 className="mt-1 text-2xl font-black">สินค้าแนะนำ</h2>
            </div>
            <span className="text-sm text-slate-500">{featured.length} รายการ</span>
          </div>
          {featured.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {featured.map((product) => <ProductCard key={product.id} product={product} shopSlug={shopSlug} compact />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">ยังไม่มีสินค้าแนะนำที่พร้อมจำหน่าย</div>
          )}
        </section>
      );
    }

    if (section.type === 'PRODUCT_GRID') {
      return (
        <section key={section.id}>
          {discoveryControls}
          <div className="mb-4 mt-7 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Catalog</p>
              <h2 className="mt-1 text-2xl font-black">สินค้าทั้งหมด</h2>
            </div>
            <span className="text-sm text-slate-500">{pagination.total.toLocaleString('th-TH')} รายการ</span>
          </div>
          {productState.loading ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-slate-500">กำลังค้นหาสินค้า...</div>
          ) : productState.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">{productState.error}</div>
          ) : products.length ? (
            <>
              <div className={`grid gap-5 ${experience.layoutPreset === 'catalog-list' ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {products.map((product) => <ProductCard key={product.id} product={product} shopSlug={shopSlug} />)}
              </div>
              {paginationControls}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              <p className="font-bold text-slate-700">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
              <button type="button" onClick={() => { setSearchText(''); setSearchParams({}); }} className="mt-3 font-bold text-blue-700">ล้างตัวกรอง</button>
            </div>
          )}
        </section>
      );
    }

    if (section.type === 'FULFILLMENT') {
      return (
        <section key={section.id} className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-2xl">🏪</p>
            <h2 className="mt-3 text-xl font-black">รับสินค้าที่ร้าน</h2>
            <p className="mt-2 text-sm text-slate-600">
              {storefront.fulfillment?.pickup?.enabled ? storefront.fulfillment.pickup.instruction || 'รับสินค้าที่หน้าร้าน' : 'ร้านนี้ยังไม่เปิดรับสินค้าที่ร้าน'}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-2xl">🚚</p>
            <h2 className="mt-3 text-xl font-black">จัดส่งสินค้า</h2>
            <p className="mt-2 text-sm text-slate-600">
              {storefront.fulfillment?.delivery?.enabled ? storefront.fulfillment.delivery.instruction || 'ร้านมีบริการจัดส่งสินค้า' : 'ร้านนี้ยังไม่เปิดบริการจัดส่ง'}
            </p>
          </div>
        </section>
      );
    }

    if (section.type === 'CONTACT') {
      return (
        <section key={section.id} className="rounded-3xl p-8 text-white" style={{ background: tokens.brandPrimary }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Contact</p>
          <h2 className="mt-2 text-3xl font-black">ติดต่อร้าน</h2>
          {content.storeDescription ? <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">{content.storeDescription}</p> : null}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-white/60">เบอร์โทร</p>
              <p className="mt-1 text-lg font-bold">{storefront.contactPhone || 'ยังไม่ได้ระบุ'}</p>
            </div>
            <div>
              <p className="text-white/60">ที่อยู่</p>
              <p className="mt-1 text-lg font-bold">{storefront.address || 'ยังไม่ได้ระบุ'}</p>
            </div>
          </div>
        </section>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen" style={{ background: tokens.surface, color: tokens.text }}>
      <header className="sticky top-0 z-10 text-white shadow-sm" style={{ background: tokens.brandPrimary }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {content.logoUrl ? <img src={content.logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl bg-white/10 object-contain p-1" /> : null}
            <div className="min-w-0">
              <p className="text-xs text-white/65">/{storefront.slug}</p>
              <h1 className="truncate text-xl font-black md:text-2xl">{content.storeHeadline || storefront.name}</h1>
              {content.storeDescription ? <p className="mt-1 line-clamp-1 text-xs text-white/70">{content.storeDescription}</p> : null}
            </div>
          </div>
          <Link to="/" className="shrink-0 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold">Marketplace</Link>
        </div>
      </header>
      {content.coverImageUrl ? <img src={content.coverImageUrl} alt="" className="h-48 w-full object-cover md:h-64" /> : null}
      <div className="mx-auto max-w-7xl space-y-10 px-5 py-8 md:py-10">{sections.map(renderSection)}</div>
      <footer className="mt-12 border-t px-5 py-8 text-center text-sm text-slate-500">{storefront.name} · หน้าร้านออนไลน์บน Alpha-Tech Platform</footer>
    </main>
  );
};

export default PublicStorefrontPage;
