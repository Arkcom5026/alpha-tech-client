// Operational Product validation aligned with the current Prisma Product model.

import { z } from 'zod';

const nullableId = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.coerce.number().int().positive().nullable()
);

const optionalMoney = z.preprocess(
  (value) => (value === '' || value === undefined || value === null ? undefined : value),
  z.coerce.number().min(0).optional()
);

export const productSchema = z.object({
  name: z.string().trim().min(1, 'กรุณาระบุชื่อสินค้า'),
  productTypeId: z.coerce.number().int().positive('กรุณาเลือกประเภทสินค้า'),
  brandId: nullableId.optional(),
  unitId: nullableId.optional(),
  mode: z.enum(['SIMPLE', 'STRUCTURED']).default('STRUCTURED'),
  noSN: z.boolean().optional(),
  trackSerialNumber: z.boolean().optional(),
  active: z.boolean().optional(),
  warrantyDays: z.preprocess(
    (value) => (value === '' || value === undefined || value === null ? undefined : value),
    z.coerce.number().int().min(0).optional()
  ),
  costPrice: optionalMoney,
  priceWholesale: optionalMoney,
  priceTechnician: optionalMoney,
  priceRetail: optionalMoney,
  priceOnline: optionalMoney,
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        public_id: z.string().optional().nullable(),
        secure_url: z.string().optional().nullable(),
        caption: z.string().optional().nullable(),
        isCover: z.boolean().optional(),
      })
    )
    .optional(),
});

