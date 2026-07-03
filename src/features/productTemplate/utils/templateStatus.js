export const PRODUCT_TEMPLATE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DRAFT: 'DRAFT',
  ARCHIVED: 'ARCHIVED',
};

export const PRODUCT_TEMPLATE_STATUS_LABEL = {
  [PRODUCT_TEMPLATE_STATUS.ACTIVE]: 'Active',
  [PRODUCT_TEMPLATE_STATUS.INACTIVE]: 'Inactive',
  [PRODUCT_TEMPLATE_STATUS.DRAFT]: 'Draft',
  [PRODUCT_TEMPLATE_STATUS.ARCHIVED]: 'Archived',
};

export const normalizeTemplateStatus = (value) => {
  const status = String(value || '').toUpperCase();
  return PRODUCT_TEMPLATE_STATUS[status] || PRODUCT_TEMPLATE_STATUS.ACTIVE;
};

export const getTemplateStatusLabel = (value) => PRODUCT_TEMPLATE_STATUS_LABEL[normalizeTemplateStatus(value)];
