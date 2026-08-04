import { Link, useParams } from 'react-router-dom';
import PublicProductImage from '@/features/storefront/components/PublicProductImage';
import {
  clearAnonymousCart,
  getAnonymousCartItemCount,
  getAnonymousCartSubtotal,
  removeAnonymousCartItem,
  updateAnonymousCartItemQuantity,
  useAnonymousCart,
} from '@/features/storefront/cart/anonymousCartStore';

const money = (value) => Number(value || 0).toLocaleString('th-TH');

const PublicStorefrontCartPage = () => {
  const { shopSlug } = useParams();
  const cart = useAnonymousCart(shopSlug);
  const itemCount = getAnonymousCartItemCount(cart);
  const subtotal = getAnonymousCartSubtotal(cart);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-blue-800 text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to={`/${shopSlug}`}>
            <p className="text-xs text-white/65">/{shopSlug}</p>
            <h1 className="text-xl font-black">{cart.storefrontName || 'หน้าร้านออนไลน์'}</h1>
          </Link>
          <Link to={`/${shopSlug}`} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold">เลือกสินค้าต่อ</Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Anonymous shopping session</p>
            <h2 className="mt-2 text-3xl font-black">ตะกร้าสินค้า</h2>
            <p className="mt-2 text-sm text-slate-500">เก็บสินค้าไว้ก่อนได้โดยยังไม่ต้องเข้าสู่ระบบ</p>
          </div>
          {cart.items.length ? <button type="button" onClick={() => clearAnonymousCart(shopSlug)} className="text-sm font-bold text-red-600 hover:underline">ล้างตะกร้า</button> : null}
        </div>

        {!cart.items.length ? (
          <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="text-5xl">🛒</div>
            <h3 className="mt-4 text-2xl font-black">ตะกร้ายังว่าง</h3>
            <p className="mt-2 text-slate-500">เลือกสินค้าที่ต้องการจากหน้าร้าน แล้วกลับมาตรวจสอบที่นี่ได้</p>
            <Link to={`/${shopSlug}`} className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">กลับไปเลือกสินค้า</Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-4">
              {cart.items.map((item) => (
                <article key={item.productId} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[120px_minmax(0,1fr)]">
                  <Link to={`/${shopSlug}/products/${item.productId}`} className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
                    <PublicProductImage src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" fallbackSize="text-4xl" />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link to={`/${shopSlug}/products/${item.productId}`} className="font-black hover:text-blue-700">{item.name}</Link>
                        <p className="mt-1 text-sm text-slate-500">ราคาที่เห็นล่าสุด ฿{money(item.priceSnapshot)}</p>
                      </div>
                      <button type="button" onClick={() => removeAnonymousCartItem({ shopSlug, productId: item.productId })} className="text-sm font-bold text-red-600">ลบ</button>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center rounded-xl border border-slate-300">
                        <button type="button" onClick={() => updateAnonymousCartItemQuantity({ shopSlug, productId: item.productId, quantity: item.quantity - 1 })} className="px-4 py-2 text-lg font-black">−</button>
                        <span className="min-w-12 text-center font-black">{item.quantity}</span>
                        <button type="button" disabled={item.quantity >= item.availableQuantitySnapshot} onClick={() => updateAnonymousCartItemQuantity({ shopSlug, productId: item.productId, quantity: item.quantity + 1 })} className="px-4 py-2 text-lg font-black disabled:opacity-30">+</button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">รวมรายการ</p>
                        <p className="text-xl font-black">฿{money(item.priceSnapshot * item.quantity)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-amber-700">จำนวนและราคาจะถูกตรวจสอบใหม่กับร้านก่อนยืนยันคำสั่งซื้อ</p>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <h3 className="text-xl font-black">สรุปตะกร้า</h3>
              <div className="mt-5 flex justify-between text-slate-600"><span>จำนวนสินค้า</span><span className="font-bold">{itemCount.toLocaleString('th-TH')} ชิ้น</span></div>
              <div className="mt-3 flex items-end justify-between border-t pt-5"><span className="font-bold">ยอดประมาณการ</span><span className="text-3xl font-black">฿{money(subtotal)}</span></div>
              <button type="button" disabled className="mt-6 w-full rounded-xl bg-slate-300 px-5 py-3 font-black text-slate-600">ดำเนินการต่อ (ขั้นถัดไป)</button>
              <p className="mt-3 text-xs leading-5 text-slate-500">ขั้นตอนนี้ยังไม่สร้าง Order หรือจองสต๊อก ระบบจะขอให้ยืนยันตัวตนเมื่อเข้าสู่จุดผูกพัน</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default PublicStorefrontCartPage;
