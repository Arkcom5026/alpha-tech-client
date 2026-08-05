import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  claimUnassignedCustomer,
  listManagedCustomers,
} from '@/features/customer/api/customerApi';
import CustomerWorkspaceHeader from '@/features/customer/components/workspace/CustomerWorkspaceHeader';
import CustomerScopeTabs from '@/features/customer/components/workspace/CustomerScopeTabs';
import CustomerResultTable from '@/features/customer/components/workspace/CustomerResultTable';

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

  const title = scope === 'STORE' ? 'ลูกค้าของร้าน' : 'ลูกค้ากลางรอจัดสรร';
  const description = scope === 'STORE'
    ? 'แสดงเฉพาะลูกค้าที่อยู่ภายใต้ร้านปัจจุบัน'
    : 'แสดงเฉพาะลูกค้าที่ยังไม่มีร้านเจ้าของและพร้อมรับเข้าร้าน';

  return (
    <div className="min-h-full bg-slate-50 p-3 md:p-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <CustomerWorkspaceHeader query={query} onQueryChange={setQuery} />

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CustomerScopeTabs scope={scope} onChange={changeScope} />

          {message ? (
            <div className="mx-4 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">{title}</h2>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
            <div className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {loading ? 'กำลังโหลด' : `${customers.length} ราย`}
            </div>
          </div>

          <CustomerResultTable
            customers={customers}
            loading={loading}
            scope={scope}
            claimingId={claimingId}
            onOpen={(customer) => navigate(String(customer.id))}
            onClaim={claimCustomer}
          />
        </section>
      </div>
    </div>
  );
};

export default ListCustomersPage;
