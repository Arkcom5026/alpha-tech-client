import { normalizeTemplateStatus } from './templateStatus';

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

export const mapProductTemplate = (input = {}) => {
  const id = pick(input.id, input.templateId, input.productTemplateId);
  const name = pick(input.name, input.title, input.productName, 'Untitled Template');

  return {
    id,
    name,
    code: pick(input.code, input.sku, input.noSN),
    status: normalizeTemplateStatus(pick(input.status, input.active === false ? 'INACTIVE' : 'ACTIVE')),
    active: pick(input.active, true),
    brandName: pick(input.brandName, input.brand?.name, '-'),
    categoryName: pick(input.categoryName, input.category?.name, '-'),
    productTypeName: pick(input.productTypeName, input.productType?.name, '-'),
    unitName: pick(input.unitName, input.unit?.name, '-'),
    mode: pick(input.mode, '-'),
    trackSerialNumber: Boolean(pick(input.trackSerialNumber, input.trackSN, false)),
    updatedAt: pick(input.updatedAt, input.createdAt),
    raw: input,
  };
};

export const mapProductTemplateList = (input) => {
  const rows = Array.isArray(input)
    ? input
    : Array.isArray(input?.data)
      ? input.data
      : Array.isArray(input?.items)
        ? input.items
        : Array.isArray(input?.templates)
          ? input.templates
          : [];

  return rows.map(mapProductTemplate);
};
