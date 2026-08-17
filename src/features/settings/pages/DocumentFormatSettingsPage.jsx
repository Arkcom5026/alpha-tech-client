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
import StorefrontMediaUploadField from '@/features/storeExperience/components/StorefrontMediaUploadField';
import { uploadStorefrontMedia } from '@/features/storeExperience/api/storeExperienceApi';

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100';
const labelClassName = 'mb-1.5 block text-xs font-black text-slate-600';

const Toggle = ({ register, name, label, description }) => (
  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/30">
    <input type="checkbox" {...register(name)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
    <span className="min-w-0">
      <span className="block text-xs font-black text-slate-800">{label}</span>
      {description ? <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-400">{description}</span> : null}
    </span>
  </label>
);

const nameSizeClass = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
};

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

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: projectDocumentHeaderFormDefaults(null),
  });

  const branchId = useMemo(
    () => Number(employee?.branchId || currentBranch?.id || selectedBranchId || 0),
    [employee?.branchId, currentBranch?.id, selectedBranchId],
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!branchId) {
        if (active) setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const freshBranch = await getBranchById(branchId);
        if (!active) return;
        const nextBranch = freshBranch || (Number(currentBranch?.id) === branchId ? currentBranch : null);
        setBranch(nextBranch);
        reset(projectDocumentHeaderFormDefaults(nextBranch));
      } catch (error) {
        if (active) {
          feedback.actionError(error, 'ไม่สามารถโหลดรูปแบบเอกสารของร้านได้', 'document-format-load-error');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
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

  const resetLogoSize = () => {
    setValue('headerLogoSize', DOCUMENT_LOGO_SIZE_DEFAULT, { shouldDirty: true, shouldValidate: true });
  };

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
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-400">กำลังโหลดรูปแบบเอกสารของร้าน...</div>;
  }

  if (!branchId || !branch) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm font-bold text-amber-800">
        ไม่พบสาขาที่ผูกกับบัญชีผู้ใช้งาน จึงยังไม่สามารถตั้งค่ารูปแบบเอกสารได้
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-emerald-600" />
              <h1 className="text-xl font-black tracking-tight text-slate-900">รูปแบบเอกสาร</h1>
            </div>
            <p className="mt-1 text-xs font-bold leading-relaxed text-slate-400">
              กำหนดรูปแบบหัวเอกสารของ {branch.name || 'ร้านปัจจุบัน'} โดยไม่เปลี่ยนข้อมูลทางกฎหมายของผู้ออกเอกสารภาษี
            </p>
          </div>
          <span className="inline-flex self-start rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">ร้าน ID: {branchId}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <section className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-slate-900"><Image className="h-4 w-4 text-emerald-600" /> โลโก้และตำแหน่ง</div>
              <p className="mt-1 text-[11px] font-medium text-slate-400">อัปโหลดจากเครื่อง เลือกจากคลังรูปของร้าน หรือระบุ URL เองก็ได้</p>
            </div>
            <Toggle register={register} name="headerShowLogo" label="แสดงโลโก้" description="ปิดได้เมื่อเอกสารบางชุดไม่ต้องการโลโก้ร้าน" />
            <StorefrontMediaUploadField
              label="โลโก้เอกสาร"
              purpose="STORE_LOGO"
              value={previewLogo}
              upload={uploadStorefrontMedia}
              onUploaded={handleLogoUploaded}
              onBusyChange={(busy) => setUploadingLogo(busy)}
              disabled={saving}
              accept="image/png,image/jpeg,image/webp,image/gif"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><label className={labelClassName}>URL โลโก้ (ทางเลือก)</label><input type="url" {...register('headerLogoUrl')} className={inputClassName} placeholder="https://..." /></div>
              <div><label className={labelClassName}>ตำแหน่งโลโก้</label><select {...register('headerLogoPosition')} className={inputClassName}><option value="left">ซ้าย</option><option value="center">กึ่งกลาง</option><option value="right">ขวา</option></select></div>
              <div>
                <label className={labelClassName}>ขนาดโลโก้ (px)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={DOCUMENT_LOGO_SIZE_MIN}
                    max={DOCUMENT_LOGO_SIZE_MAX}
                    step="1"
                    {...register('headerLogoSize', { valueAsNumber: true })}
                    className={inputClassName}
                    aria-label="ขนาดโลโก้เป็นพิกเซล"
                  />
                  <button type="button" onClick={resetLogoSize} className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700" title="คืนค่ามาตรฐาน 56 px"><RotateCcw className="h-3.5 w-3.5" />56</button>
                </div>
                <p className="mt-1 text-[10px] font-medium text-slate-400">กำหนดได้ {DOCUMENT_LOGO_SIZE_MIN}–{DOCUMENT_LOGO_SIZE_MAX} px · มาตรฐาน {DOCUMENT_LOGO_SIZE_DEFAULT} px</p>
              </div>
              <div className="md:col-span-2"><label className={labelClassName}>แนวข้อความหัวเอกสาร</label><select {...register('headerTextAlign')} className={inputClassName}><option value="left">ชิดซ้าย</option><option value="center">กึ่งกลาง</option><option value="right">ชิดขวา</option></select></div>
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900"><Type className="h-4 w-4 text-emerald-600" /> ชื่อและข้อมูลติดต่อ</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Toggle register={register} name="headerShowStoreName" label="แสดงชื่อร้าน" />
              <Toggle register={register} name="headerShowAddress" label="แสดงที่อยู่" />
              <Toggle register={register} name="headerShowPhone" label="แสดงเบอร์โทรศัพท์" />
              <Toggle register={register} name="headerShowTaxId" label="แสดงเลขประจำตัวผู้เสียภาษี" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label className={labelClassName}>ชื่อร้านบนเอกสาร</label><input type="text" {...register('headerStoreName')} className={inputClassName} placeholder="เว้นว่างเพื่อใช้ชื่อร้านหลัก" /></div>
              <div><label className={labelClassName}>ขนาดชื่อร้าน</label><select {...register('headerStoreNameSize')} className={inputClassName}><option value="sm">เล็ก</option><option value="md">มาตรฐาน</option><option value="lg">ใหญ่</option><option value="xl">ใหญ่มาก</option></select></div>
              <div className="md:col-span-2"><label className={labelClassName}>ที่อยู่บนเอกสาร</label><textarea rows={2} {...register('headerAddress')} className={inputClassName} placeholder="เว้นว่างเพื่อใช้ที่อยู่ร้านหลัก" /></div>
              <div><label className={labelClassName}>เบอร์โทรศัพท์บนเอกสาร</label><input type="text" {...register('headerPhone')} className={inputClassName} placeholder="เว้นว่างเพื่อใช้เบอร์ร้านหลัก" /></div>
              <div><label className={labelClassName}>เลขประจำตัวผู้เสียภาษีบนเอกสาร</label><input type="text" {...register('headerTaxId')} className={inputClassName} placeholder="เว้นว่างเพื่อใช้ข้อมูลร้านหลัก" /></div>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900"><FileText className="h-4 w-4 text-emerald-600" /> ข้อความเพิ่มเติม</div>
            <div><label className={labelClassName}>ข้อความใต้หัวเอกสาร</label><textarea rows={3} {...register('headerNote')} className={inputClassName} placeholder="เช่น ขอบคุณที่ใช้บริการ / เงื่อนไขสั้น ๆ ของร้าน" /></div>
          </section>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-[11px] font-medium leading-relaxed text-slate-400"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span>ระยะแรกใช้กับเอกสาร A4 ที่เชื่อมต่อแล้ว ส่วนใบเสร็จ 80 มม. จะเปิดใช้งานหลังผ่านการตรวจสอบความสูงและการตัดหน้าของเครื่องพิมพ์จริง</span></div>
            <button type="submit" disabled={saving || uploadingLogo} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{uploadingLogo ? 'กำลังอัปโหลดโลโก้...' : saving ? 'กำลังบันทึก...' : 'บันทึกรูปแบบ'}</button>
          </div>
        </form>

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4"><h2 className="text-sm font-black text-slate-900">ตัวอย่างหัวเอกสาร</h2><p className="mt-0.5 text-[11px] font-medium text-slate-400">ตัวอย่างเพื่อช่วยจัดรูปแบบ ไม่ใช่ภาพพิมพ์ขนาดจริง</p></div>
            <div className="aspect-[1/1.414] min-h-[480px] overflow-hidden rounded-xl border border-slate-200 bg-white p-7 shadow-inner">
              <div className={previewLogoPosition === 'center' ? 'flex flex-col items-center gap-3' : previewLogoPosition === 'right' ? 'flex flex-row-reverse items-start justify-between gap-4' : 'flex items-start gap-4'}>
                {form.headerShowLogo && (
                  <div
                    className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400"
                    style={{ width: previewLogoSize, height: previewLogoSize }}
                  >
                    {previewLogo ? <img src={previewLogo} alt="ตัวอย่างโลโก้" className="h-full w-full object-contain" /> : 'LOGO'}
                  </div>
                )}
                <div className="min-w-0 flex-1" style={{ textAlign: previewAlign }}>
                  {form.headerShowStoreName && <div className={`${nameSizeClass[form.headerStoreNameSize] || nameSizeClass.md} font-black leading-tight text-slate-950`}>{previewName}</div>}
                  {form.headerShowAddress && <div className="mt-1 text-[10px] leading-relaxed text-slate-600">{previewAddress}</div>}
                  {form.headerShowPhone && <div className="mt-1 text-[10px] text-slate-600">โทร: {previewPhone}</div>}
                  {form.headerShowTaxId && <div className="mt-1 text-[10px] text-slate-600">เลขประจำตัวผู้เสียภาษี: {previewTaxId}</div>}
                  {form.headerNote?.trim() && <div className="mt-2 text-[10px] font-semibold text-slate-500">{form.headerNote.trim()}</div>}
                </div>
              </div>
              <div className="mt-6 border-t-2 border-slate-800 pt-4"><div className="h-3 w-32 rounded bg-slate-100" /><div className="mt-3 h-2 w-full rounded bg-slate-100" /><div className="mt-2 h-2 w-4/5 rounded bg-slate-100" /><div className="mt-7 h-24 rounded border border-slate-100 bg-slate-50/60" /><div className="mt-5 ml-auto h-16 w-44 rounded border border-slate-100 bg-slate-50/60" /></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DocumentFormatSettingsPage;
