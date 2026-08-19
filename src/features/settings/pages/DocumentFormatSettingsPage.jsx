import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Image, Info, LayoutTemplate, RotateCcw, Save, Type } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { feedback } from '@/design-system/feedback';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  DOCUMENT_LOGO_SIZE_DEFAULT,
  DOCUMENT_LOGO_SIZE_MAX,
  DOCUMENT_LOGO_SIZE_MIN,
  buildDocumentHeaderConfigFromForm,
  normalizeLogoSize,
  projectDocumentHeaderFormDefaults,
} from '@/features/branch/documentHeader/documentHeaderConfig';
import CombinedBillingPresentationSettingsCard from '@/features/settings/components/CombinedBillingPresentationSettingsCard';
import CustomerReceiptPresentationSettingsCard from '@/features/settings/components/CustomerReceiptPresentationSettingsCard';
import DeliveryNotePresentationSettingsCard from '@/features/settings/components/DeliveryNotePresentationSettingsCard';
import FinanceOperationalPresentationSettingsCard from '@/features/settings/components/FinanceOperationalPresentationSettingsCard';
import PurchaseOrderPresentationSettingsCard from '@/features/settings/components/PurchaseOrderPresentationSettingsCard';
import QuotationPresentationSettingsCard from '@/features/settings/components/QuotationPresentationSettingsCard';
import StatutoryPresentationSettingsCard from '@/features/settings/components/StatutoryPresentationSettingsCard';
import StorefrontMediaUploadField from '@/features/storeExperience/components/StorefrontMediaUploadField';
import { uploadStorefrontMedia } from '@/features/storeExperience/api/storeExperienceApi';

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100';
const labelClassName = 'mb-1.5 block text-xs font-black text-slate-600';

const DOCUMENT_FORMAT_WORKSPACES = [
  { value: 'STORE_HEADER', label: 'หัวเอกสารร้าน', group: 'ค่าเริ่มต้นร้าน', description: 'กำหนดโลโก้ ชื่อร้าน ที่อยู่ เบอร์โทร และรูปแบบหัวเอกสารที่ใช้เป็นค่าเริ่มต้นร่วมกัน' },
  { value: 'QUOTATION', label: 'ใบเสนอราคา', group: 'เอกสารขาย', description: 'กำหนดเงื่อนไขการเสนอราคา การชำระเงิน การส่งมอบ บัญชีรับโอน หมายเหตุ และข้อความท้ายเอกสาร' },
  { value: 'DELIVERY_NOTE', label: 'ใบส่งของ', group: 'เอกสารขาย', description: 'กำหนดเงื่อนไขการส่งมอบ หมายเหตุ ข้อความท้ายเอกสาร และพื้นที่ลายเซ็นของใบส่งของ' },
  { value: 'CUSTOMER_RECEIPT', label: 'ใบเสร็จรับเงิน', group: 'เอกสารขาย', description: 'กำหนดหมายเหตุและข้อความท้ายใบเสร็จ โดยไม่แก้ไขข้อมูลการรับเงินจริงของเอกสาร' },
  { value: 'CUSTOMER_MONEY_RECEIPT', label: 'ใบรับเงิน Customer Money', group: 'การเงิน', description: 'กำหนดหมายเหตุและข้อความท้ายใบรับเงินจริง โดยข้อความ authority ของ Customer Money ยังคงถูกล็อก' },
  { value: 'DELIVERY_CREDIT_SETTLEMENT', label: 'เอกสารตัดยอดใบส่งของเครดิต', group: 'การเงิน', description: 'กำหนดหมายเหตุและข้อความท้ายเอกสารตัดยอด โดยไม่เปลี่ยน financial authority หรือ stock movement' },
  { value: 'REFUND_RECEIPT', label: 'ใบรับเงินคืน', group: 'การเงิน', description: 'กำหนดหมายเหตุและข้อความท้ายใบรับเงินคืน โดยยอดคืนและหลักฐานการคืนเงินยังเป็นข้อมูลธุรกิจที่ถูกล็อก' },
  { value: 'PURCHASE_ORDER', label: 'ใบสั่งซื้อ', group: 'จัดซื้อ', description: 'กำหนดเงื่อนไขทางการค้า การชำระเงิน การส่งมอบ หมายเหตุ และข้อความท้ายใบสั่งซื้อ' },
  { value: 'COMBINED_BILLING', label: 'เอกสารรวมบิล', group: 'เอกสารรวม', description: 'กำหนดข้อความเสริมของเอกสารรวมบิล โดยข้อมูลผู้ออกเอกสารถูกอ่านจาก Store Presentation' },
  { value: 'FULL_TAX_INVOICE', label: 'ใบกำกับภาษีเต็มรูป', group: 'เอกสารภาษี', description: 'กำหนดเฉพาะองค์ประกอบ presentation ที่กฎหมายอนุญาต ข้อมูลภาษีหลักมาจาก TaxDocument snapshot' },
  { value: 'CREDIT_NOTE', label: 'ใบลดหนี้', group: 'เอกสารภาษี', description: 'กำหนดโลโก้ การจัดวาง หมายเหตุ และข้อความท้ายเอกสาร โดยข้อมูลลดหนี้หลักยังถูกล็อก' },
  { value: 'SHORT_TAX_INVOICE', label: 'ใบกำกับภาษีอย่างย่อ', group: 'เอกสารภาษี', description: 'กำหนด presentation ที่ปลอดภัยสำหรับ Thermal 80mm โดยรักษาความถูกต้องและความยาวกระดาษ' },
];

const WORKSPACE_GROUPS = [...new Set(DOCUMENT_FORMAT_WORKSPACES.map((workspace) => workspace.group))];

const Toggle = ({ register, name, label, description }) => (
  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/30">
    <input type="checkbox" {...register(name)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
    <span className="min-w-0">
      <span className="block text-xs font-black text-slate-800">{label}</span>
      {description ? <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-400">{description}</span> : null}
    </span>
  </label>
);

const nameSizeClass = { sm: 'text-base', md: 'text-lg', lg: 'text-xl', xl: 'text-2xl' };

const DocumentFormatSettingsPage = () => {
  const employee = useAuthStore((state) => state.employee);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const getBranchById = useBranchStore((state) => state.getBranchByIdAction);
  const updateBranch = useBranchStore((state) => state.updateBranchAction);
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('STORE_HEADER');
  const { register, handleSubmit, reset, setValue, watch } = useForm({ defaultValues: projectDocumentHeaderFormDefaults(null) });

  const branchId = useMemo(() => Number(employee?.branchId || currentBranch?.id || selectedBranchId || 0), [employee?.branchId, currentBranch?.id, selectedBranchId]);
  const activeWorkspaceMeta = useMemo(
    () => DOCUMENT_FORMAT_WORKSPACES.find((workspace) => workspace.value === activeWorkspace) || DOCUMENT_FORMAT_WORKSPACES[0],
    [activeWorkspace],
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!branchId) { if (active) setLoading(false); return; }
      setLoading(true);
      try {
        const freshBranch = await getBranchById(branchId);
        if (!active) return;
        const nextBranch = freshBranch || (Number(currentBranch?.id) === branchId ? currentBranch : null);
        setBranch(nextBranch);
        reset(projectDocumentHeaderFormDefaults(nextBranch));
      } catch (error) {
        if (active) feedback.actionError(error, 'ไม่สามารถโหลดรูปแบบเอกสารของร้านได้', 'document-format-load-error');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [branchId, currentBranch, getBranchById, reset]);

  const form = watch();
  const previewName = form.headerStoreName?.trim() || branch?.name || 'ชื่อร้าน / บริษัท';
  const previewAddress = form.headerAddress?.trim() || branch?.address || 'ที่อยู่สถานประกอบการ';
  const previewPhone = form.headerPhone?.trim() || branch?.phone || '0XX-XXX-XXXX';
  const previewTaxId = form.headerTaxId?.trim() || branch?.taxId || 'XXXXXXXXXXXXX';
  const previewLogo = form.headerLogoUrl?.trim();
  const previewAlign = ['left', 'center', 'right'].includes(form.headerTextAlign) ? form.headerTextAlign : 'left';
  const previewLogoPosition = ['left', 'center', 'right'].includes(form.headerLogoPosition) ? form.headerLogoPosition : 'left';
  const previewLogoSize = normalizeLogoSize(form.headerLogoSize);

  const handleLogoUploaded = (url) => {
    setValue('headerLogoUrl', url, { shouldDirty: true, shouldValidate: true });
    setValue('headerShowLogo', true, { shouldDirty: true });
    feedback.actionSuccess('เลือกโลโก้สำหรับเอกสารเรียบร้อยแล้ว', 'document-format-logo-selected');
  };
  const resetLogoSize = () => setValue('headerLogoSize', DOCUMENT_LOGO_SIZE_DEFAULT, { shouldDirty: true, shouldValidate: true });

  const onSubmit = async (data) => {
    if (!branchId || saving || uploadingLogo) return;
    setSaving(true);
    try {
      const documentHeaderConfig = buildDocumentHeaderConfigFromForm(data, branch?.documentHeaderConfig);
      const updated = await updateBranch(branchId, { documentHeaderConfig });
      const nextBranch = updated || { ...branch, documentHeaderConfig };
      setBranch(nextBranch);
      reset(projectDocumentHeaderFormDefaults(nextBranch));
      feedback.actionSuccess('บันทึกรูปแบบเอกสารของร้านเรียบร้อยแล้ว', 'document-format-save-success');
    } catch (error) {
      feedback.actionError(error, 'ไม่สามารถบันทึกรูปแบบเอกสารได้', 'document-format-save-error');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-400">กำลังโหลดรูปแบบเอกสารของร้าน...</div>;
  if (!branchId || !branch) return <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm font-bold text-amber-800">ไม่พบสาขาที่ผูกกับบัญชีผู้ใช้งาน จึงยังไม่สามารถตั้งค่ารูปแบบเอกสารได้</div>;

  const sharedPresentationProps = {
    branch,
    branchId,
    updateBranch,
    onBranchChange: setBranch,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-emerald-600" />
              <h1 className="text-xl font-black tracking-tight text-slate-900">รูปแบบเอกสาร</h1>
            </div>
            <p className="mt-1 text-xs font-bold leading-relaxed text-slate-400">เลือกเอกสารที่ต้องการจัดการทีละประเภท เพื่อให้การตั้งค่าของ {branch.name || 'ร้านปัจจุบัน'} ชัดเจนและไม่ปะปนกัน</p>
          </div>
          <span className="inline-flex self-start rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">ร้าน ID: {branchId}</span>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
          <label htmlFor="document-format-workspace-selector" className="mb-2 block text-xs font-black text-slate-700">เลือกเอกสารที่ต้องการตั้งค่า</label>
          <select
            id="document-format-workspace-selector"
            value={activeWorkspace}
            onChange={(event) => setActiveWorkspace(event.target.value)}
            className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-black text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          >
            {WORKSPACE_GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {DOCUMENT_FORMAT_WORKSPACES.filter((workspace) => workspace.group === group).map((workspace) => (
                  <option key={workspace.value} value={workspace.value}>{workspace.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-[11px] font-medium leading-relaxed text-slate-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span><strong className="text-slate-700">{activeWorkspaceMeta.label}:</strong> {activeWorkspaceMeta.description}</span>
          </div>
        </div>
      </div>

      {activeWorkspace === 'STORE_HEADER' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <section className="space-y-4">
              <div><div className="flex items-center gap-2 text-sm font-black text-slate-900"><Image className="h-4 w-4 text-emerald-600" /> โลโก้และตำแหน่ง</div><p className="mt-1 text-[11px] font-medium text-slate-400">อัปโหลดจากเครื่อง เลือกจากคลังรูปของร้าน หรือระบุ URL เองก็ได้</p></div>
              <Toggle register={register} name="headerShowLogo" label="แสดงโลโก้" description="ปิดได้เมื่อเอกสารบางชุดไม่ต้องการโลโก้ร้าน" />
              <StorefrontMediaUploadField label="โลโก้เอกสาร" purpose="STORE_LOGO" value={previewLogo} upload={uploadStorefrontMedia} onUploaded={handleLogoUploaded} onBusyChange={(busy) => setUploadingLogo(busy)} disabled={saving} accept="image/png,image/jpeg,image/webp,image/gif" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2"><label className={labelClassName}>URL โลโก้ (ทางเลือก)</label><input type="url" {...register('headerLogoUrl')} className={inputClassName} placeholder="https://..." /></div>
                <div><label className={labelClassName}>ตำแหน่งโลโก้</label><select {...register('headerLogoPosition')} className={inputClassName}><option value="left">ซ้าย</option><option value="center">กึ่งกลาง</option><option value="right">ขวา</option></select></div>
                <div><label className={labelClassName}>ขนาดโลโก้ (px)</label><div className="flex gap-2"><input type="number" min={DOCUMENT_LOGO_SIZE_MIN} max={DOCUMENT_LOGO_SIZE_MAX} step="1" {...register('headerLogoSize', { valueAsNumber: true })} className={inputClassName} aria-label="ขนาดโลโก้เป็นพิกเซล" /><button type="button" onClick={resetLogoSize} className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700" title="คืนค่ามาตรฐาน 56 px"><RotateCcw className="h-3.5 w-3.5" />56</button></div><p className="mt-1 text-[10px] font-medium text-slate-400">กำหนดได้ {DOCUMENT_LOGO_SIZE_MIN}–{DOCUMENT_LOGO_SIZE_MAX} px · มาตรฐาน {DOCUMENT_LOGO_SIZE_DEFAULT} px</p></div>
                <div className="md:col-span-2"><label className={labelClassName}>แนวข้อความหัวเอกสาร</label><select {...register('headerTextAlign')} className={inputClassName}><option value="left">ชิดซ้าย</option><option value="center">กึ่งกลาง</option><option value="right">ขวา</option></select></div>
              </div>
            </section>

            <section className="space-y-4 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900"><Type className="h-4 w-4 text-emerald-600" /> ชื่อและข้อมูลติดต่อ</div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2"><Toggle register={register} name="headerShowStoreName" label="แสดงชื่อร้าน" /><Toggle register={register} name="headerShowAddress" label="แสดงที่อยู่" /><Toggle register={register} name="headerShowPhone" label="แสดงเบอร์โทรศัพท์" /><Toggle register={register} name="headerShowTaxId" label="แสดงเลขประจำตัวผู้เสียภาษี" /></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><label className={labelClassName}>ชื่อร้านบนเอกสาร</label><input type="text" {...register('headerStoreName')} className={inputClassName} placeholder="เว้นว่างเพื่อใช้ชื่อร้านหลัก" /></div>
                <div><label className={labelClassName}>ขนาดชื่อร้าน</label><select {...register('headerStoreNameSize')} className={inputClassName}><option value="sm">เล็ก</option><option value="md">มาตรฐาน</option><option value="lg">ใหญ่</option><option value="xl">ใหญ่มาก</option></select></div>
                <div className="md:col-span-2"><label className={labelClassName}>ที่อยู่บนเอกสาร</label><textarea rows={2} {...register('headerAddress')} className={inputClassName} placeholder="เว้นว่างเพื่อใช้ที่อยู่ร้านหลัก" /></div>
                <div><label className={labelClassName}>เบอร์โทรศัพท์บนเอกสาร</label><input type="text" {...register('headerPhone')} className={inputClassName} placeholder="เว้นว่างเพื่อใช้เบอร์ร้านหลัก" /></div>
                <div><label className={labelClassName}>เลขประจำตัวผู้เสียภาษีบนเอกสาร</label><input type="text" {...register('headerTaxId')} className={inputClassName} placeholder="เว้นว่างเพื่อใช้ข้อมูลร้านหลัก" /></div>
              </div>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-5"><div className="flex items-center gap-2 text-sm font-black text-slate-900"><FileText className="h-4 w-4 text-emerald-600" /> ข้อความเพิ่มเติม</div><div><label className={labelClassName}>ข้อความใต้หัวเอกสาร</label><textarea rows={3} {...register('headerNote')} className={inputClassName} placeholder="เช่น ขอบคุณที่ใช้บริการ / เงื่อนไขสั้น ๆ ของร้าน" /></div></section>
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-2 text-[11px] font-medium leading-relaxed text-slate-400"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span>หัวเอกสารนี้เป็นค่าเริ่มต้นของร้าน เอกสารแต่ละประเภทสามารถมีค่าที่กำหนดเฉพาะเพิ่มเติมได้ โดยไม่ทำลายค่าเริ่มต้นนี้</span></div><button type="submit" disabled={saving || uploadingLogo} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{uploadingLogo ? 'กำลังอัปโหลดโลโก้...' : saving ? 'กำลังบันทึก...' : 'บันทึกรูปแบบ'}</button></div>
          </form>

          <aside className="xl:sticky xl:top-4 xl:self-start"><div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm"><div className="mb-4"><h2 className="text-sm font-black text-slate-900">ตัวอย่างหัวเอกสาร</h2><p className="mt-0.5 text-[11px] font-medium text-slate-400">ตัวอย่างเพื่อช่วยจัดรูปแบบ ไม่ใช่ภาพพิมพ์ขนาดจริง</p></div><div className="aspect-[1/1.414] min-h-[480px] overflow-hidden rounded-xl border border-slate-200 bg-white p-7 shadow-inner"><div className={previewLogoPosition === 'center' ? 'flex flex-col items-center gap-3' : previewLogoPosition === 'right' ? 'flex flex-row-reverse items-center justify-between gap-4' : 'flex items-center gap-4'}>{form.headerShowLogo && <div className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400" style={{ width: previewLogoSize, height: previewLogoSize }}>{previewLogo ? <img src={previewLogo} alt="ตัวอย่างโลโก้" className="h-full w-full object-contain" /> : 'LOGO'}</div>}<div className="min-w-0 flex-1" style={{ textAlign: previewAlign }}>{form.headerShowStoreName && <div className={`${nameSizeClass[form.headerStoreNameSize] || nameSizeClass.md} font-black leading-tight text-slate-950`}>{previewName}</div>}{form.headerShowAddress && <div className="mt-1 text-[10px] leading-relaxed text-slate-600">{previewAddress}</div>}{form.headerShowPhone && <div className="mt-1 text-[10px] text-slate-600">โทร: {previewPhone}</div>}{form.headerShowTaxId && <div className="mt-1 text-[10px] text-slate-600">เลขประจำตัวผู้เสียภาษี: {previewTaxId}</div>}{form.headerNote?.trim() && <div className="mt-2 text-[10px] font-semibold text-slate-500">{form.headerNote.trim()}</div>}</div></div><div className="mt-6 border-t-2 border-slate-800 pt-4"><div className="h-3 w-32 rounded bg-slate-100" /><div className="mt-3 h-2 w-full rounded bg-slate-100" /><div className="mt-2 h-2 w-4/5 rounded bg-slate-100" /><div className="mt-7 h-24 rounded border border-slate-100 bg-slate-50/60" /><div className="mt-5 ml-auto h-16 w-44 rounded border border-slate-100 bg-slate-50/60" /></div></div></div></aside>
        </div>
      )}

      {activeWorkspace === 'QUOTATION' && <QuotationPresentationSettingsCard {...sharedPresentationProps} />}
      {activeWorkspace === 'DELIVERY_NOTE' && <DeliveryNotePresentationSettingsCard {...sharedPresentationProps} />}
      {activeWorkspace === 'CUSTOMER_RECEIPT' && <CustomerReceiptPresentationSettingsCard {...sharedPresentationProps} />}
      {activeWorkspace === 'CUSTOMER_MONEY_RECEIPT' && (
        <FinanceOperationalPresentationSettingsCard
          {...sharedPresentationProps}
          documentPurpose="CUSTOMER_MONEY_RECEIPT"
          title="ใบรับเงิน Customer Money"
          description="กำหนดหมายเหตุและข้อความท้ายใบรับเงินจริง โดยสถานะ Customer Money ข้อความว่าไม่ใช่ใบกำกับภาษี และผลต่อสต๊อก/ภาษีเป็นข้อความระบบที่ถูกล็อก"
          systemNotices={[
            'เอกสารนี้เป็นหลักฐานการรับเงินจริงจากลูกค้า',
            'ยอดคงเหลือของใบรับนี้ยังสามารถนำไปใช้ผ่าน Customer Money workflow ได้',
            'ไม่ใช่ใบกำกับภาษี และไม่ก่อให้เกิดการตัดสต๊อกหรือรายการภาษีจากการรับเงินนี้',
          ]}
        />
      )}
      {activeWorkspace === 'DELIVERY_CREDIT_SETTLEMENT' && (
        <FinanceOperationalPresentationSettingsCard
          {...sharedPresentationProps}
          documentPurpose="DELIVERY_CREDIT_SETTLEMENT"
          title="เอกสารตัดยอดใบส่งของเครดิต"
          description="กำหนดหมายเหตุและข้อความท้ายเอกสารได้ โดยข้อความเกี่ยวกับ Customer Money และการไม่สร้าง stock movement/ไม่ตัดสต๊อกซ้ำเป็น authority ของระบบและแก้ไขไม่ได้"
          systemNotices={[
            'เอกสารนี้บันทึกการนำ Customer Money ไปตัดยอดใบส่งของเครดิตเท่านั้น',
            'ไม่สร้าง stock movement และไม่ตัดสต๊อกซ้ำ',
          ]}
        />
      )}
      {activeWorkspace === 'REFUND_RECEIPT' && (
        <FinanceOperationalPresentationSettingsCard
          {...sharedPresentationProps}
          documentPurpose="REFUND_RECEIPT"
          title="ใบรับเงินคืน"
          description="กำหนดหมายเหตุและข้อความท้ายใบรับเงินคืนได้ โดยยอดคืน รายการคืน และหลักฐานการคืนเงินเป็นข้อมูลธุรกิจของเอกสารที่ Presentation ไม่สามารถแก้ไขได้"
          systemNotices={['โปรดเก็บเอกสารนี้ไว้เป็นหลักฐานการคืนเงิน']}
        />
      )}
      {activeWorkspace === 'PURCHASE_ORDER' && <PurchaseOrderPresentationSettingsCard {...sharedPresentationProps} />}
      {activeWorkspace === 'COMBINED_BILLING' && <CombinedBillingPresentationSettingsCard {...sharedPresentationProps} />}
      {activeWorkspace === 'FULL_TAX_INVOICE' && <StatutoryPresentationSettingsCard {...sharedPresentationProps} documentPurpose="FULL_TAX_INVOICE" title="ใบกำกับภาษีเต็มรูป" description="ปรับได้เฉพาะองค์ประกอบด้านภาพและข้อความเสริมที่กฎหมายไม่กำหนด ข้อมูลผู้ออก/ผู้รับ เลขเอกสาร วันที่ รายการ และยอดภาษีใช้ TaxDocument snapshot เท่านั้น" />}
      {activeWorkspace === 'CREDIT_NOTE' && <StatutoryPresentationSettingsCard {...sharedPresentationProps} documentPurpose="CREDIT_NOTE" title="ใบลดหนี้" description="อนุญาตเฉพาะโลโก้ การจัดวาง หมายเหตุ และข้อความท้ายเอกสาร โดยเหตุอ้างอิง เอกสารเดิม ผู้ออก ผู้รับ และยอดลดหนี้ถูกล็อกจาก TaxDocument authority" />}
      {activeWorkspace === 'SHORT_TAX_INVOICE' && <StatutoryPresentationSettingsCard {...sharedPresentationProps} documentPurpose="SHORT_TAX_INVOICE" title="ใบกำกับภาษีอย่างย่อ" description="เอกสาร Thermal 80mm จำกัดการปรับแต่งมากที่สุด: โลโก้/แนวหัวเอกสารและข้อความท้ายที่ปลอดภัยเท่านั้น เพื่อรักษาความถูกต้องและความยาวกระดาษ" />}
    </div>
  );
};

export default DocumentFormatSettingsPage;
