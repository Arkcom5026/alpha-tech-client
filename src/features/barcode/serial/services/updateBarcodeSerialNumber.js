import { updateSerialNumberApi } from '../api/updateSerialNumberApi';
import {
  projectSerialNumberUpdateInput,
  projectSerialNumberUpdateResult,
} from '../projections/serialNumberUpdateProjection';

export const updateBarcodeSerialNumber = async (input) => {
  const payload = projectSerialNumberUpdateInput(input);
  const sourceResponse = await updateSerialNumberApi(payload);
  return projectSerialNumberUpdateResult(sourceResponse);
};
