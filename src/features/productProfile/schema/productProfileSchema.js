// ✅ src/features/productProfile/schema/productProfileSchema.js
import { z } from 'zod';

export const productProfileSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อรูปแบบสินค้า'),
  description: z.string().optional(),
  productTypeId: z
    .string()
    .min(1, 'กรุณาเลือกประเภทสินค้า')
    .transform((val) => parseInt(val, 10)),
});
