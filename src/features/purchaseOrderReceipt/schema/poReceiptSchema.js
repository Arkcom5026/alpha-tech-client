import { z } from 'zod';

export const purchaseOrderReceiptSchema = z.object({
  purchaseOrderId: z
    .string()
    .min(1, 'กรุณาเลือกใบสั่งซื้อ')
    .transform((val) => parseInt(val, 10)),
  receivedAt: z.string().min(1, 'กรุณาระบุวันที่รับของ'),
  note: z.string().optional(),
});