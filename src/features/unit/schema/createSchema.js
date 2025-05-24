// features/unit/schema/createSchema.js
import * as z from 'zod';

const createSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อหน่วยนับ'),
});

export default createSchema;
