import { useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';

const themePresets = ['platform-default', 'modern-light', 'classic-slate'];
const layoutPresets = ['platform-default', 'catalog-grid', 'catalog-list'];
const sectionTypes = ['HERO', 'FEATURED_PRODUCTS', 'PRODUCT_GRID', 'CONTACT', 'FULFILLMENT'];

const initial = { themePreset: 'platform-default', layoutPreset: 'platform-default', themeTokens: {}, sectionConfiguration: [] };

export default function StoreExperienceDraftEditorPage() {
  const [draft, setDraft] = useState(initial);
  const [state, setState] = useState({ loading: true, saving: false, error: '', message: '' });

  useEffect(() => {
    apiClient.get('/store-experience/draft')
      .then(({ data }) => setDraft({ ...initial, ...(data?.data || {}) }))
      .catch((error) => setState((value) => ({ ...value, error: error?.response?.data?.message || error.message })))
      .finally(() => setState((value) => ({ ...value, loading: false })));
  }, []);

  const save = async () => {
    setState({ loading: false, saving: true, error: '', message: '' });
    try {
      const { data } = await apiClient.put('/store-experience/draft', {
        themePreset: draft.themePreset,
        layoutPreset: draft.layoutPreset,
        themeTokens: draft.themeTokens,
        sectionConfiguration: draft.sectionConfiguration,
      });
      setDraft({ ...initial, ...(data?.data || {}) });
      setState({ loading: false, saving: false, error: '', message: 'บันทึกฉบับร่างแล้ว' });
    } catch (error) {
      setState({ loading: false, saving: false, error: error?.response?.data?.message || error.message, message: '' });
    }
  };

  const addSection = () => setDraft((value) => ({
    ...value,
    sectionConfiguration: [...(value.sectionConfiguration || []), { id: `section-${Date.now()}`, type: 'PRODUCT_GRID', enabled: true }],
  }));

  if (state.loading) return <main className="p-6">กำลังโหลดการตั้งค่าหน้าร้าน...</main>;

  return <main className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
    <header><h1 className="text-2xl font-bold">ออกแบบหน้าร้านออนไลน์</h1><p className="text-sm text-slate-500">ตั้งค่าเฉพาะฉบับร่าง การเผยแพร่จะเป็นขั้นตอนถัดไป</p></header>
    {state.error ? <p className="rounded bg-red-50 p-3 text-red-700">{state.error}</p> : null}
    {state.message ? <p className="rounded bg-emerald-50 p-3 text-emerald-700">{state.message}</p> : null}
    <section className="grid gap-4 rounded border p-4 md:grid-cols-2">
      <label className="grid gap-1 text-sm font-medium">ธีม<select value={draft.themePreset} onChange={(e) => setDraft((v) => ({ ...v, themePreset: e.target.value }))} className="rounded border p-2">{themePresets.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="grid gap-1 text-sm font-medium">รูปแบบหน้า<select value={draft.layoutPreset} onChange={(e) => setDraft((v) => ({ ...v, layoutPreset: e.target.value }))} className="rounded border p-2">{layoutPresets.map((value) => <option key={value}>{value}</option>)}</select></label>
    </section>
    <section className="space-y-3 rounded border p-4"><div className="flex items-center justify-between"><h2 className="font-semibold">ส่วนประกอบหน้า</h2><button type="button" onClick={addSection} className="rounded border px-3 py-1">เพิ่มส่วน</button></div>
      {(draft.sectionConfiguration || []).map((section, index) => <div className="flex gap-3" key={section.id}><select value={section.type} onChange={(e) => setDraft((v) => ({ ...v, sectionConfiguration: v.sectionConfiguration.map((item, i) => i === index ? { ...item, type: e.target.value } : item) }))} className="rounded border p-2">{sectionTypes.map((value) => <option key={value}>{value}</option>)}</select><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={section.enabled} onChange={(e) => setDraft((v) => ({ ...v, sectionConfiguration: v.sectionConfiguration.map((item, i) => i === index ? { ...item, enabled: e.target.checked } : item) }))} />แสดง</label></div>)}
    </section>
    <button type="button" disabled={state.saving} onClick={save} className="rounded bg-orange-500 px-4 py-2 font-semibold text-white disabled:opacity-50">{state.saving ? 'กำลังบันทึก...' : 'บันทึกฉบับร่าง'}</button>
  </main>;
}
