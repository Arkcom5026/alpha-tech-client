import { z } from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อผู้ขาย'),

  contactPerson: z.coerce.string().optional(),

  phone: z
    .string()
    .regex(/^[0-9]{9,10}$/, 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ควรเป็นตัวเลข 9-10 หลัก)')
    .optional(),

  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional(),

  taxId: z
    .string()
    .regex(/^[0-9]{13}$/, 'รูปแบบเลขประจำตัวผู้เสียภาษีไม่ถูกต้อง (ควรเป็นตัวเลข 13 หลัก)')
    .optional(),

  creditLimit: z.coerce.number({ invalid_type_error: 'วงเงินเครดิตต้องเป็นตัวเลข' })
    .min(0, 'วงเงินเครดิตต้องไม่ต่ำกว่า 0')
    .optional(),

  currentBalance: z.coerce.number({ invalid_type_error: 'ยอดค้างชำระต้องเป็นตัวเลข' })
    .min(0, 'ยอดค้างชำระต้องไม่ต่ำกว่า 0')
    .optional(),

  address: z.coerce.string().optional(),
  province: z.coerce.string().optional(),

  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, 'รูปแบบรหัสไปรษณีย์ไม่ถูกต้อง (ควรเป็นตัวเลข 5 หลัก)')
    .optional(),

  country: z.coerce.string().optional(),

  bankId: z.coerce.string().min(1, 'กรุณาเลือกธนาคาร'),

  accountNumber: z
    .string()
    .regex(/^[0-9]+$/, 'กรุณากรอกเฉพาะตัวเลข')
    .optional(),

  accountType: z.coerce.string().optional(),

  paymentTerms: z.coerce.string().optional(),

  notes: z.coerce.string().optional(),

  branchId: z.coerce.string().optional(), // เปลี่ยนตาม type จริง หากเป็น number ให้ใช้ .coerce.number()
});
