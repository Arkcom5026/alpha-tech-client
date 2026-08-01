import { useQuery } from '@tanstack/react-query';
import {
  getMissingCostResolutionAuditHistory,
  getMissingCostResolutionDetail,
  listMissingCostResolutions,
} from '../api/missingCostResolutionApi';

export const missingCostResolutionKeys = {
  all: ['missing-cost-resolutions'],
  queue: (filters) => ['missing-cost-resolutions', 'queue', filters],
  detail: (resolutionId) => ['missing-cost-resolutions', 'detail', String(resolutionId)],
  audit: (resolutionId) => ['missing-cost-resolutions', 'audit', String(resolutionId)],
};

export const useMissingCostResolutionQueue = (filters) => useQuery({
  queryKey: missingCostResolutionKeys.queue(filters),
  queryFn: () => listMissingCostResolutions(filters),
  staleTime: 15_000,
});

export const useMissingCostResolutionDetail = (resolutionId) => useQuery({
  queryKey: missingCostResolutionKeys.detail(resolutionId),
  queryFn: () => getMissingCostResolutionDetail(resolutionId),
  enabled: Boolean(resolutionId),
});

export const useMissingCostResolutionAuditHistory = (resolutionId) => useQuery({
  queryKey: missingCostResolutionKeys.audit(resolutionId),
  queryFn: () => getMissingCostResolutionAuditHistory(resolutionId),
  enabled: Boolean(resolutionId),
});
