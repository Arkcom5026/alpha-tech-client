import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRepairRuntimeStore from '../store/repairRuntimeStore';
import repairApi from '../api/repairApi';
import RepairIntakeWorkspace from '../intake/workspace/components/RepairIntakeWorkspace';
import {
  buildRepairJobPayload,
  canSubmitRepairIntake,
  createRepairIntakeDraft,
  emptyRepairIntakeContact,
  getRepairIntakeStatus,
  projectRepairIntakeContact,
} from '../intake/workspace/policies/repairIntakePolicy';

const ACTIVE_REPAIR_STATUSES = new Set(['RECEIVED', 'IN_PROGRESS', 'WAITING_PARTS']);

const createRepeatIntakeEvidence = (customerSignature = '') => ({
  photos: [],
  confirmed: false,
  customerSignature,
  allowDataErase: false,
  allowFactoryReset: false,
  allowDisassembly: false,
  allowOutsourceRepair: false,
});

const RepairIntakePage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const runtime = useRepairRuntimeStore();
  const [customerPanelOpen, setCustomerPanelOpen] = useState(false);
  const [intakeContact, setIntakeContact] = useState(emptyRepairIntakeContact);
  const [draft, setDraft] = useState(createRepairIntakeDraft());
  const [intakeEvidence, setIntakeEvidence] = useState(createRepeatIntakeEvidence());
  const [createOpen, setCreateOpen] = useState(false);
  const [externalMode, setExternalMode] = useState(false);

  const registeredDeviceSelected =
    runtime.intakeContext?.sourceType === 'REGISTERED_DEVICE' ||
    runtime.intakeContext?.identity?.sourceType === 'REGISTERED_DEVICE';
  const selectedStockItemId = registeredDeviceSelected
    ? ''
    : runtime.intakeContext?.identity?.id || '';
  const contextCustomerId = useMemo(
    () => runtime.selectedCustomer?.id || runtime.intakeContext?.latestSale?.customerId || '',
    [runtime.selectedCustomer, runtime.intakeContext]
  );

  useEffect(() => {
    setIntakeContact((current) =>
      projectRepairIntakeContact(runtime.selectedCustomer, current)
    );
  }, [runtime.selectedCustomer]);

  useEffect(() => {
    if (!intakeContact.contactName) return;
    setIntakeEvidence((current) =>
      current.customerSignature.trim()
        ? current
        : { ...current, customerSignature: intakeContact.contactName }
    );
  }, [intakeContact.contactName]);

  const repeatIntakeCanSubmit = Boolean(
    canSubmitRepairIntake({ draft, intakeContact, submitting: runtime.submitting }) &&
      intakeEvidence.confirmed &&
      intakeEvidence.customerSignature.trim()
  );

  const openCreateDialog = () => {
    const nextDraft = createRepairIntakeDraft({
      customerId: contextCustomerId,
      intakeContext: runtime.intakeContext,
    });
    setDraft({
      ...nextDraft,
      preAgreedService: {
        ...nextDraft.preAgreedService,
        confirmedByName: intakeContact.contactName || '',
      },
    });
    setIntakeEvidence(createRepeatIntakeEvidence(intakeContact.contactName || ''));
    setCreateOpen(true);
  };

  const createJob = async () => {
    if (!repeatIntakeCanSubmit) return;

    const created = await runtime.createJob(
      buildRepairJobPayload({ draft, intakeContact })
    );

    if (!created?.id) return;

    try {
      await repairApi.saveIntakeEvidence(created.id, intakeEvidence);
    } catch (error) {
      navigate(`/${shopSlug}/pos/services/repairs/${created.id}`, {
        state: { evidenceWarning: error.message },
      });
      return;
    }

    navigate(`/${shopSlug}/pos/services/repairs/${created.id}`);
  };

  const selectCustomer = async (customer) => {
    await runtime.selectCustomer(customer);
    setCustomerPanelOpen(true);
  };

  const selectSearchDevice = async (device) => {
    if (!runtime.selectedCustomer?.id && device?.latestCustomer?.id) {
      await runtime.selectCustomer(device.latestCustomer);
    }

    if (device?.sourceType === 'REGISTERED_DEVICE') {
      const latestRepair = device?.latestRepairJob || null;
      if (latestRepair?.id && ACTIVE_REPAIR_STATUSES.has(latestRepair.status)) {
        navigate(`/${shopSlug}/pos/services/repairs/${latestRepair.id}`);
        return;
      }

      runtime.selectRegisteredDeviceForIntake(device);
      setCreateOpen(false);
      setExternalMode(false);
      return;
    }

    const lookup =
      device?.barcode ||
      device?.serialNumber ||
      device?.imei ||
      device?.serviceTag ||
      device?.id;
    if (lookup) await runtime.searchIntake(lookup);
  };

  const clearCustomer = () => {
    runtime.clearSelectedCustomer();
    setIntakeContact(emptyRepairIntakeContact);
    setIntakeEvidence(createRepeatIntakeEvidence());
    setCreateOpen(false);
    setExternalMode(false);
    setCustomerPanelOpen(false);
  };

  const resetAll = () => {
    runtime.resetIntake();
    setIntakeContact(emptyRepairIntakeContact);
    setIntakeEvidence(createRepeatIntakeEvidence());
    setCreateOpen(false);
    setExternalMode(false);
    setCustomerPanelOpen(false);
  };

  const startExternalIntake = () => {
    if (!runtime.selectedCustomer?.id) {
      setCustomerPanelOpen(true);
      return;
    }
    runtime.clearError();
    setCreateOpen(false);
    setExternalMode(true);
  };

  const createExternalIntake = async (payload) => {
    const { intakeEvidence: externalEvidence, ...intakePayload } = payload;
    const created = await runtime.createExternalIntake(intakePayload);
    if (!created?.repairJob?.id) return;

    try {
      await repairApi.saveIntakeEvidence(created.repairJob.id, externalEvidence);
    } catch (error) {
      navigate(`/${shopSlug}/pos/services/repairs/${created.repairJob.id}`, {
        state: { evidenceWarning: error.message },
      });
      return;
    }

    navigate(`/${shopSlug}/pos/services/repairs/${created.repairJob.id}`);
  };

  const retryCurrentSearch = () => runtime.searchDirectory(runtime.intakeLookup);
  const onDraftChange = (field, value) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const workspaceRuntime = {
    ...runtime,
    onLookupChange: runtime.setIntakeLookup,
    onSearchDirectory: runtime.searchDirectory,
    onOpenCustomerPanel: () => setCustomerPanelOpen(true),
  };

  const status = getRepairIntakeStatus({
    externalMode,
    intakeNotFound: runtime.intakeNotFound,
    intakeContext: runtime.intakeContext,
  });

  return (
    <RepairIntakeWorkspace
      runtime={workspaceRuntime}
      customerPanelOpen={customerPanelOpen}
      createOpen={createOpen}
      externalMode={externalMode}
      intakeContact={intakeContact}
      intakeEvidence={intakeEvidence}
      draft={draft}
      selectedStockItemId={selectedStockItemId}
      status={status}
      canSubmit={repeatIntakeCanSubmit}
      onToggleCustomerPanel={() => setCustomerPanelOpen((open) => !open)}
      onSelectDevice={selectSearchDevice}
      onSelectCustomer={selectCustomer}
      onReset={resetAll}
      onClearCustomer={clearCustomer}
      onSelectWarrantyAsset={runtime.selectWarrantyAsset}
      onRefreshWarrantyAssets={runtime.loadCustomerWarrantyAssets}
      onStartExternalIntake={startExternalIntake}
      onCancelExternalIntake={() => setExternalMode(false)}
      onSubmitExternalIntake={createExternalIntake}
      onRetry={retryCurrentSearch}
      onOpenJob={(id) => navigate(`/${shopSlug}/pos/services/repairs/${id}`)}
      onOpenClaim={(id) =>
        navigate(`/${shopSlug}/pos/services/warranty-claims/${id}`)
      }
      onCreateJob={openCreateDialog}
      onContactChange={setIntakeContact}
      onIntakeEvidenceChange={setIntakeEvidence}
      onCloseCreate={() => setCreateOpen(false)}
      onDraftChange={onDraftChange}
      onConfirmCreate={createJob}
    />
  );
};

export default RepairIntakePage;
