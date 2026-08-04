import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { clearAnonymousCart } from '@/features/storefront/cart/anonymousCartStore';
import {
  clearStorefrontCommitmentAuthority,
  commitProductReservation,
  getAnonymousSessionToken,
  getOrCreateCommitmentIdempotencyKey,
  requestCommitmentIdentity,
  verifyCommitmentIdentity,
} from '@/features/storefront/api/storefrontCommitmentApi';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PublicStorefrontIdentityPage = () => {
  const { shopSlug } = useParams();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [proofToken, setProofToken] = useState('');
  const [reservation, setReservation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const requestOtp = async () => {
    setBusy(true);
    setError('');
    try {
      const token = getAnonymousSessionToken(shopSlug);
      if (!token) throw new Error('ไม่พบ Shopping Session กรุณากลับไปตรวจสอบตะกร้าอีกครั้ง');
      const data = await requestCommitmentIdentity({ shopSlug, token, phone });
      setChallenge(data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'ไม่สามารถส่งรหัสยืนยันได้');
    } finally {
      setBusy(false);
    }
  };

  const createReservation = async (verifiedProofToken) => {
    const token = getAnonymousSessionToken(shopSlug);
    if (!token) throw new Error('Shopping Session หมดอายุ กรุณากลับไปตรวจสอบตะกร้าใหม่');
    const data = await commitProductReservation({
      shopSlug,
      token,
      proofToken: verifiedProofToken,
      commitmentKey: getOrCreateCommitmentIdempotencyKey(shopSlug),
    });
    if (!data?.reservation?.code) throw new Error('Server ไม่ได้ส่งข้อมูลการจองกลับมา');
    clearAnonymousCart(shopSlug);
    clearStorefrontCommitmentAuthority(shopSlug);
    setReservation(data.reservation);
    return data;
  };

  const verifyOtp = async () => {
    setBusy(true);
    setError('');
    try {
      const token = getAnonymousSessionToken(shopSlug);
      const data = await verifyCommitmentIdentity({
        shopSlug,
        token,
        challengeId: challenge?.challengeId,
        otp,
      });
      if (!data?.proofToken) throw new Error('ไม่สามารถสร้างหลักฐานยืนยันตัวตนได้');
      setProofToken(data.proofToken);
      await createReservation(data.proofToken);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'ไม่สามารถยืนยันและสร้างรายการจองได้');
    } finally {
      setBusy(false);
    }
  };

  const retryReservation = async () => {
    setBusy(true);
    setError('');
    try {
      await createReservation(proofToken);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'ไม่สามารถสร้างรายการจองได้');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-blue-800 text-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to={reservation ? `/${shopSlug}` : `/${shopSlug}/cart`} className="font-black">
            {reservation ? '← กลับหน้าร้าน' : '← กลับตะกร้า'}
          </Link>
          <span className="text-sm font-bold">Identity at Commitment</span>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-5 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">ยืนยันตัวตนเมื่อพร้อมดำเนินการต่อ</p>
          <h1 className="mt-2 text-3xl font-black">ยืนยันเบอร์โทรศัพท์</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">ระบบจะตรวจราคา สถานะขาย และสต๊อกกับ Server อีกครั้ง ก่อนสร้างรายการจองที่มีอายุจำกัด</p>

          {reservation ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">ProductReservation created</p>
              <p className="mt-2 text-2xl font-black">จองสินค้าเรียบร้อยแล้ว</p>
              <dl className="mt-5 space-y-3 rounded-xl bg-white/70 p-4 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-slate-500">เลขที่การจอง</dt><dd className="font-black">{reservation.code}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500">สถานะ</dt><dd className="font-black">{reservation.status}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500">ยอดรวม</dt><dd className="font-black">฿{money(reservation.totalAmount)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500">หมดอายุ</dt><dd className="text-right font-bold">{reservation.expiresAt ? new Date(reservation.expiresAt).toLocaleString('th-TH') : '-'}</dd></div>
              </dl>
              <p className="mt-4 text-sm leading-6">ร้านได้รับรายการจองแล้ว กรุณาเก็บเลขที่การจองไว้ใช้อ้างอิง การชำระเงินและการรับสินค้าเป็นขั้นตอนแยกต่างหาก</p>
              <Link to={`/${shopSlug}`} className="mt-5 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-black text-white">กลับหน้าร้าน</Link>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="text-sm font-bold">เบอร์โทรศัพท์</span>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} disabled={Boolean(challenge)} placeholder="08XXXXXXXX" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" />
              </label>

              {!challenge ? (
                <button type="button" onClick={requestOtp} disabled={busy || !phone.trim()} className="w-full rounded-xl bg-blue-600 px-5 py-3 font-black text-white disabled:bg-slate-300">{busy ? 'กำลังส่งรหัส...' : 'ส่งรหัส OTP'}</button>
              ) : proofToken ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">ยืนยัน OTP สำเร็จแล้ว แต่ยังสร้างรายการจองไม่สำเร็จ สามารถลองส่งคำสั่งเดิมซ้ำได้อย่างปลอดภัย</div>
                  <button type="button" onClick={retryReservation} disabled={busy} className="w-full rounded-xl bg-blue-600 px-5 py-3 font-black text-white disabled:bg-slate-300">{busy ? 'กำลังสร้างรายการจอง...' : 'ลองสร้างรายการจองอีกครั้ง'}</button>
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">ส่งรหัสไปยัง {challenge.phoneMasked || 'เบอร์ที่ระบุ'} แล้ว</div>
                  <label className="block">
                    <span className="text-sm font-bold">รหัส OTP 6 หลัก</span>
                    <input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="000000" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl font-black tracking-[0.35em] outline-none focus:border-blue-600" />
                  </label>
                  <button type="button" onClick={verifyOtp} disabled={busy || otp.length !== 6} className="w-full rounded-xl bg-blue-600 px-5 py-3 font-black text-white disabled:bg-slate-300">{busy ? 'กำลังตรวจสอบและจองสินค้า...' : 'ยืนยัน OTP และจองสินค้า'}</button>
                </>
              )}
            </div>
          )}

          {error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}
        </section>
      </div>
    </main>
  );
};

export default PublicStorefrontIdentityPage;
