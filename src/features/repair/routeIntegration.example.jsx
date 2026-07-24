import { repairRouteConfigs } from '@/features/repair';

// ตัวอย่างเมื่อ parent route คือ /advancetech/pos
const posChildren = [
  // ...existing routes
  ...repairRouteConfigs,
];

// URL ที่ได้:
// /advancetech/pos/service/repair-intake
// /advancetech/pos/service/repairs
// /advancetech/pos/service/repairs/:repairJobId
// /advancetech/pos/service/warranty-claims
// /advancetech/pos/service/warranty-claims/:claimId

export default posChildren;
