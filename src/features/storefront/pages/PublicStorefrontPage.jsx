import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PublicStorefrontPage = () => {
  const { shopSlug } = useParams();
  const [state, setState] = useState({ loading: true, storefront: null, error: '' });

  useEffect(() => {
    let active = true;
    fetch(`/api/sales/storefronts/${encodeURIComponent(shopSlug || '')}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 404 ? 'ไม่พบหน้าร้าน' : 'ไม่สามารถโหลดหน้าร้านได้');
        return response.json();
      })
      .then((payload) => {
        if (active) setState({ loading: false, storefront: payload?.data || null, error: '' });
      })
      .catch((error) => {
        if (active) setState({ loading: false, storefront: null, error: error.message });
      });
    return () => { active = false; };
  }, [shopSlug]);

  if (state.loading) return <main className="p-8 text-center">กำลังโหลดหน้าร้าน...</main>;
  if (state.error || !state.storefront) return <main className="p-8 text-center">{state.error || 'ไม่พบหน้าร้าน'}</main>;

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
