import React from 'react';
import RepairShellHeader from '../../../components/RepairShellHeader';
import RuntimeStatePanel from '../../../components/RuntimeStatePanel';
import RepairDeviceSearchPanel from '../../../components/RepairDeviceSearchPanel';
import RepairCustomerSection from '../../../components/RepairCustomerSection';
import CustomerWarrantyAssets from '../../../components/CustomerWarrantyAssets';
import RepairIntakeContactForm from '../../../components/RepairIntakeContactForm';
import IntakeProjection from '../../../components/IntakeProjection';
import ExternalDeviceIntakeForm from '../../../components/ExternalDeviceIntakeForm';
import MobileIntakeProgress from '../../../components/MobileIntakeProgress';

const statusBadge = {
  EXTERNAL: ['อุปกรณ์ภายนอกร้าน', 'border-blue-200 bg-blue-50 text-blue-700'],
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
  onCloseCreate,
  onDraftChange,
  onConfirmCreate,
}) => {
  const [statusText, statusClass] = statusBadge[status] || statusBadge.WAITING;

  return (
    <div>
      <RepairShellHeader
        eyebrow="After-sales Runtime"
        title="รับซ่อมและรับเคลม"
        description="เลือกลูกค้าและอุปกรณ์ พร้อมบันทึกรายละเอียดรับเรื่องให้จบในหน้าจอเดียว"
      />

      <MobileIntakeProgress
        hasCustomer={Boolean(runtime.selectedCustomer?.id)}
        hasDevice={Boolean(runtime.intakeContext)}
        enteringDetails={externalMode || createOpen}
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(320px,0.76fr)_minmax(0,1.55fr)]">
        <aside className="space-y-4 xl:sticky xl:top-4">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Customer & Device</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">ลูกค้าและอุปกรณ์</h2>
              <p className="mt-1 text-xs text-slate-500">ค้นหาจากทางที่สะดวก แล้วเลือกอุปกรณ์เพื่อเปิดรายการรับซ่อม</p>
            </div>

            <div className="space-y-4 p-4">
              <RepairDeviceSearchPanel
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

            <div className="border-t border-slate-200 bg-slate-50 p-4">
              <button type="button" disabled={!runtime.selectedCustomer?.id} onClick={onStartExternalIntake} className="min-h-11 w-full rounded-xl border border-dashed border-blue-300 bg-white px-4 text-sm font-black text-blue-700 hover:border-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400">
                + เพิ่มอุปกรณ์ภายนอกร้าน
              </button>
              {!runtime.selectedCustomer?.id ? <p className="mt-2 text-center text-xs text-slate-500">เลือกลูกค้าก่อนเพิ่มอุปกรณ์ภายนอก</p> : null}
            </div>
          </section>
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Intake Workspace</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">รายการรับซ่อม</h2>
              </div>
              <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${statusClass}`}>{statusText}</span>
            </div>

            <div className="p-5">
              {externalMode ? (
                <ExternalDeviceIntakeForm
                  customer={runtime.selectedCustomer}
                  submitting={runtime.submitting}
                  error={runtime.error}
                  onCancel={onCancelExternalIntake}
                  onSubmit={onSubmitExternalIntake}
                />
              ) : runtime.error || runtime.loading ? (
                <RuntimeStatePanel loading={runtime.loading} error={runtime.error} empty={false} onRetry={onRetry} />
              ) : runtime.intakeNotFound ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">🔎</div>
                  <h3 className="mt-4 text-lg font-black text-slate-900">ไม่พบลูกค้าหรืออุปกรณ์ “{runtime.intakeNotFoundLookup}”</h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">รายการนี้ไม่ใช่ข้อผิดพลาดของระบบ สามารถเพิ่มลูกค้าใหม่ หรือหากเป็นอุปกรณ์ที่ไม่ได้ซื้อจากร้าน ให้เลือกลูกค้าแล้วลงทะเบียนเป็นอุปกรณ์ภายนอก</p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <button type="button" onClick={runtime.onOpenCustomerPanel} className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700">ค้นหาหรือเพิ่มลูกค้า</button>
                    <button type="button" disabled={!runtime.selectedCustomer?.id} onClick={onStartExternalIntake} className="min-h-11 rounded-xl bg-blue-700 px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">เพิ่มอุปกรณ์ภายนอกร้าน</button>
                  </div>
                  {!runtime.selectedCustomer?.id ? <p className="mt-3 text-xs text-slate-500">ต้องเลือกลูกค้าก่อนจึงจะลงทะเบียนอุปกรณ์ได้</p> : null}
                </div>
              ) : runtime.intakeContext ? (
                <div className="space-y-5">
                  <IntakeProjection context={runtime.intakeContext} onOpenJob={onOpenJob} onOpenClaim={onOpenClaim} onCreateJob={onCreateJob} />
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
                        <input value={draft.deviceModel} onChange={(event) => onDraftChange('deviceModel', event.target.value)} placeholder="รุ่นหรือรายละเอียดอุปกรณ์ *" className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2" />
                        <textarea rows={4} value={draft.reportedSymptoms} onChange={(event) => onDraftChange('reportedSymptoms', event.target.value)} placeholder="อาการที่ลูกค้าแจ้ง *" className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2" />
                        <input type="number" min="0" value={draft.depositPaid} onChange={(event) => onDraftChange('depositPaid', event.target.value)} placeholder="มัดจำ" className="rounded-xl border border-slate-300 px-4 py-3" />
                        <input type="number" min="0" value={draft.estimatedCost} onChange={(event) => onDraftChange('estimatedCost', event.target.value)} placeholder="ราคาประเมิน" className="rounded-xl border border-slate-300 px-4 py-3" />
                        <textarea rows={2} value={draft.technicianNotes} onChange={(event) => onDraftChange('technicianNotes', event.target.value)} placeholder="บันทึกภายใน" className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2" />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-6 text-center">
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
                  <SummaryItem label="อุปกรณ์" value={draft.deviceModel || '-'} />
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
