import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '@/utils/apiClient';

const PublicStorefrontPage = () => {
  const { shopSlug } = useParams();
  const [state, setState] = useState({ loading: true, storefront: null, notFound: false, error: '' });

  useEffect(() => {
    let active = true;
    apiClient.get(`/sales/storefronts/${encodeURIComponent(shopSlug || '')}`, {
      skipAuthBootstrap: true,
    })
      .then((response) => response.data)
      .then((payload) => {
        if (active) setState({ loading: false, storefront: payload?.data || null, notFound: false, error: '' });
      })
      .catch((error) => {
        if (!active) return;
        const status = error?.response?.status;
        const code = error?.response?.data?.code;
        if (status === 404 || code === 'STOREFRONT_NOT_FOUND') {
          setState({ loading: false, storefront: null, notFound: true, error: '' });
          return;
        }
        setState({
          loading: false,
          storefront: null,
          notFound: false,
          error: error?.response?.data?.message || 'ไม่สามารถโหลดหน้าร้านได้ในขณะนี้',
        });
      });
    return () => { active = false; };
  }, [shopSlug]);

  if (state.loading) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 p-8 text-center text-slate-600">กำลังโหลดหน้าร้าน...</main>;
  }

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

  if (state.error) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 p-8 text-center text-red-700">{state.error}</main>;
  }

  const { storefront } = state;
  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{storefront.name}</h1>
        {storefront.address ? <p>{storefront.address}</p> : null}
        {storefront.contactPhone ? <p>{storefront.contactPhone}</p> : null}
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(storefront.products || []).map((product) => (
          <article key={product.id} className="rounded border p-4">
            {product.coverImageUrl ? <img src={product.coverImageUrl} alt="" className="mb-3 aspect-square w-full object-cover" /> : null}
            <h2 className="font-semibold">{product.name}</h2>
            <p>{Number(product.priceOnline || 0).toLocaleString('th-TH')} บาท</p>
            <p>{product.availability?.status === 'AVAILABLE' ? 'พร้อมจำหน่าย' : 'สินค้าหมด'}</p>
          </article>
        ))}
      </section>
    </main>
  );
};

export default PublicStorefrontPage;
