import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getAnonymousSessionToken,
  requestCommitmentIdentity,
  verifyCommitmentIdentity,
} from '@/features/storefront/api/storefrontCommitmentApi';

const PublicStorefrontIdentityPage = () => {
  const { shopSlug } = useParams();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [verified, setVerified] = useState(false);
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
      setVerified(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'รหัสยืนยันไม่ถูกต้อง');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-blue-800 text-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to={`/${shopSlug}/cart`} className="font-black">← กลับตะกร้า</Link>
          <span className="text-sm font-bold">Identity at Commitment</span>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-5 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">ยืนยันตัวตนเมื่อพร้อมดำเนินการต่อ</p>
          <h1 className="mt-2 text-3xl font-black">ยืนยันเบอร์โทรศัพท์</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">ขั้นตอนนี้ยังไม่สร้างคำสั่งซื้อและยังไม่จองสต๊อก ใช้เพื่อยืนยันว่าผู้ดำเนินการต่อเป็นเจ้าของเบอร์โทรศัพท์เท่านั้น</p>

          {verified ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
              <p className="text-xl font-black">ยืนยันตัวตนสำเร็จ</p>
              <p className="mt-2 text-sm">หลักฐานยืนยันตัวตนพร้อมสำหรับขั้นสร้าง ProductReservation ใน Increment ถัดไป</p>
              <Link to={`/${shopSlug}/cart`} className="mt-5 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-black text-white">กลับไปดูตะกร้า</Link>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="text-sm font-bold">เบอร์โทรศัพท์</span>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} disabled={Boolean(challenge)} placeholder="08XXXXXXXX" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" />
              </label>

              {!challenge ? (
                <button type="button" onClick={requestOtp} disabled={busy || !phone.trim()} className="w-full rounded-xl bg-blue-600 px-5 py-3 font-black text-white disabled:bg-slate-300">{busy ? 'กำลังส่งรหัส...' : 'ส่งรหัส OTP'}</button>
              ) : (
                <>
                  <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">ส่งรหัสไปยัง {challenge.phoneMasked || 'เบอร์ที่ระบุ'} แล้ว</div>
                  <label className="block">
                    <span className="text-sm font-bold">รหัส OTP 6 หลัก</span>
                    <input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="000000" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl font-black tracking-[0.35em] outline-none focus:border-blue-600" />
                  </label>
                  <button type="button" onClick={verifyOtp} disabled={busy || otp.length !== 6} className="w-full rounded-xl bg-blue-600 px-5 py-3 font-black text-white disabled:bg-slate-300">{busy ? 'กำลังตรวจสอบ...' : 'ยืนยัน OTP'}</button>
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
