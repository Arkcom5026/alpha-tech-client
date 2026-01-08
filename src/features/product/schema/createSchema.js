// ✅ createSchema.js

import { z } from 'zod';

export const createProductSchema = z.object({
    name: z.string().min(1, 'กรุณาระบุชื่อสินค้า'),
    code: z.string().min(1, 'กรุณาระบุรหัสสินค้า'),
    barcode: z.string().optional(),
    price: z.number().min(0, 'ราคาต้องมากกว่าหรือเท่ากับ 0'),
    stock: z.number().min(0, 'สต๊อกเริ่มต้นต้องมากกว่าหรือเท่ากับ 0'),
    productTemplateId: z.string().min(1, 'กรุณาเลือกสเปกสินค้า (SKU)'),
    productProfileId: z.string().min(1, 'กรุณาเลือกรุ่นสินค้า'),
    unitId: z.string().min(1, 'กรุณาเลือกหน่วยนับ'),
    categoryId: z.string().min(1, 'กรุณาเลือกหมวดสินค้า'),
    images: z.array(
      z.object({
        url: z.string(),
        caption: z.string().optional(),
      })
    ).min(1, 'กรุณาอัปโหลดอย่างน้อย 1 รูปภาพ'),
    isActive: z.boolean().optional(),
  });
  
  // ✅ editSchema.js
  export const editProductSchema = createProductSchema.extend({
    // ในอนาคตสามารถเพิ่ม field เช่น id, updatedAt ได้ที่นี่
  });


  
