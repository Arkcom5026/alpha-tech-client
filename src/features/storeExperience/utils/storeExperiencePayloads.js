import { PLATFORM_THEME_TOKENS } from '../constants/storeExperienceDefaults';

export const buildCapabilityPayload = (capability, enabled = capability.storefrontEnabled) => ({
  ...capability,
  storefrontEnabled: enabled,
  storefrontSlug: String(capability.storefrontSlug || '').trim().toLowerCase(),
  displayName: String(capability.displayName || '').trim() || null,
  contactPhone: String(capability.contactPhone || '').trim() || null,
  fixedDeliveryFee: capability.deliveryEnabled && capability.deliveryFeeMode === 'FIXED'
    ? Number(capability.fixedDeliveryFee || 0)
    : null,
  maxDeliveryDistanceKm: capability.deliveryEnabled && capability.serviceAreaMode === 'DISTANCE'
    ? Number(capability.maxDeliveryDistanceKm || 0)
    : null,
  deliveryFeeMode: capability.deliveryEnabled ? capability.deliveryFeeMode : null,
  serviceAreaMode: capability.deliveryEnabled ? capability.serviceAreaMode : 'PICKUP_ONLY',
  serviceAreas: capability.deliveryEnabled && capability.serviceAreaMode === 'ADMIN_AREAS'
    ? capability.serviceAreas || []
    : [],
});

export const buildDraftPayload = (draft) => ({
  themePreset: 'platform-default',
  themeTokens: { ...PLATFORM_THEME_TOKENS },
  layoutPreset: 'platform-default',
  sectionConfiguration: draft.sectionConfiguration,
  contentConfiguration: draft.contentConfiguration,
});
