import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRepairRuntimeStore from '../store/repairRuntimeStore';
import WarrantyClaimQueueWorkspace from '../claimQueue/workspace/components/WarrantyClaimQueueWorkspace';
import { projectWarrantyClaimQueue } from '../claimQueue/workspace/policies/warrantyClaimQueuePolicy';

const WarrantyClaimsPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const [query, setQuery] = useState('');

  const claims = useRepairRuntimeStore((state) => state.claims);
  const loading = useRepairRuntimeStore((state) => state.loading);
  const error = useRepairRuntimeStore((state) => state.error);
  const loadClaims = useRepairRuntimeStore((state) => state.loadClaims);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const { filtered, activeLanes } = useMemo(
    () => projectWarrantyClaimQueue(claims, query),
    [claims, query]
  );

  return (
    <WarrantyClaimQueueWorkspace
      query={query}
      onQueryChange={setQuery}
      onRefresh={loadClaims}
      loading={loading}
      error={error}
      filteredClaims={filtered}
      activeLanes={activeLanes}
      onRetry={loadClaims}
      onOpenClaim={(claim) =>
        navigate(`/${shopSlug}/pos/services/warranty-claims/${claim.id}`)
      }
    />
  );
};

export default WarrantyClaimsPage;
