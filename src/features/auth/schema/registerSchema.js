
// ✅ @filename: registerSchema.js
// ✅ @folder: src/features/auth/schema/

import { z } from 'zod';
export const registerSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัว'),
  confirmPassword: z.string(),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9+]+$/.test(val), {
      message: 'เบอร์โทรศัพท์ไม่ถูกต้อง',
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});