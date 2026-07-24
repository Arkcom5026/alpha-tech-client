import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRepairRuntimeStore from '../store/repairRuntimeStore';
import RepairShellHeader from '../components/RepairShellHeader';
import RuntimeStatePanel from '../components/RuntimeStatePanel';
import RepairDeviceSearchPanel from '../components/RepairDeviceSearchPanel';
import RepairCustomerSection from '../components/RepairCustomerSection';
import CustomerWarrantyAssets from '../components/CustomerWarrantyAssets';
import RepairIntakeContactForm from '../components/RepairIntakeContactForm';
import IntakeProjection from '../components/IntakeProjection';

const emptyContact = {
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  contactOrganization: '',
  contactRelationship: '',
};

const RepairIntakePage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const runtime = useRepairRuntimeStore();
  const [searchPath, setSearchPath] = useState('DEVICE');
  const [intakeContact, setIntakeContact] = useState(emptyContact);
  const [draft, setDraft] = useState({
    customerId: '',
    stockItemId: '',
    deviceModel: '',
    reportedSymptoms: '',
    depositPaid: 0,
    estimatedCost: 0,
    technicianNotes: '',
  });
  const [createOpen, setCreateOpen] = useState(false);

  const identity = runtime.intakeContext?.identity || {};
  const selectedStockItemId = identity?.id || '';

  const contextCustomerId = useMemo(
    () => runtime.selectedCustomer?.id || runtime.intakeContext?.latestSale?.customerId || '',
    [runtime.selectedCustomer, runtime.intakeContext]
  );

  useEffect(() => {
    if (!runtime.selectedCustomer) return;
    setIntakeContact((current) => {
      if (current.contactName || current.contactPhone) return current;
      return {
        contactName: runtime.selectedCustomer.name || runtime.selectedCustomer.companyName || '',
        contactPhone: runtime.selectedCustomer.phone || runtime.selectedCustomer.user?.phone || '',
        contactEmail: runtime.selectedCustomer.email || '',
        contactOrganization: runtime.selectedCustomer.companyName || '',
        contactRelationship: 'เจ้าของอุปกรณ์',
      };
    });
  }, [runtime.selectedCustomer]);

  const openCreateDialog = () => {
    const context = runtime.intakeContext;
    setDraft({
      customerId: contextCustomerId,
      stockItemId: context?.identity?.id || '',
      deviceModel: context?.identity?.product?.name || context?.identity?.serialNumber || '',
      reportedSymptoms: '',
      depositPaid: 0,
      estimatedCost: 0,
      technicianNotes: '',
    });
    setCreateOpen(true);
  };

  const createJob = async () => {
    if (!Number(draft.customerId) || !draft.deviceModel.trim() || !draft.reportedSymptoms.trim()) return;
    if (!intakeContact.contactName.trim()) return;

    const created = await runtime.createJob({
      ...draft,
      ...intakeContact,
      customerId: Number(draft.customerId),
      stockItemId: draft.stockItemId ? Number(draft.stockItemId) : null,
      depositPaid: Number(draft.depositPaid || 0),
      estimatedCost: Number(draft.estimatedCost || 0),
    });

    if (created?.id) navigate(`/${shopSlug}/pos/services/repairs/${created.id}`);
  };

  const selectCustomer = async (customer) => {
    setSearchPath('CUSTOMER');
    await runtime.selectCustomer(customer);
  };

  const clearCustomer = () => {
    runtime.clearSelectedCustomer();
    setIntakeContact(emptyContact);
    setCreateOpen(false);
  };

  const resetAll = () => {
    runtime.resetIntake();
    setIntakeContact(emptyContact);
    setCreateOpen(false);
  };

  return (
    <div>
      <RepairShellHeader
        eyebrow="After-sales Runtime"
        title="รับซ่อมและรับเคลม"
        description="ค้นหาได้สองทาง: Barcode/SN เพื่อพบอุปกรณ์ทันที หรือค้นหาลูกค้าแล้วเลือกสินค้าที่มีประกัน"
      />

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => setSearchPath('DEVICE')}
          className={`min-h-12 rounded-xl px-4 font-black ${searchPath === 'DEVICE' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          ค้นหาจากอุปกรณ์
        </button>
        <button
          type="button"
          onClick={() => setSearchPath('CUSTOMER')}
          className={`min-h-12 rounded-xl px-4 font-black ${searchPath === 'CUSTOMER' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          ค้นหาจากลูกค้า
        </button>
      </div>

      {searchPath === 'DEVICE' ? (
        <RepairDeviceSearchPanel
          value={runtime.intakeLookup}
          loading={runtime.loading}
          onChange={runtime.setIntakeLookup}
          onSearch={runtime.searchIntake}
          onReset={resetAll}
        />
      ) : (
        <div className="space-y-5">
          <RepairCustomerSection
            selectedCustomer={runtime.selectedCustomer}
            loading={runtime.loading}
            onSelectCustomer={selectCustomer}
            onClearCustomer={clearCustomer}
          />
          <CustomerWarrantyAssets
            customer={runtime.selectedCustomer}
            assets={runtime.customerWarrantyAssets}
            loading={runtime.loading}
            selectedStockItemId={selectedStockItemId}
            onSelectAsset={runtime.selectWarrantyAsset}
            onRefresh={runtime.loadCustomerWarrantyAssets}
          />
        </div>
      )}

      {(searchPath === 'DEVICE' || runtime.error || runtime.loading) ? (
        <div className="mt-5">
          <RuntimeStatePanel
            loading={runtime.loading}
            error={runtime.error}
            empty={!runtime.loading && !runtime.error && !runtime.intakeContext}
            emptyText={
              searchPath === 'CUSTOMER'
                ? 'เลือกลูกค้าแล้ว ระบบจะแสดงสินค้าที่มีประกันด้านบน'
                : 'สแกนบาร์โค้ดหรือหมายเลขซีเรียลเพื่อเริ่มรับเรื่อง'
            }
            onRetry={() =>
              searchPath === 'CUSTOMER'
                ? runtime.loadCustomerWarrantyAssets()
                : runtime.searchIntake(runtime.intakeLookup)
            }
          />
        </div>
      ) : null}

      {runtime.intakeContext ? (
        <div className="mt-5 space-y-5">
          <IntakeProjection
            context={runtime.intakeContext}
            onOpenJob={(id) => navigate(`/${shopSlug}/pos/services/repairs/${id}`)}
            onOpenClaim={(id) => navigate(`/${shopSlug}/pos/services/warranty-claims/${id}`)}
            onCreateJob={openCreateDialog}
          />

          <RepairIntakeContactForm
            value={intakeContact}
            customer={runtime.selectedCustomer}
            onChange={setIntakeContact}
          />

          {createOpen ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">เปิดใบรับซ่อม</h2>
              <p className="mt-1 text-xs text-slate-500">Customer และ StockItem ถูกเติมจากบริบทที่เลือกโดยอัตโนมัติ</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  value={draft.customerId}
                  readOnly
                  placeholder="Customer ID"
                  className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3"
                />
                <input
                  value={draft.stockItemId}
                  readOnly
                  placeholder="StockItem ID"
                  className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3"
                />
                <input
                  value={draft.deviceModel}
                  onChange={(event) => setDraft((current) => ({ ...current, deviceModel: event.target.value }))}
                  placeholder="รุ่นหรือรายละเอียดอุปกรณ์"
                  className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
                />
                <textarea
                  rows={4}
                  value={draft.reportedSymptoms}
                  onChange={(event) => setDraft((current) => ({ ...current, reportedSymptoms: event.target.value }))}
                  placeholder="อาการที่ลูกค้าแจ้ง *"
                  className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
                />
                <input
                  type="number"
                  min="0"
                  value={draft.depositPaid}
                  onChange={(event) => setDraft((current) => ({ ...current, depositPaid: event.target.value }))}
                  placeholder="มัดจำ"
                  className="rounded-xl border border-slate-300 px-4 py-3"
                />
                <input
                  type="number"
                  min="0"
                  value={draft.estimatedCost}
                  onChange={(event) => setDraft((current) => ({ ...current, estimatedCost: event.target.value }))}
                  placeholder="ราคาประเมิน"
                  className="rounded-xl border border-slate-300 px-4 py-3"
                />
                <textarea
                  rows={2}
                  value={draft.technicianNotes}
                  onChange={(event) => setDraft((current) => ({ ...current, technicianNotes: event.target.value }))}
                  placeholder="บันทึกภายใน"
                  className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
                />
                <div className="flex gap-2 md:col-span-2">
                  <button
                    type="button"
                    disabled={runtime.submitting || !intakeContact.contactName.trim()}
                    onClick={createJob}
                    className="min-h-12 flex-1 rounded-xl bg-blue-700 px-5 font-black text-white disabled:opacity-40"
                  >
                    {runtime.submitting ? 'กำลังบันทึก' : 'ยืนยันเปิดใบรับซ่อม'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="min-h-12 rounded-xl border border-slate-300 px-5 font-black text-slate-700"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default RepairIntakePage;
