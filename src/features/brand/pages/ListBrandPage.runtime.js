import { confirmation, getRuntimeErrorMessage } from '@/runtime';

export const BRAND_CONFIRMATION_KEYS = Object.freeze({
  DETACH_PRODUCT_TYPE_LINK: 'brand.detachProductTypeLink',
});

const normalizeId = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export const buildDetachBrandConfirmationMessage = ({ link, productType }) => {
  const brand = link?.brand || link;
  const brandName = brand?.name || 'แบรนด์นี้';
  const productTypeName = productType?.name || '';

  return `ต้องการถอด "${brandName}" ออกจากประเภทสินค้า "${productTypeName}" หรือไม่?`;
};

export const confirmDetachBrandFromProductType = async ({
  link,
  productType,
  confirmAdapter = globalThis?.window?.confirm,
} = {}) => {
  const linkId = normalizeId(link?.id);
  if (!linkId) return false;

  const key = `${BRAND_CONFIRMATION_KEYS.DETACH_PRODUCT_TYPE_LINK}:${linkId}`;
  const pending = confirmation.confirm({ key });

  try {
    const accepted =
      typeof confirmAdapter === 'function'
        ? Boolean(confirmAdapter(buildDetachBrandConfirmationMessage({ link, productType })))
        : false;

    confirmation.resolve(key, accepted);
  } catch (error) {
    confirmation.cancel(key);
    throw error;
  }

  return pending;
};

export const projectBrandRuntimeError = (error) => getRuntimeErrorMessage(error);
