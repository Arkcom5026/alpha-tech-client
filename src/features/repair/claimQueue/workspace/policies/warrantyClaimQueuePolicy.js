import { CLAIM_LANES, groupByStatus } from '../../../utils/repairRuntime';

const normalizeQuery = (value) => String(value || '').trim().toLowerCase();

export const getWarrantyClaimSearchValues = (claim) => [
  claim?.claimNo,
  claim?.reason,
  claim?.externalClaimRef,
  claim?.trackingNumber,
  claim?.supplier?.name,
  claim?.serviceProvider,
  claim?.repairJob?.jobNo,
  claim?.repairJob?.customerName,
  claim?.repairJob?.customer?.name,
  claim?.repairJob?.customer?.phone,
  claim?.repairJob?.customer?.email,
  claim?.claimAsset?.displayName,
  claim?.claimAsset?.brand,
  claim?.claimAsset?.category,
  claim?.claimAsset?.model,
  claim?.claimAsset?.barcode,
  claim?.claimAsset?.serialNumber,
  claim?.claimAsset?.imei,
  claim?.stockItem?.product?.name,
  claim?.stockItem?.barcode,
  claim?.stockItem?.serialNumber,
  claim?.device?.brand,
  claim?.device?.model,
  claim?.device?.barcode,
  claim?.device?.serialNumber,
  claim?.device?.imei,
];

export const filterWarrantyClaims = (claims = [], query = '') => {
  const normalized = normalizeQuery(query);
  if (!normalized) return claims;

  return claims.filter((claim) =>
    getWarrantyClaimSearchValues(claim)
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized))
  );
};

export const projectWarrantyClaimQueue = (claims = [], query = '') => {
  const filtered = filterWarrantyClaims(claims, query);
  const activeLanes = groupByStatus(filtered, CLAIM_LANES).filter(
    (lane) => lane.items.length > 0
  );

  return {
    filtered,
    activeLanes,
  };
};
