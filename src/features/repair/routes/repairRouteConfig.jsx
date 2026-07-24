import RepairIntakePage from '../pages/RepairIntakePage';
import RepairJobsPage from '../pages/RepairJobsPage';
import RepairJobDetailPage from '../pages/RepairJobDetailPage';
import WarrantyClaimsPage from '../pages/WarrantyClaimsPage';
import WarrantyClaimDetailPage from '../pages/WarrantyClaimDetailPage';

export const repairFeatureRouteConfigs = [
  { path: 'repair-intake', element: <RepairIntakePage /> },
  { path: 'repairs', element: <RepairJobsPage /> },
  { path: 'repairs/:repairJobId', element: <RepairJobDetailPage /> },
  { path: 'warranty-claims', element: <WarrantyClaimsPage /> },
  { path: 'warranty-claims/:claimId', element: <WarrantyClaimDetailPage /> },
];

export default repairFeatureRouteConfigs;
