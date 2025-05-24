// features/unit/schema/editSchema.js
import * as z from 'zod';

const editSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อหน่วยนับ'),
});

export default editSchema;