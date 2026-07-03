// src/features/product/templateCandidate/services/promoteTemplateCandidate.js
import { promoteTemplateCandidateApi } from '../api/templateCandidateApi';
import { mapCandidateResponse } from '../utils/candidateMapper';

export const promoteTemplateCandidate = async (candidateId, options = {}) => {
  if (!candidateId) {
    throw new Error('Template Candidate ID is required');
  }

  const response = await promoteTemplateCandidateApi(candidateId, {
    targetTemplateProductId: options.targetTemplateProductId || null,
    promoteMode: options.promoteMode || 'CREATE_TEMPLATE',
    adminNote: options.adminNote || '',
    mergeExisting: !!options.mergeExisting,
  });

  return mapCandidateResponse(response);
};

export default promoteTemplateCandidate;
