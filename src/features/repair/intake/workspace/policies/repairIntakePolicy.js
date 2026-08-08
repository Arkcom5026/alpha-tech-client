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

export const canSubmitRepairIntake = ({ draft, intakeContact, submitting }) =>
  !submitting &&
  Boolean(Number(draft?.customerId)) &&
  Boolean(draft?.deviceModel?.trim()) &&
  Boolean(draft?.reportedSymptoms?.trim()) &&
  Boolean(intakeContact?.contactName?.trim());

export const buildRepairJobPayload = ({ draft, intakeContact }) => ({
  ...draft,
  ...intakeContact,
  customerId: Number(draft.customerId),
  stockItemId: draft.stockItemId ? Number(draft.stockItemId) : null,
  depositPaid: Number(draft.depositPaid || 0),
  estimatedCost: Number(draft.estimatedCost || 0),
});

export const getRepairIntakeStatus = ({ externalMode, intakeNotFound, intakeContext }) => {
  if (externalMode) return 'EXTERNAL';
  if (intakeNotFound) return 'NOT_FOUND';
  if (intakeContext) return 'DEVICE_SELECTED';
  return 'WAITING';
};
