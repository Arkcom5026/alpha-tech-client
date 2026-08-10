export const emptyRepairIntakeContact = {
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  contactOrganization: '',
  contactRelationship: '',
};

export const createRepairIntakeDraft = ({ customerId = '', intakeContext = null } = {}) => ({
  customerId,
  stockItemId: intakeContext?.identity?.id || '',
  deviceModel:
    intakeContext?.identity?.product?.name ||
    intakeContext?.identity?.serialNumber ||
    '',
  reportedSymptoms: '',
  depositPaid: 0,
  estimatedCost: 0,
  technicianNotes: '',
  preAgreedService: {
    enabled: false,
    agreedScope: '',
    agreedAmount: 0,
    confirmedByName: '',
    confirmationNote: '',
  },
});

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

  const agreedAmount = Number(draft.preAgreedService.agreedAmount);
  return (
    Boolean(draft.preAgreedService.agreedScope?.trim()) &&
    Boolean(draft.preAgreedService.confirmedByName?.trim()) &&
    Number.isFinite(agreedAmount) &&
    agreedAmount >= 0
  );
};

export const buildRepairJobPayload = ({ draft, intakeContact }) => {
  const preAgreedService = draft.preAgreedService?.enabled
    ? {
        enabled: true,
        agreedScope: draft.preAgreedService.agreedScope.trim(),
        agreedAmount: Number(draft.preAgreedService.agreedAmount || 0),
        confirmedByName: draft.preAgreedService.confirmedByName.trim(),
        confirmationNote: draft.preAgreedService.confirmationNote?.trim() || null,
      }
    : undefined;

  return {
    ...draft,
    ...intakeContact,
    customerId: Number(draft.customerId),
    stockItemId: draft.stockItemId ? Number(draft.stockItemId) : null,
    depositPaid: Number(draft.depositPaid || 0),
    estimatedCost: preAgreedService
      ? preAgreedService.agreedAmount
      : Number(draft.estimatedCost || 0),
    ...(preAgreedService ? { preAgreedService } : {}),
  };
};

export const getRepairIntakeStatus = ({ externalMode, intakeNotFound, intakeContext }) => {
  if (externalMode) return 'EXTERNAL';
  if (intakeNotFound) return 'NOT_FOUND';
  if (intakeContext) return 'DEVICE_SELECTED';
  return 'WAITING';
};
