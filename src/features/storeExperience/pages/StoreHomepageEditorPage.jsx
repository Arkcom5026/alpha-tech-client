import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  Eye,
  Globe2,
  ImagePlus,
  LayoutTemplate,
  Megaphone,
  Monitor,
  PackageSearch,
  Phone,
  Save,
  Smartphone,
  Store,
  Tablet,
  Unplug,
} from 'lucide-react';
import {
  getPartnerStoreCapability,
  getStoreExperienceDraft,
  publishStoreExperience,
  savePartnerStoreCapability,
  saveStoreExperienceDraft,
  unpublishStoreExperience,
} from '../api/storeExperienceApi';

const SECTION_OPTIONS = [
  ['HERO', 'ภาพเปิดร้าน', 'ภาพหลัก คำโปรย และข้อความต้อนรับลูกค้า', ImagePlus],
  ['FEATURED_PRODUCTS', 'สินค้าแนะนำ', 'นำเสนอสินค้าที่ร้านต้องการผลักดันเป็นพิเศษ', BadgeCheck],
  ['PRODUCT_GRID', 'สินค้าทั้งหมด', 'แสดงสินค้าพร้อมขายจากร้านในรูปแบบมาตรฐาน', PackageSearch],
  ['FULFILLMENT', 'การรับสินค้า', 'แจ้งวิธีรับสินค้าและบริการจัดส่งของร้าน', Building2],
  ['CONTACT', 'ช่องทางติดต่อ', 'แสดงข้อมูลติดต่อเพื่อสร้างความมั่นใจให้ลูกค้า', Phone],
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
  themePreset: 'platform-default',
  themeTokens: {
    brandPrimary: '#f97316',
    brandAccent: '#fb923c',
    surface: '#ffffff',
    text: '#0f172a',
  },
  layoutPreset: 'platform-default',
  sectionConfiguration: SECTION_OPTIONS.map(([type], index) => ({
    id: `${type.toLowerCase().replaceAll('_', '-')}-${index + 1}`,
    type,
    enabled: true,
  })),
};

const fieldClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100';
const actionClass = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60';

const StoreHomepageEditorPage = () => {
  const [capability, setCapability] = useState(defaultCapability);
  const [draft, setDraft] = useState(defaultDraft);
  const [state, setState] = useState({ loading: true, busy: false, error: '', success: '' });
  const [previewMode, setPreviewMode] = useState('desktop');
  const [activePanel, setActivePanel] = useState('identity');

  useEffect(() => {
    let active = true;
    Promise.all([getPartnerStoreCapability(), getStoreExperienceDraft()])
      .then(([nextCapability, nextDraft]) => {
        if (!active) return;
        setCapability({ ...defaultCapability, ...(nextCapability || {}) });
        setDraft({
          ...defaultDraft,
          ...(nextDraft || {}),
          themePreset: 'platform-default',
          layoutPreset: 'platform-default',
          themeTokens: defaultDraft.themeTokens,
          sectionConfiguration: nextDraft?.sectionConfiguration || defaultDraft.sectionConfiguration,
        });
        setState({ loading: false, busy: false, error: '', success: '' });
      })
      .catch((error) => {
        if (!active) return;
        setState({ loading: false, busy: false, error: error?.response?.data?.message || error.message, success: '' });
      });
    return () => { active = false; };
  }, []);

  const isLive = Boolean(capability.storefrontEnabled);
  const hasDraftChanges = isLive && draft.status !== 'PUBLISHED';
  const enabledSections = useMemo(
    () => (draft.sectionConfiguration || []).filter((section) => section.enabled),
    [draft.sectionConfiguration]
  );

  const toggleSection = (type) => setDraft((current) => ({
    ...current,
    sectionConfiguration: (current.sectionConfiguration || []).map((section) =>
      section.type === type ? { ...section, enabled: !section.enabled } : section
    ),
  }));

  const capabilityPayload = (enabled = capability.storefrontEnabled) => ({
    ...capability,
    storefrontEnabled: enabled,
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
  });

  const draftPayload = () => ({
    themePreset: 'platform-default',
    themeTokens: defaultDraft.themeTokens,
    layoutPreset: 'platform-default',
    sectionConfiguration: draft.sectionConfiguration,
  });

  const run = async (operation) => {
    setState((current) => ({ ...current, busy: true, error: '', success: '' }));
    try {
      await operation();
    } catch (error) {
      setState({ loading: false, busy: false, error: error?.response?.data?.message || error.message, success: '' });
    }
  };

  const save = () => run(async () => {
    const [savedCapability, savedDraft] = await Promise.all([
      savePartnerStoreCapability(capabilityPayload(capability.storefrontEnabled)),
      saveStoreExperienceDraft(draftPayload()),
    ]);
    setCapability({ ...defaultCapability, ...(savedCapability || {}) });
    setDraft((current) => ({ ...current, ...(savedDraft || {}) }));
    setState({ loading: false, busy: false, error: '', success: isLive ? 'บันทึกแบบร่างแล้ว หน้าร้านที่เผยแพร่ยังเปิดตามปกติ' : 'บันทึกแบบร่างหน้าร้านเรียบร้อยแล้ว' });
  });

  const publish = () => run(async () => {
    const [savedCapability, savedDraft] = await Promise.all([
      savePartnerStoreCapability(capabilityPayload(true)),
      saveStoreExperienceDraft(draftPayload()),
    ]);
    setCapability({ ...defaultCapability, ...(savedCapability || {}), storefrontEnabled: true });
    setDraft((current) => ({ ...current, ...(savedDraft || {}) }));
    const published = await publishStoreExperience();
    setCapability((current) => ({ ...current, ...(published?.capability || {}), storefrontEnabled: true }));
    setDraft((current) => ({ ...current, ...(published?.experience || {}), status: 'PUBLISHED' }));
    setState({ loading: false, busy: false, error: '', success: 'เผยแพร่หน้าร้านเรียบร้อยแล้ว ลูกค้าสามารถเข้าชมได้ทันที' });
  });

  const unpublish = () => run(async () => {
    const result = await unpublishStoreExperience();
    setCapability((current) => ({ ...current, ...(result?.capability || {}), storefrontEnabled: false }));
    setDraft((current) => ({ ...current, ...(result?.experience || {}), status: 'DRAFT' }));
    setState({ loading: false, busy: false, error: '', success: 'ปิดหน้าร้านสาธารณะแล้ว แบบร่างยังถูกเก็บไว้' });
  });

  const preview = () => {
    const slug = String(capability.storefrontSlug || '').trim();
    if (!slug) {
      setState((current) => ({ ...current, error: 'กรุณาระบุ URL ร้านก่อนดูหน้าร้าน', success: '' }));
      return;
    }
    window.open(`/${slug}`, '_blank', 'noopener,noreferrer');
  };

  if (state.loading) return <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-sm">กำลังเปิดสตูดิโอหน้าร้านออนไลน์...</div>;

  const previewWidth = previewMode === 'mobile' ? 'max-w-[390px]' : previewMode === 'tablet' ? 'max-w-[760px]' : 'max-w-none';

  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-100 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-orange-700"><Store className="h-3.5 w-3.5" /> Online Store Studio</span>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{isLive ? 'เผยแพร่แล้ว' : 'แบบร่าง'}</span>
              {hasDraftChanges ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">มีแบบร่างที่ยังไม่เผยแพร่</span> : null}
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950">จัดการภาพลักษณ์และเนื้อหาหน้าร้าน</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">ร้านปรับโลโก้ ภาพ แบนเนอร์ โปรโมชั่น และเนื้อหาได้เต็มที่ โดยใช้มาตรฐานภาพและประสบการณ์เดียวกับแพลตฟอร์ม</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={preview} className={`${actionClass} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}><Eye className="h-4 w-4" />ดูหน้าร้านจริง</button>
            <button type="button" onClick={save} disabled={state.busy} className={`${actionClass} bg-slate-900 text-white hover:bg-slate-800`}><Save className="h-4 w-4" />บันทึกแบบร่าง</button>
            <button type="button" onClick={publish} disabled={state.busy} className={`${actionClass} bg-orange-500 text-white hover:bg-orange-600`}><Globe2 className="h-4 w-4" />{isLive ? 'เผยแพร่การเปลี่ยนแปลง' : 'เผยแพร่หน้าร้าน'}</button>
          </div>
        </div>
        <div className="grid gap-3 bg-slate-50 px-6 py-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs font-bold text-slate-400">สถานะหน้าร้าน</p><p className="mt-1 font-black text-slate-900">{isLive ? 'ลูกค้าเข้าชมได้' : 'ยังไม่เปิดสาธารณะ'}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs font-bold text-slate-400">URL ร้าน</p><p className="mt-1 truncate font-black text-slate-900">/{capability.storefrontSlug || 'ยังไม่ได้กำหนด'}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs font-bold text-slate-400">มาตรฐานการแสดงผล</p><p className="mt-1 font-black text-slate-900">Alpha-Tech Platform Theme</p></div>
        </div>
      </section>

      {state.error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{state.error}</div> : null}
      {state.success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{state.success}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">พื้นที่จัดการ</p>
            {[
              ['identity', 'ภาพลักษณ์ร้าน', 'ชื่อร้าน URL และข้อมูลติดต่อ', Store],
              ['media', 'สื่อและแบนเนอร์', 'โลโก้ ภาพปก และโปรโมชั่น', Megaphone],
              ['homepage', 'เนื้อหาหน้าหลัก', 'เปิดหรือซ่อนส่วนประกอบ', LayoutTemplate],
            ].map(([value, label, description, Icon]) => (
              <button key={value} type="button" onClick={() => setActivePanel(value)} className={`mt-1 flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition ${activePanel === value ? 'bg-orange-50 text-orange-800' : 'text-slate-700 hover:bg-slate-50'}`}>
                <span className={`mt-0.5 rounded-xl p-2 ${activePanel === value ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}><Icon className="h-4 w-4" /></span>
                <span><span className="block text-sm font-black">{label}</span><span className="mt-0.5 block text-xs leading-5 text-slate-400">{description}</span></span>
              </button>
            ))}
          </section>

          {isLive ? <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5"><div className="flex items-start gap-3"><Unplug className="mt-0.5 h-5 w-5 text-amber-700" /><div><h2 className="font-black text-amber-950">การเปิดหน้าร้าน</h2><p className="mt-1 text-xs leading-5 text-amber-800">การบันทึกแบบร่างจะไม่ทำให้หน้าร้านที่เผยแพร่อยู่ปิดลง</p><button type="button" onClick={unpublish} disabled={state.busy} className="mt-4 text-xs font-black text-amber-800 underline underline-offset-4">ปิดหน้าร้านสาธารณะ</button></div></div></section> : null}
        </aside>

        <main className="space-y-6">
          {activePanel === 'identity' ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3"><span className="rounded-2xl bg-orange-50 p-3 text-orange-600"><Store className="h-5 w-5" /></span><div><h2 className="text-lg font-black text-slate-950">ภาพลักษณ์ร้าน</h2><p className="mt-1 text-sm text-slate-500">ข้อมูลหลักที่ลูกค้าจะเห็นและใช้จดจำร้านของคุณ</p></div></div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="text-sm font-bold text-slate-700">ชื่อร้านที่แสดง<input className={fieldClass} value={capability.displayName || ''} onChange={(event) => setCapability((current) => ({ ...current, displayName: event.target.value }))} placeholder="เช่น Advance Tech" /></label>
                <label className="text-sm font-bold text-slate-700">URL ร้าน<div className="mt-1.5 flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100"><span className="border-r border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-400">saduaksabuy.com/</span><input className="min-w-0 flex-1 px-3 py-3 text-sm outline-none" value={capability.storefrontSlug || ''} onChange={(event) => setCapability((current) => ({ ...current, storefrontSlug: event.target.value }))} placeholder="advancetech" /></div></label>
                <label className="text-sm font-bold text-slate-700 md:col-span-2">เบอร์ติดต่อ<input className={fieldClass} value={capability.contactPhone || ''} onChange={(event) => setCapability((current) => ({ ...current, contactPhone: event.target.value }))} placeholder="เบอร์ที่ลูกค้าสามารถติดต่อร้านได้" /></label>
              </div>
            </section>
          ) : null}

          {activePanel === 'media' ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3"><span className="rounded-2xl bg-orange-50 p-3 text-orange-600"><ImagePlus className="h-5 w-5" /></span><div><h2 className="text-lg font-black text-slate-950">สื่อและแบนเนอร์</h2><p className="mt-1 text-sm text-slate-500">พื้นที่สำหรับโลโก้ ภาพหน้าร้าน แบนเนอร์ และสื่อโปรโมชั่น</p></div></div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[['โลโก้ร้าน', 'สัดส่วนแนะนำ 1:1', 'เตรียมสำหรับ Increment Media Library'], ['ภาพปกหน้าร้าน', 'สัดส่วนแนะนำ 16:9', 'เตรียมสำหรับ Increment Hero Banner'], ['แบนเนอร์โปรโมชั่น', 'ใช้สื่อสารแคมเปญสำคัญ', 'เตรียมสำหรับ Increment Promotion Studio'], ['ภาพโฆษณาย่อย', 'ใช้เสริมเนื้อหาในหน้าหลัก', 'เตรียมสำหรับ Increment Content Blocks']].map(([title, description, status]) => <div key={title} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5"><div className="flex items-center justify-between"><span className="rounded-xl bg-white p-2.5 text-slate-500 shadow-sm"><ImagePlus className="h-5 w-5" /></span><span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-500">กำลังพัฒนา</span></div><h3 className="mt-4 font-black text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p><p className="mt-4 text-xs font-bold text-orange-600">{status}</p></div>)}
              </div>
            </section>
          ) : null}

          {activePanel === 'homepage' ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3"><span className="rounded-2xl bg-orange-50 p-3 text-orange-600"><LayoutTemplate className="h-5 w-5" /></span><div><h2 className="text-lg font-black text-slate-950">เนื้อหาหน้าหลัก</h2><p className="mt-1 text-sm text-slate-500">เลือกว่าเนื้อหาส่วนใดควรปรากฏบนหน้าร้าน โดยรูปแบบการแสดงผลควบคุมโดยแพลตฟอร์ม</p></div></div>
              <div className="mt-6 space-y-3">
                {SECTION_OPTIONS.map(([type, label, description, Icon]) => {
                  const section = (draft.sectionConfiguration || []).find((item) => item.type === type);
                  const enabled = Boolean(section?.enabled);
                  return <button key={type} type="button" onClick={() => toggleSection(type)} className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-orange-200 hover:bg-orange-50/40"><span className={`rounded-xl p-2.5 ${enabled ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'}`}><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block font-black text-slate-900">{label}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span></span><span className={`relative h-6 w-11 rounded-full transition ${enabled ? 'bg-orange-500' : 'bg-slate-300'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${enabled ? 'left-6' : 'left-1'}`} /></span></button>;
                })}
              </div>
            </section>
          ) : null}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black text-slate-900">ตัวอย่างหน้าร้าน</p><p className="mt-0.5 text-xs text-slate-500">ตัวอย่างใช้ธีมมาตรฐานของ Alpha-Tech และอัปเดตจากข้อมูลแบบร่าง</p></div><div className="inline-flex rounded-xl bg-slate-100 p-1">{[['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]].map(([mode, Icon]) => <button key={mode} type="button" onClick={() => setPreviewMode(mode)} className={`rounded-lg p-2 transition ${previewMode === mode ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}><Icon className="h-4 w-4" /></button>)}</div></div>
            <div className="overflow-auto p-4 md:p-6"><div className={`mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all ${previewWidth}`}><header className="border-b border-slate-100 bg-white px-5 py-4"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Online Store</p><h2 className="mt-0.5 text-lg font-black text-slate-950">{capability.displayName || 'ชื่อร้านของคุณ'}</h2></div><div className="flex items-center gap-2"><span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 sm:inline">สินค้า</span><span className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-black text-white">ตะกร้า</span></div></div></header><div className="space-y-6 bg-slate-50 p-4 md:p-6">{enabledSections.map((section) => {
                  if (section.type === 'HERO') return <div key={section.id} className="overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 p-7 text-white shadow-lg"><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-100">ยินดีต้อนรับ</p><h3 className="mt-3 max-w-xl text-3xl font-black leading-tight">เลือกสินค้าที่ใช่ จากร้านที่คุณไว้วางใจ</h3><p className="mt-3 max-w-lg text-sm leading-6 text-orange-50">ค้นหาสินค้าคุณภาพ พร้อมข้อมูลชัดเจนและการบริการจากร้านโดยตรง</p><span className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-black text-orange-600">เลือกซื้อสินค้า</span></div>;
                  if (section.type === 'FEATURED_PRODUCTS') return <div key={section.id}><div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-black text-slate-950">สินค้าแนะนำ</h3><span className="text-xs font-black text-orange-600">ดูทั้งหมด</span></div><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="aspect-square rounded-xl bg-slate-100" /><p className="mt-3 text-sm font-black text-slate-900">สินค้าตัวอย่าง {item}</p><p className="mt-1 text-sm font-black text-orange-600">฿0</p></div>)}</div></div>;
                  if (section.type === 'PRODUCT_GRID') return <div key={section.id}><h3 className="mb-3 text-lg font-black text-slate-950">สินค้าทั้งหมด</h3><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-3"><div className="aspect-square rounded-xl bg-slate-100" /><p className="mt-2 text-sm font-black text-slate-900">สินค้า {item}</p></div>)}</div></div>;
                  if (section.type === 'FULFILLMENT') return <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-black text-slate-950">รับสินค้าได้อย่างไร</h3><p className="mt-1 text-sm text-slate-600">{capability.pickupInstruction || 'รับสินค้าที่หน้าร้าน'}</p></div>;
                  if (section.type === 'CONTACT') return <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-black text-slate-950">ติดต่อร้าน</h3><p className="mt-1 text-sm text-slate-600">{capability.contactPhone || 'ยังไม่ได้ระบุเบอร์ติดต่อ'}</p></div>;
                  return null;
                })}</div></div></div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StoreHomepageEditorPage;
