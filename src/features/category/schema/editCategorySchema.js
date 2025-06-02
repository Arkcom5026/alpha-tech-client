// ✅ src/features/category/schema/editCategorySchema.js
import * as z from 'zod';

export const editCategorySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'กรุณากรอกชื่อหมวดหมู่' })
    .max(100, { message: 'ชื่อหมวดหมู่ต้องไม่เกิน 100 ตัวอักษร' })
});
