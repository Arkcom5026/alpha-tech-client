import { getRuntimeErrorMessage } from '@/runtime';

export const BRAND_CONFIRMATION_TYPES = Object.freeze({
  TOGGLE_ACTIVE: 'toggle-active',
  DETACH_FROM_PRODUCT_TYPE: 'detach-from-product-type',
});

const normalizeId = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export const createBrandToggleConfirmation = (brand) => {
  const id = normalizeId(brand?.id);
  if (!id) return null;

  const active = brand?.isActive ?? brand?.active ?? true;
  return {
    type: BRAND_CONFIRMATION_TYPES.TOGGLE_ACTIVE,
    key: `brand.toggleActive.${id}`,
    brand,
    nextActive: !active,
  };
};

export const createBrandDetachConfirmation = ({ link, productType } = {}) => {
  const linkId = normalizeId(link?.id);
  if (!linkId) return null;

  return {
    type: BRAND_CONFIRMATION_TYPES.DETACH_FROM_PRODUCT_TYPE,
    key: `brand.detachFromProductType.${linkId}`,
    link,
    productType,
  };
};

export const getBrandConfirmationMessage = (request) => {
  if (request?.type === BRAND_CONFIRMATION_TYPES.TOGGLE_ACTIVE) {
    const action = request.nextActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน';
    return `ยืนยันการ${action}แบรนด์ “${request.brand?.name || 'แบรนด์นี้'}” หรือไม่?`;
  }

  if (request?.type === BRAND_CONFIRMATION_TYPES.DETACH_FROM_PRODUCT_TYPE) {
    const brand = request.link?.brand || request.link;
    return `ต้องการถอด “${brand?.name || 'แบรนด์นี้'}” ออกจากประเภทสินค้า “${request.productType?.name || ''}” หรือไม่?`;
  }

  return '';
};

export const projectBrandRuntimeError = (error) => getRuntimeErrorMessage(error);
