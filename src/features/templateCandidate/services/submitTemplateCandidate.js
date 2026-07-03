// src/features/product/templateCandidate/services/submitTemplateCandidate.js
import { submitTemplateCandidateApi } from '../api/templateCandidateApi';
import {
  buildCandidatePayloadFromLocalProduct,
  mapCandidateResponse,
} from '../utils/candidateMapper';

export const submitTemplateCandidate = async ({
  localProduct,
  branchPrice,
  source = 'LOCAL_PRODUCT',
  note,
  metadata,
} = {}) => {
  const payload = buildCandidatePayloadFromLocalProduct({
    localProduct,
    branchPrice,
    source,
    note,
    metadata,
  });

  const response = await submitTemplateCandidateApi(payload);
  return mapCandidateResponse(response);
};

export default submitTemplateCandidate;
