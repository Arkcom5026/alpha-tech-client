// src/routes/partner/repairRouteConfig.jsx

import { repairFeatureRouteConfigs } from '@/features/repair';

/**
 * Children ของ /:shopSlug/pos/services
 *
 * Final URLs:
 * - /:shopSlug/pos/services/repair-intake
 * - /:shopSlug/pos/services/repairs
 * - /:shopSlug/pos/services/repairs/:repairJobId
 * - /:shopSlug/pos/services/warranty-claims
 * - /:shopSlug/pos/services/warranty-claims/:claimId
 */
export const repairRouteConfigs = repairFeatureRouteConfigs;

export default repairRouteConfigs;
