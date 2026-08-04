import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '@/utils/apiClient';

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

const money = (value) => Number(value || 0).toLocaleString('th-TH');

const ProductCard = ({ product, compact = false }) => (
  <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className={`${compact ? 'aspect-[4/3]' : 'aspect-square'} bg-slate-100`}>
      {product.coverImageUrl ? (
        <img src={product.coverImageUrl} alt={product.name} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full place-items-center text-4xl text-slate-300">📦</div>
      )}
    </div>
    <div className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{product.brand?.name || product.productType?.name || 'สินค้า'}</p>
      <h3 className="mt-1 line-clamp-2 font-bold text-slate-900">{product.name}</h3>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-xl font-black text-slate-900">฿{money(product.priceOnline)}</p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.availability?.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {product.availability?.status === 'AVAILABLE' ? 'พร้อมจำหน่าย' : 'สินค้าหมด'}
        </span>
      </div>
    </div>
  </article>
);

const PublicStorefrontPage = () => {
  const { shopSlug } = useParams();
  const [state, setState] = useState({ loading: true, storefront: null, products: [], notFound: false, error: '' });

  useEffect(() => {
    let active = true;
    const slug = encodeURIComponent(shopSlug || '');

    const load = async () => {
      try {
        const storeResponse = await apiClient.get(`/sales/storefronts/${slug}`, { skipAuthBootstrap: true });
        if (!active) return;

        const storefront = storeResponse?.data?.data || null;
        if (!storefront) {
          setState({ loading: false, storefront: null, products: [], notFound: true, error: '' });
          return;
        }

        let products = [];
        try {
          const productResponse = await apiClient.get(
            `/sales/storefronts/${slug}/products?page=1&pageSize=24`,
            { skipAuthBootstrap: true }
          );
          products = productResponse?.data?.data?.items || [];
        } catch (productError) {
          console.warn('[PUBLIC-STOREFRONT] Product discovery unavailable; rendering published storefront without products.', {
            slug: shopSlug,
            status: productError?.response?.status,
            code: productError?.response?.data?.code,
          });
        }

        if (active) {
          setState({ loading: false, storefront, products, notFound: false, error: '' });
        }
      } catch (error) {
        if (!active) return;
        const status = error?.response?.status;
        const code = error?.response?.data?.code;
        if (status === 404 || code === 'STOREFRONT_NOT_FOUND') {
          setState({ loading: false, storefront: null, products: [], notFound: true, error: '' });
          return;
        }
        setState({
          loading: false,
          storefront: null,
          products: [],
          notFound: false,
          error: error?.response?.data?.message || 'ไม่สามารถโหลดหน้าร้านได้ในขณะนี้',
        });
      }
    };

    load();
    return () => { active = false; };
  }, [shopSlug]);

  const experience = state.storefront?.experience || {};
  const tokens = useMemo(() => ({ ...DEFAULT_TOKENS, ...(experience.themeTokens || {}) }), [experience.themeTokens]);
  const sections = useMemo(
    () => (Array.isArray(experience.sectionConfiguration) && experience.sectionConfiguration.length
      ? experience.sectionConfiguration
      : DEFAULT_SECTIONS).filter((section) => section.enabled !== false),
    [experience.sectionConfiguration]
  );

  if (state.loading) return <main className="grid min-h-screen place-items-center bg-slate-50 p-8 text-center text-slate-600">กำลังโหลดหน้าร้าน...</main>;

  if (state.error) return <main className="grid min-h-screen place-items-center bg-slate-50 p-8 text-center text-red-700">{state.error}</main>;

  if (state.notFound || !state.storefront) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-3xl">🏪</div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">ร้านนี้กำลังจัดเตรียมหน้าร้าน</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">เจ้าของร้านกำลังเพิ่มข้อมูลและสินค้า โปรดกลับมาเยี่ยมชมอีกครั้งในภายหลัง</p>
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">กลับหน้า Marketplace</Link>
        </section>
      </main>
    );
  }

  const { storefront, products } = state;
  const featured = products.filter((product) => product.availability?.status === 'AVAILABLE').slice(0, 3);

  const renderSection = (section) => {
    if (section.type === 'HERO') {
      return (
        <section key={section.id} className="overflow-hidden rounded-3xl p-8 shadow-sm md:p-12" style={{ background: tokens.brandAccent }}>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-800/70">ยินดีต้อนรับ</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-slate-950 md:text-5xl">เลือกสินค้าที่ใช่ จากร้านที่คุณไว้วางใจ</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-800/75">เลือกซื้อสินค้าจากสต๊อกของร้านโดยตรง พร้อมข้อมูลราคาและสถานะพร้อมจำหน่ายล่าสุด</p>
        </section>
      );
    }

    if (section.type === 'FEATURED_PRODUCTS') {
      return (
        <section key={section.id}>
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Featured</p><h2 className="mt-1 text-2xl font-black">สินค้าแนะนำ</h2></div><span className="text-sm text-slate-500">{featured.length} รายการ</span></div>
          {featured.length ? <div className="grid gap-5 md:grid-cols-3">{featured.map((product) => <ProductCard key={product.id} product={product} compact />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-slate-500">ยังไม่มีสินค้าแนะนำที่พร้อมจำหน่าย</div>}
        </section>
      );
    }

    if (section.type === 'PRODUCT_GRID') {
      return (
        <section key={section.id}>
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Catalog</p><h2 className="mt-1 text-2xl font-black">สินค้าทั้งหมด</h2></div><span className="text-sm text-slate-500">{products.length} รายการ</span></div>
          {products.length ? <div className={`grid gap-5 ${experience.layoutPreset === 'catalog-list' ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-slate-500">ร้านยังไม่มีสินค้าที่เปิดขายออนไลน์</div>}
        </section>
      );
    }

    if (section.type === 'FULFILLMENT') {
      return (
        <section key={section.id} className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-2xl">🏪</p><h2 className="mt-3 text-xl font-black">รับสินค้าที่ร้าน</h2><p className="mt-2 text-sm leading-6 text-slate-600">{storefront.fulfillment?.pickup?.enabled ? storefront.fulfillment.pickup.instruction || 'รับสินค้าที่หน้าร้าน' : 'ร้านนี้ยังไม่เปิดรับสินค้าที่ร้าน'}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-2xl">🚚</p><h2 className="mt-3 text-xl font-black">จัดส่งสินค้า</h2><p className="mt-2 text-sm leading-6 text-slate-600">{storefront.fulfillment?.delivery?.enabled ? storefront.fulfillment.delivery.instruction || 'ร้านมีบริการจัดส่งสินค้า' : 'ร้านนี้ยังไม่เปิดบริการจัดส่ง'}</p></div>
        </section>
      );
    }

    if (section.type === 'CONTACT') {
      return (
        <section key={section.id} className="rounded-3xl p-8 text-white shadow-sm" style={{ background: tokens.brandPrimary }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Contact</p>
          <h2 className="mt-2 text-3xl font-black">ติดต่อร้าน</h2>
          <div className="mt-5 grid gap-4 text-sm md:grid-cols-2"><div><p className="text-white/60">เบอร์โทร</p><p className="mt-1 text-lg font-bold">{storefront.contactPhone || 'ยังไม่ได้ระบุ'}</p></div><div><p className="text-white/60">ที่อยู่</p><p className="mt-1 text-lg font-bold">{storefront.address || 'ยังไม่ได้ระบุ'}</p></div></div>
        </section>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen" style={{ background: tokens.surface, color: tokens.text }}>
      <header className="sticky top-0 z-10 border-b border-white/10 text-white shadow-sm" style={{ background: tokens.brandPrimary }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4"><div><p className="text-xs text-white/65">/{storefront.slug}</p><h1 className="text-xl font-black md:text-2xl">{storefront.name}</h1></div><Link to="/" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/20">Marketplace</Link></div>
      </header>
      <div className="mx-auto max-w-7xl space-y-10 px-5 py-8 md:py-10">{sections.map(renderSection)}</div>
      <footer className="mt-12 border-t border-slate-200 px-5 py-8 text-center text-sm text-slate-500">{storefront.name} · หน้าร้านออนไลน์บน Alpha-Tech Platform</footer>
    </main>
  );
};

export default PublicStorefrontPage;
