import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useProductTemplateStore from '../store/productTemplateStore';

const Field = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-black text-slate-800">{value ?? '-'}</p>
  </div>
);

const Section = ({ title, children }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-base font-black text-slate-900">{title}</h2>
    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>
  </section>
);

const ProductTemplateGovernanceDetailPage = () => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();
  const { currentTemplate, isLoading, error, getTemplateByIdAction, toggleActiveAction } = useProductTemplateStore();

  React.useEffect(() => {
    if (id) getTemplateByIdAction(id);
  }, [id, getTemplateByIdAction]);

  const template = currentTemplate || {};
  const name = template.name || template.title || template.productName || 'Product Template';
  const active = template.active !== false;
  const backPath = shopSlug ? `/${shopSlug}/superadmin/catalog/templates` : '/superadmin/catalog/templates';

  const handleToggleActive = async () => {
    if (!id) return;
    await toggleActiveAction(id);
    await getTemplateByIdAction(id);
  };

  if (isLoading && !currentTemplate) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">กำลังโหลด Template...</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-700">{String(error)}</div>;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="mb-4 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50"
        >
          Back to Templates
        </button>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Template Catalog</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">{name}</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
              Canonical template detail. Promotion และ Catalog Governance ต้องไม่เขียนย้อนกลับไปแก้ Operational Product ของสาขา
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleActive}
            className={`rounded-2xl px-5 py-3 text-sm font-black text-white transition ${active ? 'bg-slate-800 hover:bg-slate-950' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {active ? 'Deactivate Template' : 'Activate Template'}
          </button>
        </div>
      </section>

      <Section title="General">
        <Field label="Template ID" value={template.id || id} />
        <Field label="Status" value={active ? 'ACTIVE' : 'INACTIVE'} />
        <Field label="Mode" value={template.mode} />
      </Section>

      <Section title="Catalog Information">
        <Field label="Brand" value={template.brandName || template.brand?.name} />
        <Field label="Category" value={template.categoryName || template.category?.name} />
        <Field label="Product Type" value={template.productTypeName || template.productType?.name} />
        <Field label="Unit" value={template.unitName || template.unit?.name} />
        <Field label="Track Serial Number" value={template.trackSerialNumber ? 'Yes' : 'No'} />
        <Field label="Last Updated" value={template.updatedAt || template.createdAt} />
      </Section>

      <Section title="Lifecycle">
        <Field label="Clone Source" value="Template Search" />
        <Field label="Runtime Boundary" value="No write-back to Operational Product" />
        <Field label="Audit" value="Pending backend audit trail" />
      </Section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-black text-slate-900">Raw Template Snapshot</h2>
        <pre className="mt-4 max-h-[420px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-50">
          {JSON.stringify(template, null, 2)}
        </pre>
      </section>
    </div>
  );
};

export default ProductTemplateGovernanceDetailPage;
