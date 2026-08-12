import React, { useState } from 'react';
import RepairShellHeader from '../../../components/RepairShellHeader';
import RuntimeStatePanel from '../../../components/RuntimeStatePanel';
import RepairDeviceSearchPanel from '../../../components/RepairDeviceSearchPanel';
import RepairCustomerSection from '../../../components/RepairCustomerSection';
import CustomerWarrantyAssets from '../../../components/CustomerWarrantyAssets';
import RepairIntakeContactForm from '../../../components/RepairIntakeContactForm';
import IntakeProjection from '../../../components/IntakeProjection';
import ExternalDeviceIntakeForm from '../../../components/ExternalDeviceIntakeForm';
import MobileIntakeEvidenceFields from '../../../components/MobileIntakeEvidenceFields';
import MobileIntakeProgress from '../../../components/MobileIntakeProgress';
import RepairCommunicationPreferenceFields from '../../../components/RepairCommunicationPreferenceFields';

const statusBadge = {
  EXTERNAL: ['สิ่งที่ลูกค้านำมาซ่อม', 'border-blue-200 bg-blue-50 text-blue-700'],
  NOT_FOUND: ['ไม่พบผลการค้นหา', 'border-amber-200 bg-amber-50 text-amber-700'],
  DEVICE_SELECTED: ['เลือกอุปกรณ์แล้ว', 'border-emerald-200 bg-emerald-50 text-emerald-700'],
  WAITING: ['รอเลือกลูกค้าหรืออุปกรณ์', 'border-slate-200 bg-slate-50 text-slate-500'],
};

const RepairIntakeWorkspace = ({
  runtime,
  customerPanelOpen,
  createOpen,
  externalMode,
  intakeContact,
  intakeEvidence,
  communicationPreference,
  communicationProfiles,
  communicationProfilesWarning,
  draft,
  selectedStockItemId,
  status,
  canSubmit,
  onToggleCustomerPanel,
  onSelectDevice,
  onSelectCustomer,
  onReset,
  onClearCustomer,
  onSelectWarrantyAsset,
  onRefreshWarrantyAssets,
  onStartExternalIntake,
  onCancelExternalIntake,
  onSubmitExternalIntake,
  onRetry,
  onOpenJob,
  onOpenClaim,
  onCreateJob,
  onContactChange,
  onIntakeEvidenceChange,
  onCommunicationPreferenceChange,
  onCloseCreate,
  onDraftChange,
  onConfirmCreate,
}) => {
  const suggestedStep = externalMode || createOpen
    ? 3
    : runtime.selectedCustomer?.id
      ? 2
      : 1;
  const [requestedStep, setRequestedStep] = useState(null);
  const currentStep = requestedStep ?? suggestedStep;
  const [statusText, statusClass] = statusBadge[status] || statusBadge.WAITING;
  const repairAuthorization = draft?.preAgreedService || {
    enabled: false,
    agreedScope: '',
    confirmedByName: '',
    confirmationNote: '',
  };
  const updateAuthorization = (patch) =>
    onDraftChange('preAgreedService', { ...repairAuthorization, ...patch });
  const goBack = () => setRequestedStep(Math.max(1, currentStep - 1));
  const startExistingDetails = () => {
    if (!createOpen) onCreateJob();
    setRequestedStep(3);
  };
  const startManualDetails = () => {
    onStartExternalIntake();
    if (runtime.selectedCustomer?.id) setRequestedStep(3);
  };
  const goForward = () => {
    if (currentStep === 1) {
      if (!runtime.selectedCustomer?.id) {
        onToggleCustomerPanel();
        return;
      }
      setRequestedStep(2);
      return;
    }

    if (currentStep === 2) {
      if (runtime.intakeContext) {
        startExistingDetails();
      } else {
        startManualDetails();
      }
    }
  };

  return (
    <div>
      <div className="hidden xl:block">
        <RepairShellHeader
          eyebrow="After-sales Runtime"
          title="รับซ่อมและรับเคลม"
          description="เลือกลูกค้าและสิ่งที่นำมาซ่อม พร้อมบันทึกรายละเอียดรับเรื่องให้จบใน flow เดียว"
        />
      </div>

      <MobileIntakeProgress
        hasCustomer={Boolean(runtime.selectedCustomer?.id)}
        hasDevice={Boolean(runtime.intakeContext)}
        enteringDetails={externalMode || createOpen}
        currentStep={currentStep}
        onStepChange={setRequestedStep}
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(320px,0.76fr)_minmax(0,1.55fr)]">
        <aside className={`${currentStep <= 2 ? 'block' : 'hidden'} space-y-4 xl:sticky xl:top-4 xl:block`}>
          <section id="repair-intake-customer" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden border-b border-slate-200 px-5 py-4 xl:block">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Customer & Repair Asset</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">ลูกค้าและอุปกรณ์</h2>
              <p className="mt-1 text-xs text-slate-500">ค้นหาจากทางที่สะดวก แล้วเลือกอุปกรณ์เพื่อเปิดรายการรับซ่อม</p>
            </div>

            <div className={`${currentStep <= 2 ? 'block' : 'hidden'} space-y-4 p-4 xl:block`}>
              <div className={`${currentStep === 1 ? 'block' : 'hidden'} xl:hidden`}>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">ขั้นที่ 1 · ลูกค้า</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">ค้นหาหรือเพิ่มลูกค้า</h2>
                <p className="mt-1 text-xs text-slate-500">ค้นด้วยชื่อ เบอร์โทร หรือสแกนรหัสที่มี</p>
              </div>

              <RepairDeviceSearchPanel
                mode={currentStep === 1 ? 'customer' : 'asset'}
                value={runtime.intakeLookup}
                loading={runtime.loading}
                results={runtime.searchResults}
                onChange={runtime.onLookupChange}
                onSearch={runtime.onSearchDirectory}
                onSelectDevice={onSelectDevice}
                onSelectCustomer={onSelectCustomer}
                onReset={onReset}
              />

              <button type="button" onClick={onToggleCustomerPanel} className="min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 hover:border-emerald-300 hover:bg-emerald-50">
                {customerPanelOpen ? 'ซ่อนข้อมูลลูกค้า' : runtime.selectedCustomer?.id ? 'ดูข้อมูลลูกค้าที่เลือก' : '+ เพิ่มลูกค้าใหม่'}
              </button>

              {customerPanelOpen ? (
                <div className="space-y-4 border-t border-slate-200 pt-4">
                  <RepairCustomerSection
                    selectedCustomer={runtime.selectedCustomer}
                    loading={runtime.loading}
                    onSelectCustomer={onSelectCustomer}
                    onClearCustomer={onClearCustomer}
                    createOnly
                  />
                  <CustomerWarrantyAssets
                    customer={runtime.selectedCustomer}
                    assets={runtime.customerWarrantyAssets}
                    loading={runtime.loading}
                    selectedStockItemId={selectedStockItemId}
                    onSelectAsset={onSelectWarrantyAsset}
                    onRefresh={onRefreshWarrantyAssets}
                  />
                </div>
              ) : null}
            </div>

            <div className={`${currentStep === 2 ? 'block' : 'hidden'} border-t border-slate-200 bg-slate-50 p-4 xl:block`}>
              <div className="mb-4 xl:hidden">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">ขั้นที่ 2 · สิ่งที่รับซ่อม</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">เลือกของเดิมหรือรับรายการใหม่</h2>
                <p className="mt-1 text-xs text-slate-500">สแกนรหัสของเดิม หรือรับสิ่งของทั่วไปโดยไม่ต้องลงทะเบียน</p>
              </div>
              <button type="button" disabled={!runtime.selectedCustomer?.id} onClick={startManualDetails} className="min-h-11 w-full rounded-xl border border-dashed border-blue-300 bg-white px-4 text-sm font-black text-blue-700 hover:border-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400">
                + รับสิ่งที่ลูกค้านำมาซ่อม
              </button>
              {!runtime.selectedCustomer?.id ? <p className="mt-2 text-center text-xs text-slate-500">เลือกลูกค้าก่อนรับสิ่งที่นำมาซ่อม</p> : null}
              {runtime.selectedCustomer?.id && !runtime.intakeContext ? (
                <p className="mt-2 text-center text-xs text-slate-500">ไม่มีรหัสหรือไม่เคยซื้อจากร้านก็รับซ่อมได้ กดปุ่มด้านบนเพื่อกรอกรายละเอียดเอง</p>
              ) : null}
            </div>
          </section>
        </aside>

        <main className={`${currentStep >= 2 ? 'block' : 'hidden'} min-w-0 space-y-4 xl:block`}>
          <section id="repair-intake-details" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className={`${currentStep === 3 ? 'flex' : 'hidden'} flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between xl:flex`}>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Intake Workspace</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">รายการรับซ่อม</h2>
              </div>
              <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${statusClass}`}>{statusText}</span>
            </div>

            <div className={`${currentStep === 3 || runtime.intakeContext || runtime.intakeNotFound ? 'block' : 'hidden'} p-4 md:p-5 xl:block`}>
              {externalMode ? (
                <ExternalDeviceIntakeForm
                  customer={runtime.selectedCustomer}
                  submitting={runtime.submitting}
                  error={runtime.error}
                  communicationProfiles={communicationProfiles}
                  communicationProfilesWarning={communicationProfilesWarning}
                  onCancel={onCancelExternalIntake}
                  onSubmit={onSubmitExternalIntake}
                />
              ) : runtime.error || runtime.loading ? (
                <RuntimeStatePanel loading={runtime.loading} error={runtime.error} empty={false} onRetry={onRetry} />
              ) : runtime.intakeNotFound ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">🔎</div>
                  <h3 className="mt-4 text-lg font-black text-slate-900">ไม่พบลูกค้าหรืออุปกรณ์ “{runtime.intakeNotFoundLookup}”</h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">รายการนี้ไม่ใช่ข้อผิดพลาดของระบบ สามารถเพิ่มลูกค้าใหม่ หรือเลือกลูกค้าแล้วรับสิ่งของทั่วไปเข้าซ่อมได้โดยไม่ต้องลงทะเบียนเป็นสินค้า</p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <button type="button" onClick={runtime.onOpenCustomerPanel} className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700">ค้นหาหรือเพิ่มลูกค้า</button>
                    <button type="button" disabled={!runtime.selectedCustomer?.id} onClick={startManualDetails} className="min-h-11 rounded-xl bg-blue-700 px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">รับสิ่งที่นำมาซ่อม</button>
                  </div>
                  {!runtime.selectedCustomer?.id ? <p className="mt-3 text-xs text-slate-500">ต้องเลือกลูกค้าก่อนจึงจะลงทะเบียนอุปกรณ์ได้</p> : null}
                </div>
              ) : runtime.intakeContext ? (
                <div className="space-y-5">
                  <IntakeProjection context={runtime.intakeContext} onOpenJob={onOpenJob} onOpenClaim={onOpenClaim} onCreateJob={startExistingDetails} />
                  <RepairIntakeContactForm value={intakeContact} customer={runtime.selectedCustomer} onChange={onContactChange} />

                  {createOpen ? (
                    <div className="border-t border-slate-200 pt-5">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h3 className="text-lg font-black text-slate-950">รายละเอียดรับซ่อม</h3>
                          <p className="mt-1 text-xs text-slate-500">ข้อมูลลูกค้าและอุปกรณ์ถูกเติมจากรายการที่เลือก</p>
                        </div>
                        <button type="button" onClick={onCloseCreate} className="w-fit text-sm font-black text-slate-500 hover:text-slate-900">ย่อรายละเอียด</button>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <input value={draft.assetDescription || ''} onChange={(event) => onDraftChange('assetDescription', event.target.value)} placeholder="สิ่งที่นำมาซ่อม เช่น เครื่องปั่น รถยนต์ โทรศัพท์ หรือเครื่องมือ *" className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2" />
                        <textarea rows={4} value={draft.reportedSymptoms} onChange={(event) => onDraftChange('reportedSymptoms', event.target.value)} placeholder="อาการที่ลูกค้าแจ้ง *" className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2" />
                        <input type="number" min="0" value={draft.depositPaid} onChange={(event) => onDraftChange('depositPaid', event.target.value)} placeholder="มัดจำ" className="rounded-xl border border-slate-300 px-4 py-3" />
                        <div>
                          <input type="number" min="0" value={draft.estimatedCost} onChange={(event) => onDraftChange('estimatedCost', event.target.value)} placeholder="งบ/ราคาประเมิน (ถ้ามี)" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                          <p className="mt-1 text-[11px] text-slate-500">ไม่บังคับ ราคาจริงระบุเมื่อซ่อมเสร็จ</p>
                        </div>
                        <textarea rows={2} value={draft.technicianNotes} onChange={(event) => onDraftChange('technicianNotes', event.target.value)} placeholder="บันทึกภายใน" className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2" />
                      </div>

                      <div className="mt-4">
                        <MobileIntakeEvidenceFields
                          value={intakeEvidence}
                          onChange={onIntakeEvidenceChange}
                        />
                      </div>

                      <div className="mt-4">
                        <RepairCommunicationPreferenceFields
                          value={communicationPreference}
                          onChange={onCommunicationPreferenceChange}
                          contact={intakeContact}
                          customerId={runtime.selectedCustomer?.id}
                          profiles={communicationProfiles}
                          profilesWarning={communicationProfilesWarning}
                        />
                      </div>

                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(repairAuthorization.enabled)}
                            onChange={(event) =>
                              updateAuthorization({
                                enabled: event.target.checked,
                                confirmedByName:
                                  repairAuthorization.confirmedByName || intakeContact.contactName || '',
                              })
                            }
                            className="mt-1 h-4 w-4"
                          />
                          <span>
                            <span className="block font-black text-emerald-950">ลูกค้าอนุมัติให้ซ่อม — ไม่ต้องเสนอราคาก่อน</span>
                            <span className="mt-1 block text-xs leading-5 text-emerald-800">สำหรับเคสที่ลูกค้าอนุญาตให้ร้านดำเนินงานได้เลยโดยไม่ผูกยอดล่วงหน้า ช่างระบุค่าซ่อมจริงเมื่อทำงานเสร็จ หากลูกค้าต้องการทราบราคาก่อน ให้ไม่เลือกช่องนี้และใช้ขั้นตรวจสอบ/เสนอราคา</span>
                          </span>
                        </label>

                        {repairAuthorization.enabled ? (
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <textarea
                              rows={3}
                              value={repairAuthorization.agreedScope}
                              onChange={(event) => updateAuthorization({ agreedScope: event.target.value })}
                              placeholder="ขอบเขต/เงื่อนไขที่ลูกค้าอนุมัติ (ถ้ามี)"
                              className="rounded-xl border border-emerald-200 bg-white px-4 py-3 md:col-span-2"
                            />
                            <input
                              value={repairAuthorization.confirmedByName}
                              onChange={(event) => updateAuthorization({ confirmedByName: event.target.value })}
                              placeholder="ผู้อนุมัติให้ซ่อม *"
                              className="rounded-xl border border-emerald-200 bg-white px-4 py-3 md:col-span-2"
                            />
                            <textarea
                              rows={2}
                              value={repairAuthorization.confirmationNote}
                              onChange={(event) => updateAuthorization({ confirmationNote: event.target.value })}
                              placeholder="หมายเหตุ / ช่องทางที่ลูกค้าอนุมัติ (ถ้ามี)"
                              className="rounded-xl border border-emerald-200 bg-white px-4 py-3 md:col-span-2"
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="hidden min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-6 text-center xl:flex">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">🛠️</div>
                  <h3 className="mt-4 text-lg font-black text-slate-900">เริ่มสร้างรายการรับซ่อม</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">เลือกลูกค้า หรือสแกน Barcode, Serial Number, IMEI หรือ Service Tag จากแผงด้านซ้าย ข้อมูลอุปกรณ์และประวัติที่เกี่ยวข้องจะแสดงที่นี่</p>
                </div>
              )}
            </div>
          </section>

          {runtime.intakeContext && createOpen ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="grid gap-3 sm:grid-cols-3">
                  <SummaryItem label="ลูกค้า" value={intakeContact.contactName || `Customer #${draft.customerId || '-'}`} />
                  <SummaryItem label="สิ่งที่นำมาซ่อม" value={draft.assetDescription || draft.deviceModel || '-'} />
                  <SummaryItem label="รับชำระเบื้องต้น" value={`${Number(draft.depositPaid || 0).toLocaleString('th-TH')} ฿`} />
                </div>
                <button type="button" disabled={!canSubmit} onClick={onConfirmCreate} className="min-h-12 rounded-xl bg-blue-700 px-7 font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40">
                  {runtime.submitting ? 'กำลังบันทึก' : 'ยืนยันเปิดใบรับซ่อม'}
                </button>
              </div>
            </section>
          ) : null}
        </main>
      </div>

      {!externalMode && !(runtime.intakeContext && createOpen && canSubmit) ? (
        <nav aria-label="ขั้นตอนรับซ่อมบนมือถือ" className="sticky bottom-3 z-20 mt-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur xl:hidden">
          <div className="flex items-center gap-3">
            <button type="button" disabled={currentStep === 1} onClick={goBack} className="min-h-12 rounded-xl border border-slate-300 px-4 font-black text-slate-700 disabled:opacity-40">
              ย้อนกลับ
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-xs font-black text-slate-500">ขั้นที่ {currentStep}/3</p>
              <p className="truncate text-sm font-black text-slate-900">
                {currentStep === 1 ? 'เลือกลูกค้า' : currentStep === 2 ? 'เลือกหรือกรอกสิ่งที่รับซ่อม' : 'กรอกรายละเอียดงาน'}
              </p>
            </div>
            {currentStep < 3 ? (
              <button type="button" onClick={goForward} className="min-h-12 rounded-xl bg-blue-700 px-5 font-black text-white">
                {currentStep === 1 && !runtime.selectedCustomer?.id
                  ? 'เลือกลูกค้า'
                  : currentStep === 2 && !runtime.intakeContext
                    ? 'กรอกเอง'
                    : 'ถัดไป'}
              </button>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
};

const SummaryItem = ({ label, value }) => (
  <div className="min-w-0 rounded-xl bg-slate-50 px-4 py-3">
    <p className="text-xs font-black text-slate-500">{label}</p>
    <p className="mt-1 truncate font-black text-slate-900">{value}</p>
  </div>
);

export default RepairIntakeWorkspace;
