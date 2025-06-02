import { z } from 'zod';

export const receiptItemSchema = z.object({
  purchaseOrderItemId: z
    .string()
    .min(1, 'กรุณาเลือกสินค้าในใบสั่งซื้อ'),

  quantity: z
    .number({ required_error: 'กรุณาระบุจำนวน' })
    .int('จำนวนต้องเป็นเลขจำนวนเต็ม')
    .min(1, 'จำนวนต้องมากกว่า 0'),

  costPrice: z
    .number({ required_error: 'กรุณาระบุราคาต่อหน่วย' })
    .min(0, 'ราคาต้องไม่ติดลบ'),
});
