// ✅ src/features/productType/schema/productTypeSchema.js
import { z } from 'zod';

export const productTypeSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อประเภทสินค้า'),
});
