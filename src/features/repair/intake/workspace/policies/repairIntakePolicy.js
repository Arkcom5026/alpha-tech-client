export const emptyRepairIntakeContact = {
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  contactOrganization: '',
  contactRelationship: '',
};

const isRegisteredDeviceContext = (intakeContext) =>
  intakeContext?.sourceType === 'REGISTERED_DEVICE' ||
  intakeContext?.identity?.sourceType === 'REGISTERED_DEVICE';

export const createRepairIntakeDraft = ({ customerId = '', intakeContext = null } = {}) => {
  const registeredDevice = isRegisteredDeviceContext(intakeContext);
  const identity = intakeContext?.identity || {};

  return {
    customerId,
    stockItemId: registeredDevice ? '' : identity.id || '',
    deviceId: registeredDevice ? identity.deviceId || identity.id || '' : '',
    deviceModel:
      identity.product?.name ||
      [identity.brand, identity.model].filter(Boolean).join(' ').trim() ||
      identity.serialNumber ||
      '',
    reportedSymptoms: '',
    depositPaid: 0,
    estimatedCost: 0,
    technicianNotes: '',
    preAgreedService: {
      enabled: false,
      agreedScope: '',
      confirmedByName: '',
      confirmationNote: '',
    },
  };
};

export const projectRepairIntakeContact = (selectedCustomer, currentContact) => {
  if (!selectedCustomer) return currentContact;
  if (currentContact?.contactName || currentContact?.contactPhone) return currentContact;

  return {
    contactName: selectedCustomer.name || selectedCustomer.companyName || '',
    contactPhone: selectedCustomer.phone || selectedCustomer.user?.phone || '',
    contactEmail: selectedCustomer.email || '',
    contactOrganization: selectedCustomer.companyName || '',
    contactRelationship: 'เจ้าของอุปกรณ์',
  };
};

export const canSubmitRepairIntake = ({ draft, intakeContact, submitting }) => {
  const baseReady =
    !submitting &&
    Boolean(Number(draft?.customerId)) &&
    Boolean(draft?.deviceModel?.trim()) &&
    Boolean(draft?.reportedSymptoms?.trim()) &&
    Boolean(intakeContact?.contactName?.trim());

  if (!baseReady) return false;
  if (!draft?.preAgreedService?.enabled) return true;

  return Boolean(draft.preAgreedService.confirmedByName?.trim());
};

export const buildRepairJobPayload = ({ draft, intakeContact }) => {
  const preAgreedService = draft.preAgreedService?.enabled
    ? {
        enabled: true,
        authorizationMode: 'REPAIR_AUTHORIZED',
        agreedScope:
          draft.preAgreedService.agreedScope?.trim() ||
          'ลูกค้าอนุมัติให้ดำเนินการซ่อมตามอาการที่แจ้ง',
        confirmedByName: draft.preAgreedService.confirmedByName.trim(),
        confirmationNote: draft.preAgreedService.confirmationNote?.trim() || null,
      }
    : undefined;

  return {
    ...draft,
    ...intakeContact,
    customerId: Number(draft.customerId),
    stockItemId: draft.stockItemId ? Number(draft.stockItemId) : null,
    deviceId: draft.deviceId ? Number(draft.deviceId) : null,
    depositPaid: Number(draft.depositPaid || 0),
    estimatedCost: Number(draft.estimatedCost || 0),
    ...(preAgreedService ? { preAgreedService } : {}),
  };
};

export const getRepairIntakeStatus = ({ externalMode, intakeNotFound, intakeContext }) => {
  if (externalMode) return 'EXTERNAL';
  if (intakeNotFound) return 'NOT_FOUND';
  if (intakeContext) return 'DEVICE_SELECTED';
  return 'WAITING';
};
