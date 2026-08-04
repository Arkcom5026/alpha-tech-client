import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '@/utils/apiClient';

const DEFAULT_TOKENS = {
  brandPrimary: '#1e40af',
  brandAccent: '#f59e0b',
  surface: '#ffffff',
  text: '#111827',
};

const money = (value) => Number(value || 0).toLocaleString('th-TH');

const PublicStorefrontProductPage = () => {
  const { shopSlug, productId } = useParams();
  const [state, setState] = useState({ loading: true, data: null, notFound: false, error: '' });
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await apiClient.get(
          `/sales/storefronts/${encodeURIComponent(shopSlug || '')}/products/${encodeURIComponent(productId || '')}`,
          { skipAuthBootstrap: true },
        );
        if (!active) return;
        setState({ loading: false, data: response?.data?.data || null, notFound: false, error: '' });
      } catch (error) {
        if (!active) return;
        const status = error?.response?.status;
        const code = error?.response?.data?.code;
        if (status === 404 || code === 'PUBLIC_PRODUCT_NOT_FOUND' || code === 'STOREFRONT_NOT_FOUND') {
          setState({ loading: false, data: null, notFound: true, error: '' });
          return;
        }
        setState({ loading: false, data: null, notFound: false, error: error?.response?.data?.message || 'ไม่สามารถโหลดรายละเอียดสินค้าได้' });
      }
    };
    load();
    return () => { active = false; };
  }, [shopSlug, productId]);

  const tokens = useMemo(
    () => ({ ...DEFAULT_TOKENS, ...(state.data?.storefront?.experience?.themeTokens || {}) }),
    [state.data?.storefront?.experience?.themeTokens],
  );

  if (state.loading) return <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-600">กำลังโหลดรายละเอียดสินค้า...</main>;
  if (state.error) return <main className="grid min-h-screen place-items-center bg-slate-50 p-8 text-center text-red-700">{state.error}</main>;
  if (state.notFound || !state.data?.product) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <section className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">📦</div>
          <h1 className="mt-4 text-2xl font-black text-slate-900">ไม่พบสินค้านี้ในหน้าร้าน</h1>
          <p className="mt-2 text-sm text-slate-500">สินค้าอาจถูกปิดการขาย ราคาไม่อยู่ในช่วงใช้งาน หรือไม่ได้อยู่ในร้านนี้</p>
          <Link to={`/${shopSlug}`} className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">กลับหน้าร้าน</Link>
        </section>
      </main>
    );
  }

  const { storefront, product } = state.data;
  const images = Array.isArray(product.images) ? product.images.filter((image) => image.url) : [];
  const activeImage = images[selectedImage]?.url || product.coverImageUrl || null;
  const available = product.availability?.status === 'AVAILABLE';

  return (
    <main className="min-h-screen" style={{ background: tokens.surface, color: tokens.text }}>
      <header className="border-b border-white/10 text-white shadow-sm" style={{ background: tokens.brandPrimary }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to={`/${shopSlug}`}><p className="text-xs text-white/65">/{storefront.slug}</p><h1 className="text-xl font-black">{storefront.name}</h1></Link>
          <Link to={`/${shopSlug}`} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">กลับหน้าร้าน</Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:py-12">
        <nav className="mb-6 text-sm text-slate-500"><Link to={`/${shopSlug}`} className="hover:underline">หน้าร้าน</Link><span className="mx-2">/</span><span>{product.name}</span></nav>
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
              {activeImage ? <img src={activeImage} alt={product.name} className="h-full w-full object-contain" /> : <div className="grid h-full place-items-center text-7xl text-slate-300">📦</div>}
            </div>
            {images.length > 1 ? <div className="mt-4 grid grid-cols-5 gap-3">{images.map((image, index) => <button key={image.id || image.url} type="button" onClick={() => setSelectedImage(index)} className={`aspect-square overflow-hidden rounded-xl border-2 bg-white ${selectedImage === index ? 'border-blue-600' : 'border-slate-200'}`}><img src={image.url} alt={image.caption || product.name} className="h-full w-full object-contain" /></button>)}</div> : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">{product.brand?.name || product.productType?.name || 'สินค้า'}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950 md:text-4xl">{product.name}</h2>
            <p className="mt-3 text-sm text-slate-500">{[product.barcode, product.productType?.category?.name, product.unit?.name].filter(Boolean).join(' · ')}</p>

            <div className="mt-8 rounded-2xl p-6" style={{ background: tokens.brandAccent }}>
              <p className="text-sm font-bold text-slate-700">ราคาออนไลน์</p>
              <p className="mt-1 text-4xl font-black text-slate-950">฿{money(product.priceOnline)}</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className={`rounded-2xl border p-4 ${available ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-xs font-bold text-slate-500">สถานะสินค้า</p>
                <p className={`mt-1 text-lg font-black ${available ? 'text-emerald-700' : 'text-slate-600'}`}>{available ? 'พร้อมจำหน่าย' : 'สินค้าหมดชั่วคราว'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-500">จำนวนพร้อมขาย</p>
                <p className="mt-1 text-lg font-black text-slate-900">{Number(product.availability?.quantity || 0).toLocaleString('th-TH')} {product.unit?.name || 'รายการ'}</p>
              </div>
            </div>

            {product.warrantyDays ? <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4"><p className="text-sm font-bold text-blue-800">รับประกัน {Number(product.warrantyDays).toLocaleString('th-TH')} วัน</p></div> : null}

            <section className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-lg font-black">วิธีรับสินค้า</h3>
              <div className="mt-3 grid gap-3">
                {storefront.fulfillment?.pickup?.enabled ? <div className="rounded-2xl border border-slate-200 p-4"><p className="font-bold">🏪 รับสินค้าที่ร้าน</p><p className="mt-1 text-sm text-slate-500">{storefront.fulfillment.pickup.instruction || 'รับสินค้าที่หน้าร้าน'}</p></div> : null}
                {storefront.fulfillment?.delivery?.enabled ? <div className="rounded-2xl border border-slate-200 p-4"><p className="font-bold">🚚 จัดส่งสินค้า</p><p className="mt-1 text-sm text-slate-500">{storefront.fulfillment.delivery.instruction || 'ร้านมีบริการจัดส่งสินค้า'}</p></div> : null}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PublicStorefrontProductPage;
