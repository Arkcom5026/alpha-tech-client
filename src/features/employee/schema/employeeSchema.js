// ✅ @filename: employeeSchema.js
// ✅ @folder: src/features/employee/schema/

import { z } from 'zod';

export const employeeSchema = z.object({
  userId: z.string().min(1, 'กรุณาเลือกผู้ใช้'),
  name: z.string().min(1, 'กรุณากรอกชื่อพนักงาน'),
  phone: z
    .string()
    .regex(/^[0-9]{9,10}$/, 'กรุณากรอกเบอร์โทรให้ถูกต้อง (9-10 หลัก)')
    .optional(),
  branchId: z.string().min(1, 'กรุณาระบุสาขา'),
  positionId: z.string().min(1, 'กรุณาระบุตำแหน่ง'),
});