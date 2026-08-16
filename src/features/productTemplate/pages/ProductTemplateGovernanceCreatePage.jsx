import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system';
import useProductTemplateStore from '../store/productTemplateStore';
import CatalogMasterSelect from '../components/CatalogMasterSelect';
import TemplatePriceSnapshotForm from '../components/TemplatePriceSnapshotForm';

const emptyForm = {
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
  costPrice: '',
  priceRetail: '',
  priceWholesale: '',
  priceOnline: '',
  priceTechnician: '',
  templateBranchCode: 'T01',
};

const optionalNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

const optionalId = (value) => {
  const n = optionalNumber(value);
  return n && n > 0 ? n : undefined;
};

const ProductTemplateGovernanceCreatePage = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const {
    isSaving,
    isLoadingMasters,
    error,
    masterOptions,
    addTemplateAction,
    fetchMasterOptionsAction,
  } = useProductTemplateStore();
  const [form, setForm] = React.useState(emptyForm);

  React.useEffect(() => {
    fetchMasterOptionsAction();
  }, [fetchMasterOptionsAction]);

  const listPath = shopSlug ? `/${shopSlug}/superadmin/catalog/templates` : '/superadmin/catalog/templates';
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) return;

    const payload = {
      name: String(form.name || '').trim(),
      productTypeId: optionalId(form.productTypeId),
      brandId: optionalId(form.brandId),
      categoryId: optionalId(form.categoryId),
      unitId: optionalId(form.unitId),
      mode: form.mode,
      active: !!form.active,
      trackSerialNumber: !!form.trackSerialNumber,
      noSN: !!form.noSN,
      codeType: String(form.codeType || '').trim() || undefined,
      warrantyDays: optionalNumber(form.warrantyDays),
      costPrice: optionalNumber(form.costPrice),
      priceRetail: optionalNumber(form.priceRetail),
      priceWholesale: optionalNumber(form.priceWholesale),
      priceOnline: optionalNumber(form.priceOnline),
      priceTechnician: optionalNumber(form.priceTechnician),
      templateBranchCode: String(form.templateBranchCode || '').trim() || undefined,
    };

    try {
      const created = await addTemplateAction(payload);
      feedback.actionSuccess('สร้าง Product Template เรียบร้อยแล้ว', `product-template:create:${created?.id || 'new'}:success`);
      if (created?.id) {
        navigate(`${listPath}/${created.id}`);
        return;
      }
      navigate(listPath);
    } catch (createError) {
      feedback.actionError(createError, 'ไม่สามารถสร้าง Product Template ได้', 'product-template:create:error');
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <button type="button" onClick={() => navigate(listPath)} disabled={isSaving} className="mb-4 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60">
          ← Back to Templates
        </button>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">Template Governance</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">New Product Template</h1>
        <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
          สร้าง Template Catalog กลางสำหรับใช้เป็นแหล่งค้นหาและ clone source เท่านั้น ไม่สร้างหรือแก้ Operational Product ของสาขา
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
              <h2 className="text-base font-black text-slate-900">Required Template Data</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                เลือกข้อมูลจาก Catalog Master เพื่อป้องกัน ID ผิดและทำให้ Template พร้อมใช้ใน Search/Clone
              </p>
            </div>
            {isLoadingMasters && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">Loading masters...</span>}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-2 md:col-span-2 xl:col-span-3">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Template Name *</span>
              <input value={form.name} onChange={(event) => setField('name', event.target.value)} required disabled={isSaving} className="min-h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60" placeholder="เช่น กล้องวงจรปิด VSTARCAM CG49 3MP SIM Indoor" />
            </label>

            <CatalogMasterSelect label="Product Type" required value={form.productTypeId} options={masterOptions.productTypes} onChange={(value) => setField('productTypeId', value)} disabled={isLoadingMasters || isSaving} />
            <CatalogMasterSelect label="Brand" value={form.brandId} options={masterOptions.brands} onChange={(value) => setField('brandId', value)} disabled={isLoadingMasters || isSaving} />
            <CatalogMasterSelect label="Category" value={form.categoryId} options={masterOptions.categories} onChange={(value) => setField('categoryId', value)} disabled={isLoadingMasters || isSaving} />
            <CatalogMasterSelect label="Unit" value={form.unitId} options={masterOptions.units} onChange={(value) => setField('unitId', value)} disabled={isLoadingMasters || isSaving} />

            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Mode</span>
              <select value={form.mode} onChange={(event) => setField('mode', event.target.value)} disabled={isSaving} className="min-h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none disabled:opacity-60">
                <option value="STRUCTURED">STRUCTURED</option>
                <option value="SIMPLE">SIMPLE</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Warranty Days</span>
              <input type="number" min="0" value={form.warrantyDays} onChange={(event) => setField('warrantyDays', event.target.value)} disabled={isSaving} className="min-h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60" />
            </label>
          </div>
        </section>

        <TemplatePriceSnapshotForm form={form} setField={setField} />

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-black text-slate-900">Governance Flags</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-700"><input type="checkbox" checked={!!form.active} onChange={(event) => setField('active', event.target.checked)} disabled={isSaving} />Active Template</label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-700"><input type="checkbox" checked={!!form.trackSerialNumber} onChange={(event) => setField('trackSerialNumber', event.target.checked)} disabled={isSaving} />Track Serial Number</label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-700"><input type="checkbox" checked={!!form.noSN} onChange={(event) => setField('noSN', event.target.checked)} disabled={isSaving} />No Serial Number</label>
          </div>
        </section>

        <div className="flex justify-end gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <button type="button" onClick={() => navigate(listPath)} disabled={isSaving} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">Cancel</button>
          <button type="submit" disabled={isSaving || !String(form.name || '').trim() || !form.productTypeId} className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
            {isSaving ? 'Creating...' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductTemplateGovernanceCreatePage;
