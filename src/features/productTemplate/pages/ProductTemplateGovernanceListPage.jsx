import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useProductTemplateStore from '../store/productTemplateStore';

const formatValue = (value, fallback = '-') => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
};

const getTemplateName = (template) =>
  formatValue(template?.name ?? template?.title ?? template?.productName, 'Untitled Template');

const getTemplateStatus = (template) => {
  if (template?.status) return String(template.status).toUpperCase();
  return template?.active === false ? 'INACTIVE' : 'ACTIVE';
};

const ProductTemplateGovernanceListPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();

  const {
    items,
    page,
    limit,
    totalPages,
    totalItems,
    includeInactive,
    search,
    isLoading,
    error,
    setPageAction,
    setLimitAction,
    setSearchAction,
    setIncludeInactiveAction,
    fetchListAction,
  } = useProductTemplateStore();

  React.useEffect(() => {
    fetchListAction({ page: 1, limit, includeInactive, search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const basePath = shopSlug ? `/${shopSlug}/superadmin/catalog/templates` : '/superadmin/catalog/templates';
  const activeVisible = items.filter((item) => getTemplateStatus(item) === 'ACTIVE').length;
  const inactiveVisible = items.length - activeVisible;

  const handleSearch = (event) => {
    event.preventDefault();
    setPageAction(1);
    fetchListAction({ page: 1, limit, includeInactive, search });
  };

  const handleRefresh = () => {
    fetchListAction({ page, limit, includeInactive, search });
  };

  const handleIncludeInactive = (checked) => {
    setIncludeInactiveAction(checked);
    setPageAction(1);
    fetchListAction({ page: 1, limit, includeInactive: checked, search });
  };

  const handleLimitChange = (nextLimit) => {
    setLimitAction(nextLimit);
    setPageAction(1);
    fetchListAction({ page: 1, limit: nextLimit, includeInactive, search });
  };

  const handlePageChange = (nextPage) => {
    setPageAction(nextPage);
    fetchListAction({ page: nextPage, limit, includeInactive, search });
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Catalog Governance</p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Product Templates</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
              Template Catalog กลางที่ผ่านการดูแลแล้ว ใช้เป็นแหล่งค้นหาและ clone source สำหรับ Operational Product ของสาขา
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-amber-700">
            Operational runtime is not edited here
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Total Templates</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{totalItems || items.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Active Visible</p>
          <p className="mt-2 text-2xl font-black text-emerald-700">{activeVisible}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Inactive Visible</p>
          <p className="mt-2 text-2xl font-black text-slate-700">{inactiveVisible}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            value={search || ''}
            onChange={(event) => setSearchAction(event.target.value)}
            placeholder="Search template name, brand, product type..."
            className="min-h-11 flex-1 rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          />
          <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600">
            <input
              type="checkbox"
              checked={!!includeInactive}
              onChange={(event) => handleIncludeInactive(event.target.checked)}
            />
            Include inactive
          </label>
          <select
            value={limit}
            onChange={(event) => handleLimitChange(Number(event.target.value))}
            className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700 outline-none"
          >
            {[10, 20, 50, 100].map((value) => (
              <option key={value} value={value}>{value} / page</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRefresh}
            className="min-h-11 rounded-2xl border border-slate-200 px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            disabled={isLoading}
          >
            Refresh
          </button>
          <button
            type="submit"
            className="min-h-11 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-orange-500 disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Search'}
          </button>
        </form>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {String(error)}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_110px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
          <div>Template</div>
          <div>Brand</div>
          <div>Product Type</div>
          <div>Updated</div>
          <div>Status</div>
        </div>

        {isLoading && items.length === 0 ? (
          <div className="p-8 text-center text-sm font-bold text-slate-500">กำลังโหลด Product Templates...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm font-bold text-slate-500">ยังไม่มี Product Template ในเงื่อนไขนี้</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((template) => {
              const status = getTemplateStatus(template);
              const id = template?.id;
              return (
                <button
                  key={id || getTemplateName(template)}
                  type="button"
                  onClick={() => id && navigate(`${basePath}/${id}`)}
                  className="grid w-full grid-cols-[1.6fr_1fr_1fr_1fr_110px] gap-3 px-4 py-4 text-left transition hover:bg-orange-50/70"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">{getTemplateName(template)}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                      Unit: {formatValue(template?.unitName ?? template?.unit?.name)} · Mode: {formatValue(template?.mode)} · ID: {formatValue(id)}
                    </p>
                  </div>
                  <div className="truncate text-sm font-bold text-slate-600">{formatValue(template?.brandName ?? template?.brand?.name)}</div>
                  <div className="truncate text-sm font-bold text-slate-600">{formatValue(template?.productTypeName ?? template?.productType?.name)}</div>
                  <div className="truncate text-sm font-bold text-slate-500">{formatDate(template?.updatedAt ?? template?.createdAt)}</div>
                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black ${status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-600 shadow-sm">
        <span>Total {totalItems || items.length} · Page {page} / {Math.max(totalPages || 1, 1)}</span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-40"
            disabled={page <= 1 || isLoading}
            onClick={() => handlePageChange(page - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-40"
            disabled={page >= Math.max(totalPages || 1, 1) || isLoading}
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductTemplateGovernanceListPage;
