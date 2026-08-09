import { useEffect, useMemo, useState } from 'react';
import StorefrontMediaUploadField from '../components/StorefrontMediaUploadField';
import {
  getPartnerStoreCapability,
  getStoreExperienceDraft,
  publishStoreExperience,
  savePartnerStoreCapability,
  saveStoreExperienceDraft,
  unpublishStoreExperience,
  uploadStorefrontMedia,
} from '../api/storeExperienceApi';

const PLATFORM_THEME_PRESET = 'platform-default';
const PLATFORM_LAYOUT_PRESET = 'platform-default';
const PLATFORM_TOKENS = {
  brandPrimary: '#1e40af',
  brandAccent: '#f59e0b',
  surface: '#ffffff',
  text: '#111827',
};

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

const defaultContentConfiguration = {
  logoUrl: '',
  coverImageUrl: '',
  storeHeadline: '',
  storeDescription: '',
  heroImageUrl: '',
  heroHeadline: 'เลือกสินค้าที่ใช่ จากร้านที่คุณไว้วางใจ',
  heroSupportingText: 'ค้นหาและเลือกซื้อสินค้าจากสต๊อกของร้านโดยตรง พร้อมราคาและสถานะล่าสุด',
  promotionTitle: '',
  promotionImageUrl: '',
  promotionCtaLabel: '',
  promotionCtaUrl: '',
};

const defaultDraft = {
  status: 'DRAFT',
  themePreset: PLATFORM_THEME_PRESET,
  themeTokens: PLATFORM_TOKENS,
  layoutPreset: PLATFORM_LAYOUT_PRESET,
  sectionConfiguration: SECTION_OPTIONS.map(([type], index) => ({
    id: `${type.toLowerCase().replaceAll('_', '-')}-${index + 1}`,
    type,
    enabled: true,
  })),
  contentConfiguration: defaultContentConfiguration,
};

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100';
const actionClass = 'rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60';

const StoreHomepageEditorPage = () => {
  const [capability, setCapability] = useState(defaultCapability);
  const [draft, setDraft] = useState(defaultDraft);
  const [state, setState] = useState({ loading: true, busy: false, error: '', success: '' });

  useEffect(() => {
    let active = true;
    Promise.all([getPartnerStoreCapability(), getStoreExperienceDraft()])
      .then(([nextCapability, nextDraft]) => {
        if (!active) return;
        setCapability({ ...defaultCapability, ...(nextCapability || {}) });
        setDraft({
          ...defaultDraft,
          ...(nextDraft || {}),
          themePreset: PLATFORM_THEME_PRESET,
          themeTokens: {
            ...PLATFORM_TOKENS,
            brandPrimary: nextDraft?.themeTokens?.brandPrimary || PLATFORM_TOKENS.brandPrimary,
            brandAccent: nextDraft?.themeTokens?.brandAccent || PLATFORM_TOKENS.brandAccent,
          },
          layoutPreset: PLATFORM_LAYOUT_PRESET,
          sectionConfiguration: nextDraft?.sectionConfiguration || defaultDraft.sectionConfiguration,
          contentConfiguration: {
            ...defaultContentConfiguration,
            ...(nextDraft?.contentConfiguration || {}),
          },
        });
        setState({ loading: false, busy: false, error: '', success: '' });
      })
      .catch((error) => {
        if (!active) return;
        setState({ loading: false, busy: false, error: error?.response?.data?.message || error.message, success: '' });
      });
    return () => { active = false; };
  }, []);

  const isPublished = draft.status === 'PUBLISHED';
  const enabledSections = useMemo(
    () => (draft.sectionConfiguration || []).filter((section) => section.enabled),
    [draft.sectionConfiguration]
  );
  const content = draft.contentConfiguration || defaultContentConfiguration;
  const tokens = { ...PLATFORM_TOKENS, ...(draft.themeTokens || {}) };

  const updateContent = (key, value) => setDraft((current) => ({
    ...current,
    contentConfiguration: {
      ...defaultContentConfiguration,
      ...(current.contentConfiguration || {}),
      [key]: value,
    },
  }));

  const updateBrandToken = (key, value) => setDraft((current) => ({
    ...current,
    themeTokens: {
      ...PLATFORM_TOKENS,
      ...(current.themeTokens || {}),
      [key]: value,
      surface: PLATFORM_TOKENS.surface,
      text: PLATFORM_TOKENS.text,
    },
  }));

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
    fixedDeliveryFee: capability.deliveryEnabled && capability.deliveryFeeMode === 'FIXED' ? Number(capability.fixedDeliveryFee || 0) : null,
    maxDeliveryDistanceKm: capability.deliveryEnabled && capability.serviceAreaMode === 'DISTANCE' ? Number(capability.maxDeliveryDistanceKm || 0) : null,
    deliveryFeeMode: capability.deliveryEnabled ? capability.deliveryFeeMode : null,
    serviceAreaMode: capability.deliveryEnabled ? capability.serviceAreaMode : 'PICKUP_ONLY',
    serviceAreas: capability.deliveryEnabled && capability.serviceAreaMode === 'ADMIN_AREAS' ? capability.serviceAreas || [] : [],
  });

  const draftPayload = () => ({
    themePreset: PLATFORM_THEME_PRESET,
    themeTokens: {
      ...PLATFORM_TOKENS,
      brandPrimary: tokens.brandPrimary,
      brandAccent: tokens.brandAccent,
    },
    layoutPreset: PLATFORM_LAYOUT_PRESET,
    sectionConfiguration: draft.sectionConfiguration,
    contentConfiguration: draft.contentConfiguration,
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
    setState({ loading: false, busy: false, error: '', success: isPublished
      ? 'บันทึกการแก้ไขเป็นแบบร่างแล้ว หน้าร้านสาธารณะยังใช้ฉบับที่เผยแพร่อยู่'
      : 'บันทึกแบบร่างหน้าร้านเรียบร้อยแล้ว' });
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
    setState({ loading: false, busy: false, error: '', success: 'เผยแพร่หน้าร้านเรียบร้อยแล้ว ลูกค้าสามารถเข้าชมฉบับล่าสุดได้ทันที' });
  });

  const unpublish = () => run(async () => {
    const result = await unpublishStoreExperience();
    setCapability((current) => ({ ...current, ...(result?.capability || {}), storefrontEnabled: false }));
    setDraft((current) => ({ ...current, ...(result?.experience || {}), status: 'DRAFT' }));
    setState({ loading: false, busy: false, error: '', success: 'ยกเลิกเผยแพร่แล้ว หน้าร้านกลับสู่แบบร่าง' });
  });

  const preview = () => {
    const slug = String(capability.storefrontSlug || '').trim();
    if (!slug) {
      setState((current) => ({ ...current, error: 'กรุณาระบุ URL ร้านก่อนดูหน้าร้าน', success: '' }));
      return;
    }
    window.open(`/${slug}`, '_blank', 'noopener,noreferrer');
  };

  if (state.loading) return <div className="rounded-2xl bg-white p-8 text-center shadow-sm">กำลังโหลดตัวแก้ไขหน้าร้าน...</div>;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Store Experience</p>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{isPublished ? 'LIVE' : 'DRAFT'}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">ออกแบบหน้าหลักของร้าน</h1>
          <p className="mt-1 text-sm text-slate-500">จัดการสีแบรนด์ โลโก้ ภาพหน้าร้าน โปรโมชั่น และข้อความภายในมาตรฐานเดียวของแพลตฟอร์ม</p>
          {isPublished ? <p className="mt-2 text-xs font-medium text-emerald-700">แก้ไขแบบร่างได้โดยไม่กระทบหน้าร้านที่เผยแพร่อยู่ จนกว่าจะกดเผยแพร่การเปลี่ยนแปลง</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={preview} className={`${actionClass} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}>ดูหน้าร้าน</button>
          <button type="button" onClick={save} disabled={state.busy} className={`${actionClass} bg-emerald-600 text-white hover:bg-emerald-700`}>บันทึกแบบร่าง</button>
          <button type="button" onClick={publish} disabled={state.busy} className={`${actionClass} bg-emerald-700 text-white hover:bg-emerald-800`}>{isPublished ? 'เผยแพร่การเปลี่ยนแปลง' : 'เผยแพร่หน้าร้าน'}</button>
          {isPublished ? <button type="button" onClick={unpublish} disabled={state.busy} className={`${actionClass} bg-amber-500 text-white hover:bg-amber-600`}>ยกเลิกเผยแพร่</button> : null}
        </div>
      </section>

      {state.error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div> : null}
      {state.success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{state.success}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,500px)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">ข้อมูลหน้าร้าน</h2>
            <div className="mt-4 grid gap-4">
              <label className="text-sm font-medium text-slate-700">ชื่อที่แสดง<input className={`${fieldClass} mt-1`} value={capability.displayName || ''} onChange={(event) => setCapability((current) => ({ ...current, displayName: event.target.value }))} /></label>
              <label className="text-sm font-medium text-slate-700">URL ร้าน<input className={`${fieldClass} mt-1`} value={capability.storefrontSlug || ''} onChange={(event) => setCapability((current) => ({ ...current, storefrontSlug: event.target.value }))} placeholder="advancetech" /></label>
              <label className="text-sm font-medium text-slate-700">เบอร์ติดต่อ<input className={`${fieldClass} mt-1`} value={capability.contactPhone || ''} onChange={(event) => setCapability((current) => ({ ...current, contactPhone: event.target.value }))} /></label>
              <div className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">สถานะสาธารณะ: <strong>{isPublished ? 'เปิดใช้งาน' : 'ยังไม่เผยแพร่'}</strong></div>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Platform Design Authority</p>
            <h2 className="mt-1 font-bold text-slate-900">แพลตฟอร์มควบคุมโครงสร้าง ร้านเลือกสีแบรนด์</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">ร้านเลือกสีหลักและสีเน้นได้ ส่วนรูปแบบตัวอักษร สีพื้นผิว สีข้อความ ระยะห่าง การตอบสนองบนมือถือ และองค์ประกอบการขายยังควบคุมโดย Alpha-Tech Platform</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">สีหลักของร้าน<div className="mt-1 flex items-center gap-3"><input type="color" aria-label="สีหลักของร้าน" value={tokens.brandPrimary} onChange={(event) => updateBrandToken('brandPrimary', event.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" /><input className={fieldClass} value={tokens.brandPrimary} onChange={(event) => updateBrandToken('brandPrimary', event.target.value)} /></div></label>
              <label className="text-sm font-medium text-slate-700">สีเน้นของร้าน<div className="mt-1 flex items-center gap-3"><input type="color" aria-label="สีเน้นของร้าน" value={tokens.brandAccent} onChange={(event) => updateBrandToken('brandAccent', event.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" /><input className={fieldClass} value={tokens.brandAccent} onChange={(event) => updateBrandToken('brandAccent', event.target.value)} /></div></label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">อัตลักษณ์และภาพหน้าร้าน</h2>
            <div className="mt-4 grid gap-4">
              <StorefrontMediaUploadField label="โลโก้ร้าน" purpose="STORE_LOGO" value={content.logoUrl} upload={uploadStorefrontMedia} onUploaded={(url) => updateContent('logoUrl', url)} disabled={state.busy} />
              <StorefrontMediaUploadField label="ภาพปกหน้าร้าน" purpose="STORE_COVER" value={content.coverImageUrl} upload={uploadStorefrontMedia} onUploaded={(url) => updateContent('coverImageUrl', url)} disabled={state.busy} />
              <label className="text-sm font-medium text-slate-700">URL โลโก้ร้าน (ทางเลือก)<input className={`${fieldClass} mt-1`} value={content.logoUrl} onChange={(event) => updateContent('logoUrl', event.target.value)} placeholder="https://.../logo.png" /></label>
              <label className="text-sm font-medium text-slate-700">URL ภาพปกหน้าร้าน (ทางเลือก)<input className={`${fieldClass} mt-1`} value={content.coverImageUrl} onChange={(event) => updateContent('coverImageUrl', event.target.value)} placeholder="https://.../cover.jpg" /></label>
              <label className="text-sm font-medium text-slate-700">หัวเรื่องร้าน<input className={`${fieldClass} mt-1`} value={content.storeHeadline} onChange={(event) => updateContent('storeHeadline', event.target.value)} placeholder="ร้านอุปกรณ์ไอทีที่ดูแลคุณครบทุกขั้นตอน" /></label>
              <label className="text-sm font-medium text-slate-700">คำอธิบายร้าน<textarea rows={3} className={`${fieldClass} mt-1 resize-none`} value={content.storeDescription} onChange={(event) => updateContent('storeDescription', event.target.value)} placeholder="แนะนำความเชี่ยวชาญ จุดเด่น และบริการของร้าน" /></label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Hero Banner</h2>
            <div className="mt-4 grid gap-4">
              <StorefrontMediaUploadField label="ภาพ Hero" purpose="STORE_HERO" value={content.heroImageUrl} upload={uploadStorefrontMedia} onUploaded={(url) => updateContent('heroImageUrl', url)} disabled={state.busy} />
              <label className="text-sm font-medium text-slate-700">URL ภาพ Hero (ทางเลือก)<input className={`${fieldClass} mt-1`} value={content.heroImageUrl} onChange={(event) => updateContent('heroImageUrl', event.target.value)} placeholder="https://.../hero.jpg" /></label>
              <label className="text-sm font-medium text-slate-700">ข้อความหลัก<input className={`${fieldClass} mt-1`} value={content.heroHeadline} onChange={(event) => updateContent('heroHeadline', event.target.value)} /></label>
              <label className="text-sm font-medium text-slate-700">ข้อความสนับสนุน<textarea rows={3} className={`${fieldClass} mt-1 resize-none`} value={content.heroSupportingText} onChange={(event) => updateContent('heroSupportingText', event.target.value)} /></label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">โปรโมชั่น</h2>
            <div className="mt-4 grid gap-4">
              <label className="text-sm font-medium text-slate-700">ชื่อโปรโมชั่น<input className={`${fieldClass} mt-1`} value={content.promotionTitle} onChange={(event) => updateContent('promotionTitle', event.target.value)} /></label>
              <StorefrontMediaUploadField label="ภาพโปรโมชั่น" purpose="STORE_PROMOTION" value={content.promotionImageUrl} upload={uploadStorefrontMedia} onUploaded={(url) => updateContent('promotionImageUrl', url)} disabled={state.busy} />
              <label className="text-sm font-medium text-slate-700">URL ภาพโปรโมชั่น (ทางเลือก)<input className={`${fieldClass} mt-1`} value={content.promotionImageUrl} onChange={(event) => updateContent('promotionImageUrl', event.target.value)} placeholder="https://.../promotion.jpg" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">ข้อความปุ่ม<input className={`${fieldClass} mt-1`} value={content.promotionCtaLabel} onChange={(event) => updateContent('promotionCtaLabel', event.target.value)} placeholder="ดูสินค้าโปรโมชั่น" /></label>
                <label className="text-sm font-medium text-slate-700">ลิงก์ปุ่ม<input className={`${fieldClass} mt-1`} value={content.promotionCtaUrl} onChange={(event) => updateContent('promotionCtaUrl', event.target.value)} placeholder="/advancetech?q=promotion" /></label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">ส่วนประกอบหน้าร้าน</h2>
            <div className="mt-4 space-y-2">
              {SECTION_OPTIONS.map(([type, label]) => {
                const section = (draft.sectionConfiguration || []).find((item) => item.type === type);
                return <label key={type} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700"><span>{label}</span><input type="checkbox" checked={Boolean(section?.enabled)} onChange={() => toggleSection(type)} className="accent-emerald-600" /></label>;
              })}
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
          <div className="border-b border-slate-200 bg-white px-5 py-3"><p className="text-sm font-semibold text-slate-700">ตัวอย่างเนื้อหาหน้าร้าน</p></div>
          <div className="min-h-[760px]" style={{ background: tokens.surface, color: tokens.text }}>
            <header className="relative overflow-hidden px-6 py-6 text-white" style={{ background: tokens.brandPrimary }}>
              {content.coverImageUrl ? <img src={content.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" /> : null}
              <div className="relative flex items-center gap-4">
                {content.logoUrl ? <img src={content.logoUrl} alt="โลโก้ร้าน" className="h-14 w-14 rounded-2xl border border-white/20 bg-white object-contain p-1" /> : <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-2xl">🏪</div>}
                <div><p className="text-xs text-white/70">/{capability.storefrontSlug || 'your-store'}</p><h2 className="mt-1 text-2xl font-black">{content.storeHeadline || capability.displayName || 'ชื่อร้านของคุณ'}</h2><p className="mt-1 text-sm text-white/75">{content.storeDescription || 'พื้นที่สำหรับข้อความแนะนำร้านของคุณ'}</p></div>
              </div>
            </header>
            <div className="space-y-6 p-6">
              {enabledSections.map((section) => {
                if (section.type === 'HERO') return <div key={section.id} className="relative overflow-hidden rounded-3xl p-8 text-slate-950" style={{ background: tokens.brandAccent }}>{content.heroImageUrl ? <img src={content.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" /> : null}<div className="relative"><p className="text-sm font-bold uppercase tracking-[0.18em]">ยินดีต้อนรับ</p><h3 className="mt-2 max-w-xl text-3xl font-black">{content.heroHeadline || defaultContentConfiguration.heroHeadline}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-slate-800">{content.heroSupportingText || defaultContentConfiguration.heroSupportingText}</p></div></div>;
                if (section.type === 'FEATURED_PRODUCTS') return <div key={section.id}><h3 className="mb-3 text-lg font-bold">สินค้าแนะนำ</h3><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-white p-4"><div className="aspect-square rounded-lg bg-slate-100" /><p className="mt-3 font-semibold">สินค้าตัวอย่าง {item}</p></div>)}</div></div>;
                if (section.type === 'PRODUCT_GRID') return <div key={section.id}><h3 className="mb-3 text-lg font-bold">สินค้าทั้งหมด</h3><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-white p-3"><div className="aspect-square rounded-lg bg-slate-100" /><p className="mt-2 text-sm font-semibold">สินค้า {item}</p></div>)}</div></div>;
                if (section.type === 'FULFILLMENT') return <div key={section.id} className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-bold">การรับสินค้า</h3><p className="mt-1 text-sm text-slate-600">{capability.pickupInstruction || 'รับสินค้าที่หน้าร้าน'}</p></div>;
                if (section.type === 'CONTACT') return <div key={section.id} className="rounded-xl p-5 text-white" style={{ background: tokens.brandPrimary }}><h3 className="font-bold">ติดต่อร้าน</h3><p className="mt-1 text-sm text-white/75">{capability.contactPhone || 'ยังไม่ได้ระบุเบอร์ติดต่อ'}</p></div>;
                return null;
              })}
              {content.promotionTitle || content.promotionImageUrl ? <section className="overflow-hidden rounded-3xl border border-slate-200 text-white" style={{ background: tokens.brandPrimary }}><div className="grid md:grid-cols-2">{content.promotionImageUrl ? <img src={content.promotionImageUrl} alt="โปรโมชั่น" className="h-full min-h-48 w-full object-cover" /> : <div className="min-h-48 bg-black/15" />}<div className="p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">Promotion</p><h3 className="mt-2 text-2xl font-black">{content.promotionTitle || 'โปรโมชั่นพิเศษจากร้าน'}</h3>{content.promotionCtaLabel ? <span className="mt-5 inline-flex rounded-xl px-4 py-2 text-sm font-bold text-slate-950" style={{ background: tokens.brandAccent }}>{content.promotionCtaLabel}</span> : null}</div></div></section> : null}
              {content.storeDescription ? <p className="rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">{content.storeDescription}</p> : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StoreHomepageEditorPage;
