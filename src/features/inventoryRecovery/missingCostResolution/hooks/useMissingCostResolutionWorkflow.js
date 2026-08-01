import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  appendMissingCostEvidence,
  executeMissingCostRecovery,
  getMissingCostRecoveryApprovalPlan,
  getMissingCostRecoveryAudit,
  getMissingCostRecoveryPreview,
  transitionMissingCostResolution,
} from '../api/missingCostResolutionApi';

const detailKey = (resolutionId) => ['missing-cost-resolution', 'detail', String(resolutionId)];
const auditKey = (resolutionId) => ['missing-cost-resolution', 'audit-history', String(resolutionId)];
const queueKey = ['missing-cost-resolution', 'queue'];

const useRefreshResolution = (resolutionId) => {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: detailKey(resolutionId) }),
      queryClient.invalidateQueries({ queryKey: auditKey(resolutionId) }),
      queryClient.invalidateQueries({ queryKey: queueKey }),
      queryClient.invalidateQueries({ queryKey: ['missing-cost-recovery', String(resolutionId)] }),
    ]);
  };
};

export const useAppendMissingCostEvidence = (resolutionId) => {
  const refresh = useRefreshResolution(resolutionId);
  return useMutation({
    mutationFn: (payload) => appendMissingCostEvidence({ resolutionId, payload }),
    onSuccess: refresh,
  });
};

export const useTransitionMissingCostResolution = (resolutionId) => {
  const refresh = useRefreshResolution(resolutionId);
  return useMutation({
    mutationFn: (payload) => transitionMissingCostResolution({ resolutionId, payload }),
    onSuccess: refresh,
  });
};

export const useMissingCostRecoveryPreview = (resolutionId, enabled = false) => useQuery({
  queryKey: ['missing-cost-recovery', String(resolutionId), 'preview'],
  queryFn: () => getMissingCostRecoveryPreview(resolutionId),
  enabled: Boolean(resolutionId && enabled),
  retry: false,
  staleTime: 0,
});

export const useMissingCostRecoveryApprovalPlan = (resolutionId, enabled = false) => useQuery({
  queryKey: ['missing-cost-recovery', String(resolutionId), 'approval-plan'],
  queryFn: () => getMissingCostRecoveryApprovalPlan(resolutionId),
  enabled: Boolean(resolutionId && enabled),
  retry: false,
  staleTime: 0,
});

export const useExecuteMissingCostRecovery = (resolutionId) => {
  const refresh = useRefreshResolution(resolutionId);
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }) => executeMissingCostRecovery({
      resolutionId,
      payload,
      idempotencyKey,
    }),
    onSuccess: refresh,
  });
};

export const useMissingCostRecoveryAudit = (resolutionId, enabled = false) => useQuery({
  queryKey: ['missing-cost-recovery', String(resolutionId), 'post-recovery-audit'],
  queryFn: () => getMissingCostRecoveryAudit(resolutionId),
  enabled: Boolean(resolutionId && enabled),
  retry: false,
});
