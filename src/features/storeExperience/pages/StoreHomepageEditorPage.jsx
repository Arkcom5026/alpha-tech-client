import { useEffect, useMemo, useState } from 'react';
import {
  getPartnerStoreCapability,
  getStoreExperienceDraft,
  savePartnerStoreCapability,
  saveStoreExperienceDraft,
} from '../api/storeExperienceApi';

const SECTION_OPTIONS = [
  ['HERO', 'ภาพเปิดร้าน'],
  ['FEATURED_PRODUCTS', 'สินค้าแนะนำ'],
  ['PRODUCT_GRID', 'สินค้าทั้งหมด'],
  ['FULFILLMENT', 'การรับสินค้า'],
  ['CONTACT', 'ช่องทางติดต่อ'],
];

const defaultCapability = {
  storefrontEnabled: false,
  storefrontSlug: '',
  displayName: '',
  contactPhone: '',
  pickupEnabled: true,
  deliveryEnabled: false,
  deliveryFeeMode: null,
  fixedDeliveryFee: null,
  serviceAreaMode: 'PICKUP_ONLY',
  maxDeliveryDistanceKm: null,
  preparationSlaMinutes: 60,
  pickupInstruction: 'รับสินค้าที่หน้าร้าน',
  deliveryInstruction: null,
  serviceAreas: [],
};

const defaultDraft = {
  status: 'DRAFT',
  themePreset: 'modern-light',
  themeTokens: {
    brandPrimary: '#1e40af',
    brandAccent: '#f59e0b',
    surface: '#ffffff',
    text: '#111827',
  },
  layoutPreset: 'catalog-grid',
  sectionConfiguration: SECTION_OPTIONS.map(([type], index) => ({
    id: `${type.toLowerCase().replaceAll('_', '-')}-${index + 1}`,
    type,
    enabled: true,
  })),
};

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

const StoreHomepageEditorPage = () => {
  const [capability, setCapability] = useState(defaultCapability);
  const [draft, setDraft] = useState(defaultDraft);
  const [state, setState] = useState({ loading: true, saving: false, error: '', success: '' });

  useEffect(() => {
    let active = true;
    Promise.all([getPartnerStoreCapability(), getStoreExperienceDraft()])
      .then(([nextCapability, nextDraft]) => {
        if (!active) return;
        setCapability({ ...defaultCapability, ...(nextCapability || {}) });
        setDraft({
          ...defaultDraft,
          ...(nextDraft || {}),
          themeTokens: { ...defaultDraft.themeTokens, ...(nextDraft?.themeTokens || {}) },
          sectionConfiguration: nextDraft?.sectionConfiguration || defaultDraft.sectionConfiguration,
        });
        setState({ loading: false, saving: false, error: '', success: '' });
      })
      .catch((error) => {
        if (!active) return;
        setState({ loading: false, saving: false, error: error?.response?.data?.message || error.message, success: '' });
      });
    return () => { active = false; };
  }, []);

  const enabledSections = useMemo(
    () => (draft.sectionConfiguration || []).filter((section) => section.enabled),
    [draft.sectionConfiguration]
  );

  const updateToken = (key, value) => setDraft((current) => ({
    ...current,
    themeTokens: { ...(current.themeTokens || {}), [key]: value },
  }));

  const toggleSection = (type) => setDraft((current) => ({
    ...current,
    sectionConfiguration: (current.sectionConfiguration || []).map((section) =>
      section.type === type ? { ...section, enabled: !section.enabled } : section
    ),
  }));

  const save = async () => {
    setState((current) => ({ ...current, saving: true, error: '', success: '' }));
    try {
      const capabilityPayload = {
        ...capability,
        storefrontSlug: String(capability.storefrontSlug || '').trim().toLowerCase(),
        displayName: String(capability.displayName || '').trim() || null,
        contactPhone: String(capability.contactPhone || '').trim() || null,
        fixedDeliveryFee: capability.deliveryEnabled && capability.deliveryFeeMode === 'FIXED'
          ? Number(capability.fixedDeliveryFee || 0)
          : null,
        maxDeliveryDistanceKm: capability.deliveryEnabled && capability.serviceAreaMode === 'DISTANCE'
          ? Number(capability.maxDeliveryDistanceKm || 0)
          : null,
        deliveryFeeMode: capability.deliveryEnabled ? capability.deliveryFeeMode : null,
        serviceAreaMode: capability.deliveryEnabled ? capability.serviceAreaMode : 'PICKUP_ONLY',
        serviceAreas: capability.deliveryEnabled && capability.serviceAreaMode === 'ADMIN_AREAS'
          ? capability.serviceAreas || []
          : [],
      };

      const [savedCapability, savedDraft] = await Promise.all([
        savePartnerStoreCapability(capabilityPayload),
        saveStoreExperienceDraft({
          themePreset: draft.themePreset,
          themeTokens: draft.themeTokens,
          layoutPreset: draft.layoutPreset,
          sectionConfiguration: draft.sectionConfiguration,
        }),
      ]);

      setCapability({ ...defaultCapability, ...(savedCapability || {}) });
      setDraft((current) => ({ ...current, ...(savedDraft || {}) }));
      setState({ loading: false, saving: false, error: '', success: 'บันทึกแบบร่างหน้าร้านเรียบร้อยแล้ว' });
    } catch (error) {
      setState({ loading: false, saving: false, error: error?.response?.data?.message || error.message, success: '' });
    }
  };

  if (state.loading) return <div className="rounded-2xl bg-white p-8 text-center shadow-sm">กำลังโหลดตัวแก้ไขหน้าร้าน...</div>;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Store Experience</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">ออกแบบหน้าหลักของร้าน</h1>
          <p className="mt-1 text-sm text-slate-500">ตั้งค่าข้อมูลร้าน ธีม และลำดับส่วนประกอบ ก่อนเผยแพร่สู่ลูกค้า</p>
        </div>
        <button type="button" onClick={save} disabled={state.saving} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">
          {state.saving ? 'กำลังบันทึก...' : 'บันทึกแบบร่าง'}
        </button>
      </section>

      {state.error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div> : null}
      {state.success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{state.success}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">ข้อมูลหน้าร้าน</h2>
            <div className="mt-4 grid gap-4">
              <label className="text-sm font-medium text-slate-700">ชื่อที่แสดง<input className={`${fieldClass} mt-1`} value={capability.displayName || ''} onChange={(event) => setCapability((current) => ({ ...current, displayName: event.target.value }))} /></label>
              <label className="text-sm font-medium text-slate-700">URL ร้าน<input className={`${fieldClass} mt-1`} value={capability.storefrontSlug || ''} onChange={(event) => setCapability((current) => ({ ...current, storefrontSlug: event.target.value }))} placeholder="advancetech" /></label>
              <label className="text-sm font-medium text-slate-700">เบอร์ติดต่อ<input className={`${fieldClass} mt-1`} value={capability.contactPhone || ''} onChange={(event) => setCapability((current) => ({ ...current, contactPhone: event.target.value }))} /></label>
              <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"><span>เปิดหน้าร้านสาธารณะ</span><input type="checkbox" checked={Boolean(capability.storefrontEnabled)} onChange={(event) => setCapability((current) => ({ ...current, storefrontEnabled: event.target.checked }))} /></label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">รูปแบบและสี</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">ธีม<select className={`${fieldClass} mt-1`} value={draft.themePreset} onChange={(event) => setDraft((current) => ({ ...current, themePreset: event.target.value }))}><option value="platform-default">มาตรฐานแพลตฟอร์ม</option><option value="modern-light">สว่างทันสมัย</option><option value="classic-slate">คลาสสิก</option></select></label>
              <label className="text-sm font-medium text-slate-700">เลย์เอาต์<select className={`${fieldClass} mt-1`} value={draft.layoutPreset} onChange={(event) => setDraft((current) => ({ ...current, layoutPreset: event.target.value }))}><option value="platform-default">มาตรฐานแพลตฟอร์ม</option><option value="catalog-grid">กริดสินค้า</option><option value="catalog-list">รายการสินค้า</option></select></label>
              {Object.entries(draft.themeTokens || {}).map(([key, value]) => <label key={key} className="text-sm font-medium text-slate-700">{key}<div className="mt-1 flex gap-2"><input type="color" value={value} onChange={(event) => updateToken(key, event.target.value)} className="h-11 w-14 rounded-lg border border-slate-200 bg-white p-1" /><input className={fieldClass} value={value} onChange={(event) => updateToken(key, event.target.value)} /></div></label>)}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">ส่วนประกอบหน้าร้าน</h2>
            <div className="mt-4 space-y-2">
              {SECTION_OPTIONS.map(([type, label]) => {
                const section = (draft.sectionConfiguration || []).find((item) => item.type === type);
                return <label key={type} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700"><span>{label}</span><input type="checkbox" checked={Boolean(section?.enabled)} onChange={() => toggleSection(type)} /></label>;
              })}
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
          <div className="border-b border-slate-200 bg-white px-5 py-3"><p className="text-sm font-semibold text-slate-700">ตัวอย่างแบบร่าง</p></div>
          <div style={{ background: draft.themeTokens?.surface, color: draft.themeTokens?.text }} className="min-h-[720px]">
            <header style={{ background: draft.themeTokens?.brandPrimary }} className="px-6 py-5 text-white"><p className="text-xs opacity-75">/{capability.storefrontSlug || 'your-store'}</p><h2 className="mt-1 text-2xl font-bold">{capability.displayName || 'ชื่อร้านของคุณ'}</h2></header>
            <div className="space-y-6 p-6">
              {enabledSections.map((section) => {
                if (section.type === 'HERO') return <div key={section.id} style={{ background: draft.themeTokens?.brandAccent }} className="rounded-2xl p-8 text-slate-900"><p className="text-sm font-semibold">ยินดีต้อนรับ</p><h3 className="mt-2 text-3xl font-black">เลือกสินค้าที่ใช่ จากร้านที่คุณไว้วางใจ</h3></div>;
                if (section.type === 'FEATURED_PRODUCTS') return <div key={section.id}><h3 className="mb-3 text-lg font-bold">สินค้าแนะนำ</h3><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-white p-4"><div className="aspect-square rounded-lg bg-slate-100" /><p className="mt-3 font-semibold">สินค้าตัวอย่าง {item}</p></div>)}</div></div>;
                if (section.type === 'PRODUCT_GRID') return <div key={section.id}><h3 className="mb-3 text-lg font-bold">สินค้าทั้งหมด</h3><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[1,2,3,4].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-white p-3"><div className="aspect-square rounded-lg bg-slate-100" /><p className="mt-2 text-sm font-semibold">สินค้า {item}</p></div>)}</div></div>;
                if (section.type === 'FULFILLMENT') return <div key={section.id} className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-bold">การรับสินค้า</h3><p className="mt-1 text-sm text-slate-600">{capability.pickupInstruction || 'รับสินค้าที่หน้าร้าน'}</p></div>;
                if (section.type === 'CONTACT') return <div key={section.id} className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-bold">ติดต่อร้าน</h3><p className="mt-1 text-sm text-slate-600">{capability.contactPhone || 'ยังไม่ได้ระบุเบอร์ติดต่อ'}</p></div>;
                return null;
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StoreHomepageEditorPage;
