import {
  buildCreatePurchaseOrderPayload,
  buildUpdatePurchaseOrderPayload,
} from '../builders/purchaseOrderPayloadBuilder';
import {
  canEditPurchaseOrder,
  getPurchaseOrderEditBlockedReason,
} from '../policies/purchaseOrderEditPolicy';
import { purchaseOrderSchema } from '../schema/purchaseOrderSchema';

const getSubmitErrorMessage = (error) =>
  String(
    error?.response?.data?.error ||
      error?.response?.data?.message ||
      'เกิดข้อผิดพลาดระหว่างบันทึก กรุณาลองใหม่อีกครั้ง'
  );

export const executePurchaseOrderSubmit = async ({
  mode,
  id,
  currentBranchId,
  supplier,
  products,
  note,
  shouldPrint,
  purchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  shopSlug,
}) => {
  if (!currentBranchId) {
    return {
      ok: false,
      error: 'ไม่พบข้อมูลสาขาของพนักงาน กรุณาเข้าสู่ระบบใหม่',
    };
  }

  if (mode === 'edit' && purchaseOrder && !canEditPurchaseOrder(purchaseOrder)) {
    return {
      ok: false,
      error: getPurchaseOrderEditBlockedReason(purchaseOrder),
    };
  }

  if (typeof purchaseOrderSchema?.validate === 'function') {
    const validation = purchaseOrderSchema.validate({
      mode,
      branchId: currentBranchId,
      supplierId: supplier?.id,
      products,
    });

    if (!validation.isValid) {
      return {
        ok: false,
        error: Object.values(validation.errors || {})[0] || '',
      };
    }
  }

  const payload =
    mode === 'edit'
      ? buildUpdatePurchaseOrderPayload({ note, products })
      : buildCreatePurchaseOrderPayload({ supplierId: supplier?.id, note, products });

  if (payload.items.length !== products.length) {
    return {
      ok: false,
      error: 'กรุณาตรวจสอบจำนวนและราคาทุนของสินค้าทุกรายการ',
    };
  }

  try {
    if (mode === 'edit' && id) {
      const updated = await updatePurchaseOrder(id, payload);
      if (!updated?.success) {
        return {
          ok: false,
          error: 'บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง',
        };
      }

      return {
        ok: true,
        destination: shouldPrint
          ? `/${shopSlug}/pos/purchases/orders/print/${id}`
          : `/${shopSlug}/pos/purchases/orders`,
      };
    }

    const created = await createPurchaseOrder(payload);
    const createdId = created?.id || created?.data?.id;
    if (!createdId) {
      return {
        ok: false,
        error: 'บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง',
      };
    }

    return {
      ok: true,
      destination: shouldPrint
        ? `/${shopSlug}/pos/purchases/orders/print/${createdId}`
        : `/${shopSlug}/pos/purchases/orders`,
    };
  } catch (error) {
    console.error('[PO] submit error:', error);
    return {
      ok: false,
      error: getSubmitErrorMessage(error),
    };
  }
};
