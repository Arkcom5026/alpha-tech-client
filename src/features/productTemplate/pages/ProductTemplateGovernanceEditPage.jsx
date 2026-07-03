import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useProductTemplateStore from '../store/productTemplateStore';
import CatalogMasterSelect from '../components/CatalogMasterSelect';

const toBool = (value) => value === true || value === 'true';
const optionalNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

const ProductTemplateGovernanceEditPage = () => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();
  const {
    currentTemplate,
    isLoading,
    isSaving,
    isLoadingMasters,
    error,
    masterOptions,
    getTemplateByIdAction,
    updateTemplateAction,
    clearCurrentTemplateAction,
    fetchMasterOptionsAction,
  } = useProductTemplateStore();

  const [form, setForm] = React.useState({
    name: '',
    productTypeId: '',
    brandId: '',
    categoryId: '',
    unitId: '',
    mode: 'STRUCTURED',
    active: true,
    trackSerialNumber: false,
    noSN: false,
    warrantyDays: '',
    codeType: '',
  });

  React.useEffect(() => {
    clearCurrentTemplateAction();
    if (id) getTemplateByIdAction(id);
    fetchMasterOptionsAction();
  }, [id, clearCurrentTemplateAction, getTemplateByIdAction, fetchMasterOptionsAction]);

  React.useEffect(() => {
    if (!currentTemplate) return;
    setForm({
      name: currentTemplate.name || currentTemplate.title || '',
      productTypeId: currentTemplate.productTypeId || '',
      brandId: currentTemplate.brandId || '',
      categoryId: currentTemplate.categoryId || '',
      unitId: currentTemplate.unitId || '',
      mode: currentTemplate.mode || 'STRUCTURED',
      active: currentTemplate.active !== false,
      trackSerialNumber: !!currentTemplate.trackSerialNumber,
      noSN: !!currentTemplate.noSN,
      warrantyDays: currentTemplate.warrantyDays ?? '',
      codeType: currentTemplate.codeType || '',
    });
  }, [currentTemplate]);

  const detailPath = shopSlug ? `/${shopSlug}/superadmin/catalog/templates/${id}` : `/superadmin/catalog/templates/${id}`;
  const listPath = shopSlug ? `/${shopSlug}/superadmin/catalog/templates` : '/superadmin/catalog/templates';
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: String(form.name || '').trim(),
      productTypeId: optionalNumber(form.productTypeId),
      brandId: optionalNumber(form.brandId),
      categoryId: optionalNumber(form.categoryId),
      unitId: optionalNumber(form.unitId),
      mode: form.mode,
      active: toBool(form.active),
      trackSerialNumber: toBool(form.trackSerialNumber),
      noSN: toBool(form.noSN),
      codeType: String(form.codeType || '').trim() || undefined,
      warrantyDays: form.warrantyDays === '' ? undefined : Number(form.warrantyDays),
    };

    const updated = await updateTemplateAction(id, payload);
    if (updated) navigate(detailPath);
  };

  if (isLoading && !currentTemplate) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">กำลังโหลด Template...</div>;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(currentTemplate ? detailPath : listPath)}
          className="mb-4 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50"
        >
          ← Back
        </button>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Template Governance</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Edit Product Template</h1>
        <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
          แก้ไขเฉพาะ Template Catalog กลางเท่านั้น ไม่แก้ Operational Product หรือ BranchPrice ของสาขา
        </p>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{String(error)}</div>}
      {masterOptions?.errors?.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-700">
          โหลด Catalog Master บางส่วนไม่สำเร็จ: {masterOptions.errors.join(', ')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">General</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">ปรับข้อมูล Template Catalog โดยเลือก master data จากแหล่งกลาง</p>
            </div>
            {isLoadingMasters && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">Loading masters...</span>}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-2 md:col-span-2 xl:col-span-3">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Template Name</span>
              <input
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
                required
                className="min-h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              />
            </label>

            <CatalogMasterSelect label="Product Type" required value={form.productTypeId} options={masterOptions.productTypes} onChange={(value) => setField('productTypeId', value)} disabled={isLoadingMasters} />
            <CatalogMasterSelect label="Brand" value={form.brandId} options={masterOptions.brands} onChange={(value) => setField('brandId', value)} disabled={isLoadingMasters} />
            <CatalogMasterSelect label="Category" value={form.categoryId} options={masterOptions.categories} onChange={(value) => setField('categoryId', value)} disabled={isLoadingMasters} />
            <CatalogMasterSelect label="Unit" value={form.unitId} options={masterOptions.units} onChange={(value) => setField('unitId', value)} disabled={isLoadingMasters} />

            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Mode</span>
              <select
                value={form.mode}
                onChange={(event) => setField('mode', event.target.value)}
                className="min-h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none"
              >
                <option value="STRUCTURED">STRUCTURED</option>
                <option value="SIMPLE">SIMPLE</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Warranty Days</span>
              <input
                type="number"
                min="0"
                value={form.warrantyDays}
                onChange={(event) => setField('warrantyDays', event.target.value)}
                className="min-h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Code Type</span>
              <input
                value={form.codeType}
                onChange={(event) => setField('codeType', event.target.value)}
                className="min-h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-black text-slate-900">Governance Flags</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-700"><input type="checkbox" checked={!!form.active} onChange={(event) => setField('active', event.target.checked)} />Active Template</label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-700"><input type="checkbox" checked={!!form.trackSerialNumber} onChange={(event) => setField('trackSerialNumber', event.target.checked)} />Track Serial Number</label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-700"><input type="checkbox" checked={!!form.noSN} onChange={(event) => setField('noSN', event.target.checked)} />No Serial Number</label>
          </div>
        </section>

        <div className="flex justify-end gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <button type="button" onClick={() => navigate(detailPath)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={isSaving || !String(form.name || '').trim() || !form.productTypeId} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-500 disabled:opacity-60">
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductTemplateGovernanceEditPage;
