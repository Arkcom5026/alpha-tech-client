// ตัวอย่างการเพิ่มใน src/routes/partner/posPartnerRoutes.jsx
// ปรับตำแหน่ง import ให้ตรงกับไฟล์ route ปัจจุบันของโปรเจกต์

import { ProductTracePage } from '@/features/product/trace';

// ภายใน children ของ POS route:
{
  path: 'stock/product-trace',
  element: <ProductTracePage />,
}

// URL ที่ได้:
// /advancetech/pos/stock/product-trace
//
// รองรับ deep-link:
// /advancetech/pos/stock/product-trace?barcode=226060257
