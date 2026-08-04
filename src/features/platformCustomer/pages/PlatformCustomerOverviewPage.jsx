import React, { useEffect, useMemo, useState } from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { getPlatformCustomerOverview } from '../api/platformCustomerApi';

const initialFilters = {
  query: '',
  branchId: '',
  provinceCode: '',
  districtCode: '',
  relationshipStatus: 'ALL',
  customerType: '',
  accountStatus: 'ALL',
};

const relationshipLabels = {
  ALL: 'ทุกความสัมพันธ์',
  STORE: 'มีร้าน',
  UNASSIGNED: 'Legacy ยังไม่จัดสรร',
  MULTI_STORE: 'หลายร้าน',
  NO_RELATIONSHIP: 'ยังไม่มีความสัมพันธ์',
};

const customerTypeLabels = {
  INDIVIDUAL: 'บุคคลทั่วไป',
  COMPANY: 'นิติบุคคล',
  GOVERNMENT: 'หน่วยงานรัฐ',
};

const accountStatusLabels = {
  ALL: 'ทุกสถานะบัญชี',
  ENABLED: 'เปิดใช้งาน',
  DISABLED: 'ปิดใช้งาน',
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const resolveCustomerTypes = (identity) => {
  const values = [
    ...(identity.storeRelationships || []).map((item) => item.customerType),
    ...(identity.unassignedRelationships || []).map((item) => item.customerType),
  ].filter(Boolean);

  return [...new Set(values)].map((value) => customerTypeLabels[value] || value).join(', ') || '-';
};

const resolveStoreSummary = (identity) => {
  const stores = identity.storeRelationships || [];
  if (!stores.length) return null;

  return stores.map((relationship) => ({
    key: relationship.customerProfileId,
    branchName: relationship.branchName || `Branch #${relationship.branchId}`,
    profileName: relationship.displayName || '-',
    location: [relationship.districtName, relationship.provinceName].filter(Boolean).join(' · ') || 'ไม่พบข้อมูลพื้นที่ร้าน',
    customerProfileId: relationship.customerProfileId,
  }));
};

const relationshipBadgeClass = (status) => {
  if (status === 'MULTI_STORE') return 'bg-blue-50 text-blue-700';
  if (status === 'UNASSIGNED') return 'bg-amber-50 text-amber-700';
  if (status === 'STORE') return 'bg-emerald-50 text-emerald-700';
  return 'bg-slate-100 text-slate-600';
};

const PlatformCustomerOverviewPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState({ count: 0, results: [], filterOptions: {}, summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (nextFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      setData(await getPlatformCustomerOverview(nextFilters));
    } catch (cause) {
      setError(cause?.response?.data?.message || 'โหลดข้อมูลลูกค้าแพลตฟอร์มไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(initialFilters);
  }, []);

  const options = data.filterOptions || {};
  const districts = useMemo(
    () =>
      (options.districts || []).filter(
        (district) => !filters.provinceCode || district.provinceCode === filters.provinceCode,
      ),
    [options.districts, filters.provinceCode],
  );
  const branches = useMemo(
    () =>
      (options.branches || []).filter(
        (branch) =>
          (!filters.provinceCode || branch.provinceCode === filters.provinceCode) &&
          (!filters.districtCode || branch.districtCode === filters.districtCode),
      ),
    [options.branches, filters.provinceCode, filters.districtCode],
  );

  const updateFilter = (name, value) => {
    setFilters((current) => {
      const next = { ...current, [name]: value };
      if (name === 'provinceCode') {
        next.districtCode = '';
        next.branchId = '';
      }
      if (name === 'districtCode') next.branchId = '';
      return next;
    });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    load(filters);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    load(initialFilters);
  };

  const summary = data.summary || {};

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Customer Governance</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">Platform Customer Overview</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
              ภาพรวมตัวตนระดับแพลตฟอร์มและความสัมพันธ์กับร้านแบบอ่านอย่างเดียว โดยกรองพื้นที่จากร้านที่ CustomerProfile ผูกอยู่
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
            READ ONLY
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[280px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={filters.query}
                onChange={(event) => updateFilter('query', event.target.value)}
                placeholder="ค้นหาเบอร์โทร อีเมล ชื่อ บริษัท หรือเลขผู้เสียภาษี"
                className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:border-orange-400"
              />
            </div>
            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white">ค้นหา</button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-600 hover:border-orange-300 hover:text-orange-600"
            >
              <RotateCcw className="h-4 w-4" /> ล้างตัวกรอง
            </button>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2 xl:grid-cols-6">
            <label className="space-y-1">
              <span className="text-xs font-black text-slate-500">จังหวัดของร้าน</span>
              <select value={filters.provinceCode} onChange={(event) => updateFilter('provinceCode', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold">
                <option value="">ทุกจังหวัด</option>
                {(options.provinces || []).map((province) => <option key={province.code} value={province.code}>{province.name}</option>)}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-black text-slate-500">อำเภอของร้าน</span>
              <select value={filters.districtCode} onChange={(event) => updateFilter('districtCode', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold">
                <option value="">ทุกอำเภอ</option>
                {districts.map((district) => <option key={district.code} value={district.code}>{district.name}</option>)}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-black text-slate-500">ร้าน</span>
              <select value={filters.branchId} onChange={(event) => updateFilter('branchId', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold">
                <option value="">ทุกร้าน</option>
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-black text-slate-500">ความสัมพันธ์</span>
              <select value={filters.relationshipStatus} onChange={(event) => updateFilter('relationshipStatus', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold">
                {Object.entries(relationshipLabels).filter(([value]) => value !== 'NO_RELATIONSHIP').map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-black text-slate-500">ประเภทลูกค้า</span>
              <select value={filters.customerType} onChange={(event) => updateFilter('customerType', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold">
                <option value="">ทุกประเภท</option>
                {Object.entries(customerTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-black text-slate-500">สถานะบัญชี</span>
              <select value={filters.accountStatus} onChange={(event) => updateFilter('accountStatus', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold">
                {Object.entries(accountStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Filter className="h-4 w-4 text-orange-500" /> จังหวัดและอำเภออ้างอิงจากที่ตั้งของร้าน ไม่ใช่ที่อยู่ส่วนตัวของลูกค้า
          </div>
        </form>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          ['Platform Identities', summary.identities || 0],
          ['Store Relationships', summary.storeRelationships || 0],
          ['Legacy Unassigned', summary.unassignedRelationships || 0],
          ['Multi-store Identities', summary.multiStoreIdentities || 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="font-black text-slate-900">Platform Identities</h2>
            <p className="mt-1 text-xs font-semibold text-slate-400">ตารางตัวตนและความสัมพันธ์กับร้านแบบอ่านอย่างเดียว</p>
          </div>
          <span className="text-sm font-bold text-slate-500">{data.count || 0} รายการ</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm font-bold text-slate-500">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="border-b border-r border-slate-200 px-4 py-3">ลำดับ</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3">User ID</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3">เบอร์ / Login</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3">อีเมล</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3">ประเภทลูกค้า</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3">สถานะบัญชี</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3">วันที่สมัคร</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3">Login ล่าสุด</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3">สถานะความสัมพันธ์</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3 text-center">จำนวนร้าน</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3 text-center">Legacy NULL</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3">ร้านที่เกี่ยวข้อง</th>
                  <th className="border-b border-slate-200 px-4 py-3">Platform Customer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.results || []).map((identity, index) => {
                  const stores = resolveStoreSummary(identity);
                  return (
                    <tr key={identity.userId} className="align-top hover:bg-orange-50/30">
                      <td className="border-r border-slate-100 px-4 py-4 font-bold text-slate-500">{index + 1}</td>
                      <td className="border-r border-slate-100 px-4 py-4 font-black text-slate-900">#{identity.userId}</td>
                      <td className="border-r border-slate-100 px-4 py-4 font-semibold text-slate-700">{identity.loginId || '-'}</td>
                      <td className="border-r border-slate-100 px-4 py-4 font-semibold text-slate-600">{identity.email || '-'}</td>
                      <td className="border-r border-slate-100 px-4 py-4 font-semibold text-slate-600">{resolveCustomerTypes(identity)}</td>
                      <td className="border-r border-slate-100 px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ${identity.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {identity.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap border-r border-slate-100 px-4 py-4 font-semibold text-slate-600">{formatDateTime(identity.createdAt)}</td>
                      <td className="whitespace-nowrap border-r border-slate-100 px-4 py-4 font-semibold text-slate-600">{formatDateTime(identity.lastLoginAt)}</td>
                      <td className="border-r border-slate-100 px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ${relationshipBadgeClass(identity.relationshipStatus)}`}>
                          {relationshipLabels[identity.relationshipStatus] || identity.relationshipStatus}
                        </span>
                      </td>
                      <td className="border-r border-slate-100 px-4 py-4 text-center font-black text-blue-700">{identity.storeRelationshipCount}</td>
                      <td className="border-r border-slate-100 px-4 py-4 text-center font-black text-amber-700">{identity.unassignedRelationshipCount}</td>
                      <td className="border-r border-slate-100 px-4 py-4">
                        {stores ? (
                          <div className="space-y-2">
                            {stores.map((store) => (
                              <div key={store.key} className="min-w-[280px] rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                                <p className="font-black text-slate-800">{store.branchName}</p>
                                <p className="mt-1 text-xs font-semibold text-slate-500">CustomerProfile #{store.customerProfileId} · {store.profileName}</p>
                                <p className="mt-1 text-xs font-bold text-slate-400">{store.location}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex min-w-[170px] rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">
                          ยังไม่ถูกสร้างจากธุรกรรมแพลตฟอร์ม
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!data.results?.length && <div className="p-8 text-center text-sm font-bold text-slate-500">ไม่พบข้อมูล</div>}
          </div>
        )}
      </section>
    </div>
  );
};

export default PlatformCustomerOverviewPage;
