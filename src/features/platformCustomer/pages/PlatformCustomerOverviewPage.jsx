import React, { useEffect, useState } from 'react';
import { Search, ShieldCheck, Store, UserRound } from 'lucide-react';
import { getPlatformCustomerOverview } from '../api/platformCustomerApi';

const PlatformCustomerOverviewPage = () => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (search = query) => {
    setLoading(true);
    setError('');
    try {
      setData(await getPlatformCustomerOverview({ query: search }));
    } catch (cause) {
      setError(cause?.response?.data?.message || 'โหลดข้อมูลลูกค้าแพลตฟอร์มไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('');
  }, []);

  const onSubmit = (event) => {
    event.preventDefault();
    load(query);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Customer Governance</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">Platform Customer Overview</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
              ภาพรวมตัวตนระดับแพลตฟอร์มและความสัมพันธ์กับร้านแบบอ่านอย่างเดียว โดยไม่เปิดข้อมูลธุรกิจภายในร้าน
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
            READ ONLY
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-5 flex max-w-2xl gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาเบอร์โทร อีเมล ชื่อ บริษัท หรือเลขผู้เสียภาษี"
              className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:border-orange-400"
            />
          </div>
          <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white">ค้นหา</button>
        </form>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-black text-slate-900">Platform Identities</h2>
          <span className="text-sm font-bold text-slate-500">{data.count || 0} รายการ</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm font-bold text-slate-500">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {(data.results || []).map((identity) => (
              <article key={identity.userId} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900">User #{identity.userId}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-600">{identity.loginId || '-'} · {identity.email || '-'}</p>
                      <p className="mt-1 text-xs font-bold text-slate-400">Platform customer: ยังไม่ถูกสร้างจากธุรกรรมแพลตฟอร์ม</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs font-black">
                    <span className="rounded-full bg-blue-50 px-3 py-2 text-blue-700">ร้าน {identity.storeRelationshipCount}</span>
                    <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700">ยังไม่จัดสรร {identity.unassignedRelationshipCount}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {(identity.storeRelationships || []).map((relationship) => (
                    <div key={relationship.customerProfileId} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                        <Store className="h-4 w-4 text-blue-500" /> {relationship.branchName || `Branch #${relationship.branchId}`}
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-500">CustomerProfile #{relationship.customerProfileId} · {relationship.displayName || '-'}</p>
                    </div>
                  ))}
                  {(identity.unassignedRelationships || []).map((relationship) => (
                    <div key={relationship.customerProfileId} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                      <div className="flex items-center gap-2 text-sm font-black text-amber-800">
                        <ShieldCheck className="h-4 w-4" /> Legacy Unassigned
                      </div>
                      <p className="mt-1 text-xs font-semibold text-amber-700">CustomerProfile #{relationship.customerProfileId} · {relationship.displayName || '-'}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            {!data.results?.length && <div className="p-8 text-center text-sm font-bold text-slate-500">ไม่พบข้อมูล</div>}
          </div>
        )}
      </section>
    </div>
  );
};

export default PlatformCustomerOverviewPage;
