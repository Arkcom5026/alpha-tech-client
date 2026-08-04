import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  claimUnassignedCustomer,
  listManagedCustomers,
} from '@/features/customer/api/customerApi';

const TABS = [
  { key: 'STORE', label: 'ลูกค้าของร้าน' },
  { key: 'UNASSIGNED', label: 'ลูกค้ากลางรอจัดสรร' },
];

const money = (value) =>
  Number(value || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || fallback;

const ListCustomersPage = () => {
  const navigate = useNavigate();
  const [scope, setScope] = useState('STORE');
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listManagedCustomers({ scope, query, limit: 200 });
      setCustomers(Array.isArray(data?.results) ? data.results : []);
    } catch (requestError) {
      setCustomers([]);
      setError(getErrorMessage(requestError, 'โหลดรายการลูกค้าไม่สำเร็จ'));
    } finally {
      setLoading(false);
    }
  }, [scope, query]);

  useEffect(() => {
    const timer = window.setTimeout(loadCustomers, 250);
    return () => window.clearTimeout(timer);
  }, [loadCustomers]);

  const changeScope = (nextScope) => {
    setScope(nextScope);
    setMessage('');
    setError('');
  };

  const claimCustomer = async (customer) => {
    const displayName = customer.name || customer.companyName || customer.phone || `#${customer.id}`;
    const confirmed = window.confirm(
      `ยืนยันรับ “${displayName}” เป็นลูกค้าของร้านนี้ใช่หรือไม่?`
    );
    if (!confirmed) return;

    setClaimingId(customer.id);
    setMessage('');
    setError('');
    try {
      await claimUnassignedCustomer(customer.id);
      setMessage('รับลูกค้าเข้าร้านเรียบร้อยแล้ว');
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'รับลูกค้าเข้าร้านไม่สำเร็จ'));
      await loadCustomers();
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">POS Customer Management</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">จัดการลูกค้า</h1>
              <p className="mt-1 text-sm text-slate-600">
                จัดการลูกค้าของร้าน และรับลูกค้าเดิมจากรายการกลางเข้าร้านอย่างชัดเจน
              </p>
            </div>

            <div className="w-full md:w-96">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                ค้นหาชื่อ เบอร์โทร อีเมล หรือเลขผู้เสียภาษี
              </label>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="พิมพ์คำค้นหา..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 p-3">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => changeScope(tab.key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  scope === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {message ? (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {message}
              </div>
            ) : null}
            {error ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {scope === 'STORE' ? 'ลูกค้าของร้าน' : 'ลูกค้ากลางรอจัดสรร'}
                </h2>
                <p className="text-sm text-slate-500">
                  {scope === 'STORE'
                    ? 'แสดงเฉพาะ CustomerProfile ของร้านปัจจุบัน'
                    : 'แสดงเฉพาะ CustomerProfile ที่ยังไม่มีร้านเจ้าของ'}
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {loading ? 'กำลังโหลด' : `${customers.length} ราย`}
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-slate-500">กำลังโหลดข้อมูลลูกค้า...</div>
            ) : customers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
                <p className="font-medium text-slate-700">ไม่พบข้อมูลลูกค้า</p>
                <p className="mt-1 text-sm text-slate-500">
                  {scope === 'UNASSIGNED'
                    ? 'ลูกค้ากลางจะลดลงเมื่อแต่ละร้านรับลูกค้าของตนเอง'
                    : 'ลองเปลี่ยนคำค้นหา หรือเพิ่มลูกค้าใหม่จากหน้าขาย'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">ลูกค้า</th>
                      <th className="px-4 py-3">การติดต่อ</th>
                      <th className="px-4 py-3">ประเภท</th>
                      <th className="px-4 py-3 text-right">ยอดมัดจำ</th>
                      <th className="px-4 py-3 text-right">หนี้คงค้าง</th>
                      <th className="px-4 py-3 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {customer.name || customer.companyName || `ลูกค้า #${customer.id}`}
                          </div>
                          {customer.companyName && customer.name ? (
                            <div className="text-xs text-slate-500">{customer.companyName}</div>
                          ) : null}
                          {customer.taxId ? (
                            <div className="text-xs text-slate-500">เลขภาษี {customer.taxId}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <div>{customer.phone || '-'}</div>
                          <div className="text-xs text-slate-500">{customer.email || '-'}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {customer.type === 'ORGANIZATION'
                            ? 'นิติบุคคล'
                            : customer.type === 'GOVERNMENT'
                              ? 'หน่วยงานรัฐ'
                              : 'บุคคลทั่วไป'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          {money(customer.depositBalance)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          {money(customer.outstandingDebt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {scope === 'STORE' ? (
                            <button
                              type="button"
                              onClick={() => navigate(String(customer.id))}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                            >
                              ดูรายละเอียด
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={claimingId === customer.id}
                              onClick={() => claimCustomer(customer)}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {claimingId === customer.id ? 'กำลังรับ...' : 'รับเป็นลูกค้าของร้าน'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListCustomersPage;
