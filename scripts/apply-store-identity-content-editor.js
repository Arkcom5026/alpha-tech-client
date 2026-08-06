import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const pagePath = path.join(root, 'src/features/storeExperience/pages/StoreHomepageEditorPage.jsx');

const fields = ['contentConfiguration:', 'tagline', 'shortDescription', 'hero.title', 'hero.description', 'hero.ctaLabel'];
let source = fs.readFileSync(pagePath, 'utf8');
const present = fields.filter((field) => source.includes(field));
if (present.length === fields.length) {
  console.log('store identity content editor already applied');
  process.exit(0);
}
if (present.length > 0) {
  throw new Error(`partial store identity content editor detected: ${present.join(', ')}`);
}

const replaceOnce = (anchor, replacement, label) => {
  const matches = source.split(anchor).length - 1;
  if (matches !== 1) throw new Error(`${label} anchor expected once, found ${matches}`);
  source = source.replace(anchor, replacement);
};

replaceOnce(
  "const defaultDraft = {\n",
  `const defaultContentConfiguration = {\n  identity: {\n    logoAssetId: null,\n    coverAssetId: null,\n    tagline: '',\n    shortDescription: '',\n  },\n  hero: {\n    desktopAssetId: null,\n    mobileAssetId: null,\n    eyebrow: '',\n    title: '',\n    description: '',\n    ctaLabel: 'เลือกซื้อสินค้า',\n    ctaTarget: '/products',\n  },\n  promotions: [],\n};\n\nconst defaultDraft = {\n`,
  'default content configuration'
);

replaceOnce(
  "  layoutPreset: 'platform-default',\n  sectionConfiguration:",
  "  layoutPreset: 'platform-default',\n  contentConfiguration: defaultContentConfiguration,\n  sectionConfiguration:",
  'default draft content configuration'
);

replaceOnce(
  "          themeTokens: defaultDraft.themeTokens,\n          sectionConfiguration:",
  "          themeTokens: defaultDraft.themeTokens,\n          contentConfiguration: {\n            ...defaultContentConfiguration,\n            ...(nextDraft?.contentConfiguration || {}),\n            identity: { ...defaultContentConfiguration.identity, ...(nextDraft?.contentConfiguration?.identity || {}) },\n            hero: { ...defaultContentConfiguration.hero, ...(nextDraft?.contentConfiguration?.hero || {}) },\n          },\n          sectionConfiguration:",
  'draft hydration'
);

replaceOnce(
  "    sectionConfiguration: draft.sectionConfiguration,\n  });",
  "    sectionConfiguration: draft.sectionConfiguration,\n    contentConfiguration: draft.contentConfiguration,\n  });",
  'draft payload'
);

replaceOnce(
  "                <label className=\"text-sm font-bold text-slate-700 md:col-span-2\">เบอร์ติดต่อ<input",
  `                <label className="text-sm font-bold text-slate-700">คำโปรยร้าน<input className={fieldClass} maxLength={80} value={draft.contentConfiguration?.identity?.tagline || ''} onChange={(event) => setDraft((current) => ({ ...current, contentConfiguration: { ...current.contentConfiguration, identity: { ...current.contentConfiguration?.identity, tagline: event.target.value } } }))} placeholder="เช่น อุปกรณ์ไอทีคุณภาพ พร้อมบริการหลังการขาย" /></label>\n                <label className="text-sm font-bold text-slate-700">คำอธิบายสั้น<input className={fieldClass} maxLength={160} value={draft.contentConfiguration?.identity?.shortDescription || ''} onChange={(event) => setDraft((current) => ({ ...current, contentConfiguration: { ...current.contentConfiguration, identity: { ...current.contentConfiguration?.identity, shortDescription: event.target.value } } }))} placeholder="แนะนำจุดเด่นของร้านให้ลูกค้ารู้จัก" /></label>\n                <label className="text-sm font-bold text-slate-700 md:col-span-2">เบอร์ติดต่อ<input`,
  'identity fields'
);

replaceOnce(
  "              <div className=\"mt-6 grid gap-4 md:grid-cols-2\">\n                {[['โลโก้ร้าน'",
  `              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">\n                <h3 className="font-black text-slate-950">ข้อความ Hero Banner</h3>\n                <div className="mt-4 grid gap-4 md:grid-cols-2">\n                  <label className="text-sm font-bold text-slate-700">หัวข้อหลัก<input className={fieldClass} maxLength={90} value={draft.contentConfiguration?.hero?.title || ''} onChange={(event) => setDraft((current) => ({ ...current, contentConfiguration: { ...current.contentConfiguration, hero: { ...current.contentConfiguration?.hero, title: event.target.value } } }))} placeholder="หัวข้อสำคัญที่ต้องการสื่อสาร" /></label>\n                  <label className="text-sm font-bold text-slate-700">ข้อความบนปุ่ม<input className={fieldClass} maxLength={30} value={draft.contentConfiguration?.hero?.ctaLabel || ''} onChange={(event) => setDraft((current) => ({ ...current, contentConfiguration: { ...current.contentConfiguration, hero: { ...current.contentConfiguration?.hero, ctaLabel: event.target.value } } }))} placeholder="เลือกซื้อสินค้า" /></label>\n                  <label className="text-sm font-bold text-slate-700 md:col-span-2">คำอธิบาย<textarea className={fieldClass} rows={3} maxLength={220} value={draft.contentConfiguration?.hero?.description || ''} onChange={(event) => setDraft((current) => ({ ...current, contentConfiguration: { ...current.contentConfiguration, hero: { ...current.contentConfiguration?.hero, description: event.target.value } } }))} placeholder="รายละเอียดสั้น ๆ ที่ช่วยให้ลูกค้าเข้าใจข้อเสนอ" /></label>\n                </div>\n              </div>\n              <div className="mt-6 grid gap-4 md:grid-cols-2">\n                {[['โลโก้ร้าน'`,
  'hero editor'
);

replaceOnce(
  "<h3 className=\"mt-3 max-w-xl text-3xl font-black leading-tight\">เลือกสินค้าที่ใช่ จากร้านที่คุณไว้วางใจ</h3><p className=\"mt-3 max-w-lg text-sm leading-6 text-orange-50\">ค้นหาสินค้าคุณภาพ พร้อมข้อมูลชัดเจนและการบริการจากร้านโดยตรง</p><span className=\"mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-black text-orange-600\">เลือกซื้อสินค้า</span>",
  "<h3 className=\"mt-3 max-w-xl text-3xl font-black leading-tight\">{draft.contentConfiguration?.hero?.title || draft.contentConfiguration?.identity?.tagline || 'เลือกสินค้าที่ใช่ จากร้านที่คุณไว้วางใจ'}</h3><p className=\"mt-3 max-w-lg text-sm leading-6 text-orange-50\">{draft.contentConfiguration?.hero?.description || draft.contentConfiguration?.identity?.shortDescription || 'ค้นหาสินค้าคุณภาพ พร้อมข้อมูลชัดเจนและการบริการจากร้านโดยตรง'}</p><span className=\"mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-black text-orange-600\">{draft.contentConfiguration?.hero?.ctaLabel || 'เลือกซื้อสินค้า'}</span>",
  'live hero preview'
);

fs.writeFileSync(pagePath, source, 'utf8');
console.log('store identity content editor applied');
