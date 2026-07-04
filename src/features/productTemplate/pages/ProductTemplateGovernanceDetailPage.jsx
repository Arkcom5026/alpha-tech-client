import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useProductTemplateStore from '../store/productTemplateStore';
import TemplatePriceSnapshotPanel from '../components/TemplatePriceSnapshotPanel';
import TemplateImageGalleryPanel from '../components/TemplateImageGalleryPanel';
import TemplateGovernanceSummaryPanel from '../components/TemplateGovernanceSummaryPanel';

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

const Field = ({ label, value, accent = false }) => (
  <div className={`rounded-2xl border p-4 ${accent ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
    <p className="mt-1 break-words text-sm font-black text-slate-800">{formatValue(value)}</p>
  </div>
);

const Section = ({ title, description, children }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div>
      <h2 className="text-base font-black text-slate-900">{title}</h2>
      {description && <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>}
    </div>
    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>
  </section>
);

const StatusBadge = ({ active }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
    {active ? 'ACTIVE' : 'INACTIVE'}
  </span>
);

const ProductTemplateGovernanceDetailPage = () => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();
  const {
    currentTemplate,
    isLoading,
    isSaving,
    error,
    getTemplateByIdAction,
    archiveTemplateAction,
    restoreTemplateAction,
    clearCurrentTemplateAction,
  } = useProductTemplateStore();

  React.useEffect(() => {
    clearCurrentTemplateAction();
    if (id) getTemplateByIdAction(id);
  }, [id, getTemplateByIdAction, clearCurrentTemplateAction]);

  const template = currentTemplate || {};
  const name = template.name || template.title || template.productName || 'Product Template';
  const active = template.active !== false;
  const basePath = shopSlug ? `/${shopSlug}/superadmin/catalog/templates` : '/superadmin/catalog/templates';
  const backPath = basePath;
  const editPath = `${basePath}/${id}/edit`;

  const handleArchive = async () => {
    if (!id || isSaving) return;
    const confirmed = window.confirm('ปิดใช้งาน Product Template นี้หรือไม่? Operational Product ของสาขาจะไม่ถูกแก้ไข');
    if (!confirmed) return;
    await archiveTemplateAction(id);
  };

  const handleRestore = async () => {
    if (!id || isSaving) return;
    await restoreTemplateAction(id);
  };

  if (isLoading && !currentTemplate) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">กำลังโหลด Template...</div>;
  }

  if (error && !currentTemplate) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-700">{String(error)}</div>;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <button type="button" onClick={() => navigate(backPath)} className="mb-4 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50">
          ← Back to Templates
        </button>

        <div className="grid gap-5 lg:grid-cols-[1fr_220px] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Template Catalog</p>
              <StatusBadge active={active} />
            </div>
            <h1 className="mt-2 text-2xl font-black text-slate-900">{name}</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
              Canonical Template สำหรับค้นหาและเป็น clone source เท่านั้น การปิด/เปิด Template จะไม่เขียนย้อนกลับไปแก้ Operational Product ของสาขา
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => navigate(editPath)} disabled={isSaving || !id} className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-black text-orange-700 transition hover:bg-orange-100 disabled:opacity-60">
              Edit Template
            </button>
            {active ? (
              <button type="button" onClick={handleArchive} disabled={isSaving} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-950 disabled:opacity-60">
                {isSaving ? 'Saving...' : 'Deactivate Template'}
              </button>
            ) : (
              <button type="button" onClick={handleRestore} disabled={isSaving} className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
                {isSaving ? 'Saving...' : 'Activate Template'}
              </button>
            )}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
              Operational runtime is not edited here
            </div>
          </div>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{String(error)}</div>}

      <TemplateGovernanceSummaryPanel template={template} />

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <TemplateImageGalleryPanel template={template} />

        <div className="space-y-5">
          <Section title="General" description="ข้อมูลหลักของ Template Catalog">
            <Field label="Template ID" value={template.id || id} />
            <Field label="Status" value={active ? 'ACTIVE' : 'INACTIVE'} accent />
            <Field label="Mode" value={template.mode} />
            <Field label="Track Serial Number" value={template.trackSerialNumber ? 'Yes' : 'No'} />
            <Field label="No SN" value={template.noSN ? 'Yes' : 'No'} />
            <Field label="Warranty Days" value={template.warrantyDays} />
          </Section>

          <Section title="Catalog Classification" description="ใช้จัดกลุ่มการค้นหา Template และ Candidate Merge">
            <Field label="Brand" value={template.brandName || template.brand?.name} />
            <Field label="Category" value={template.categoryName || template.category?.name} />
            <Field label="Product Type" value={template.productTypeName || template.productType?.name} />
            <Field label="Unit" value={template.unitName || template.unit?.name} />
            <Field label="Code Type" value={template.codeType} />
            <Field label="Last Updated" value={formatDate(template.updatedAt || template.createdAt)} />
          </Section>
        </div>
      </div>

      <TemplatePriceSnapshotPanel template={template} />

      <Section title="Governance Lifecycle" description="สถานะเชิงสถาปัตยกรรมของ Template ใน Mission C">
        <Field label="Clone Source" value="Template Search" />
        <Field label="Runtime Boundary" value="No write-back to Operational Product" accent />
        <Field label="Candidate Link" value="Pending Candidate governance integration" />
        <Field label="Audit" value="Pending backend audit trail" />
        <Field label="Duplicate Control" value="Pending governance duplicate check" />
        <Field label="Promotion Source" value="Template Candidate or Admin Managed Template" />
      </Section>
    </div>
  );
};

export default ProductTemplateGovernanceDetailPage;
