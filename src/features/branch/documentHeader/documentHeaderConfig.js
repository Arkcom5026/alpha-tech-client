const HEADER_ALIGNMENTS = new Set(['left', 'center', 'right']);
const HEADER_NAME_SIZES = new Set(['sm', 'md', 'lg', 'xl']);
const DOCUMENT_LOGO_SIZE_MIN = 24;
const DOCUMENT_LOGO_SIZE_MAX = 180;
const DOCUMENT_LOGO_SIZE_DEFAULT = 56;
const LEGACY_LOGO_SIZE_PIXELS = Object.freeze({ sm: 40, md: 56, lg: 72, xl: 88 });

const DEFAULT_DOCUMENT_HEADER_PROFILE = Object.freeze({
  showLogo: true,
  logoUrl: '',
  logoPosition: 'left',
  logoSize: DOCUMENT_LOGO_SIZE_DEFAULT,
  textAlign: 'left',
  showStoreName: true,
  storeName: '',
  storeNameSize: 'md',
  showAddress: true,
  address: '',
  showPhone: true,
  phone: '',
  showTaxId: true,
  taxId: '',
  showBranchLabel: true,
  headerNote: '',
});

const cleanString = (value) => (value == null ? '' : String(value).trim());
const cleanBoolean = (value, fallback) => (typeof value === 'boolean' ? value : fallback);

const normalizeLogoSize = (value, fallback = DOCUMENT_LOGO_SIZE_DEFAULT) => {
  const legacy = LEGACY_LOGO_SIZE_PIXELS[cleanString(value).toLowerCase()];
  const raw = legacy ?? Number(value);
  if (Number.isFinite(raw)) {
    return Math.min(DOCUMENT_LOGO_SIZE_MAX, Math.max(DOCUMENT_LOGO_SIZE_MIN, Math.round(raw)));
  }

  const fallbackLegacy = LEGACY_LOGO_SIZE_PIXELS[cleanString(fallback).toLowerCase()];
  const fallbackNumber = fallbackLegacy ?? Number(fallback);
  if (Number.isFinite(fallbackNumber)) {
    return Math.min(DOCUMENT_LOGO_SIZE_MAX, Math.max(DOCUMENT_LOGO_SIZE_MIN, Math.round(fallbackNumber)));
  }
  return DOCUMENT_LOGO_SIZE_DEFAULT;
};

const normalizeHeaderProfile = (source = {}, fallback = DEFAULT_DOCUMENT_HEADER_PROFILE) => {
  const safe = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
  const logoPosition = cleanString(safe.logoPosition).toLowerCase();
  const textAlign = cleanString(safe.textAlign).toLowerCase();
  const storeNameSize = cleanString(safe.storeNameSize).toLowerCase();

  return {
    showLogo: cleanBoolean(safe.showLogo, fallback.showLogo),
    logoUrl: cleanString(safe.logoUrl) || fallback.logoUrl,
    logoPosition: HEADER_ALIGNMENTS.has(logoPosition) ? logoPosition : fallback.logoPosition,
    logoSize: normalizeLogoSize(safe.logoSize, fallback.logoSize),
    textAlign: HEADER_ALIGNMENTS.has(textAlign) ? textAlign : fallback.textAlign,
    showStoreName: cleanBoolean(safe.showStoreName, fallback.showStoreName),
    storeName: cleanString(safe.storeName) || fallback.storeName,
    storeNameSize: HEADER_NAME_SIZES.has(storeNameSize) ? storeNameSize : fallback.storeNameSize,
    showAddress: cleanBoolean(safe.showAddress, fallback.showAddress),
    address: cleanString(safe.address) || fallback.address,
    showPhone: cleanBoolean(safe.showPhone, fallback.showPhone),
    phone: cleanString(safe.phone) || fallback.phone,
    showTaxId: cleanBoolean(safe.showTaxId, fallback.showTaxId),
    taxId: cleanString(safe.taxId) || fallback.taxId,
    showBranchLabel: cleanBoolean(safe.showBranchLabel, fallback.showBranchLabel),
    headerNote: cleanString(safe.headerNote) || fallback.headerNote,
  };
};

const resolveDocumentHeaderProfile = (branch, documentType = 'DEFAULT') => {
  const config = branch?.documentHeaderConfig;
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return { ...DEFAULT_DOCUMENT_HEADER_PROFILE };
  }

  const base = normalizeHeaderProfile(config.default);
  const key = cleanString(documentType).toUpperCase();
  const override = config?.documents?.[key];
  const resolved = normalizeHeaderProfile(override, base);

  // Logo sizing is currently a store-wide setting. The settings UI does not expose
  // per-document logo sizing yet, so hidden legacy overrides must not shadow the
  // visible value the store just configured.
  return {
    ...resolved,
    logoSize: base.logoSize,
  };
};

const buildStoreDocumentHeader = ({ branch, documentType = 'DEFAULT', legacyConfig = {} } = {}) => {
  const profile = resolveDocumentHeaderProfile(branch, documentType);

  const branchAddress =
    branch?.fullAddress ||
    branch?.addressText ||
    branch?.address ||
    legacyConfig?.address ||
    '-';

  const storeName = profile.storeName || legacyConfig?.branchName || branch?.name || branch?.branchName || '-';
  const address = profile.address || branchAddress;
  const phone = profile.phone || legacyConfig?.phone || branch?.phone || '-';
  const taxId = profile.taxId || legacyConfig?.taxId || branch?.taxId || '-';
  const logoUrl = profile.logoUrl || legacyConfig?.logoUrl || branch?.logoUrl || null;

  return {
    ...legacyConfig,
    branchName: profile.showStoreName ? storeName : '',
    address: profile.showAddress ? address : '',
    phone: profile.showPhone ? phone : '',
    taxId: profile.showTaxId ? taxId : '',
    logoUrl: profile.showLogo ? logoUrl : null,
    headerStyle: {
      ...profile,
      logoUrl,
      storeName,
      address,
      phone,
      taxId,
    },
  };
};

const projectDocumentHeaderFormDefaults = (branch) => {
  const profile = resolveDocumentHeaderProfile(branch, 'DEFAULT');
  return {
    headerShowLogo: profile.showLogo,
    headerLogoUrl: profile.logoUrl,
    headerLogoPosition: profile.logoPosition,
    headerLogoSize: normalizeLogoSize(profile.logoSize),
    headerTextAlign: profile.textAlign,
    headerShowStoreName: profile.showStoreName,
    headerStoreName: profile.storeName,
    headerStoreNameSize: profile.storeNameSize,
    headerShowAddress: profile.showAddress,
    headerAddress: profile.address,
    headerShowPhone: profile.showPhone,
    headerPhone: profile.phone,
    headerShowTaxId: profile.showTaxId,
    headerTaxId: profile.taxId,
    headerNote: profile.headerNote,
  };
};

const buildDocumentHeaderConfigFromForm = (data = {}, currentConfig = null) => {
  const currentDefault = normalizeHeaderProfile(currentConfig?.default);

  return {
    version: 1,
    default: {
      showLogo: Boolean(data.headerShowLogo),
      logoUrl: cleanString(data.headerLogoUrl),
      logoPosition: HEADER_ALIGNMENTS.has(cleanString(data.headerLogoPosition).toLowerCase())
        ? cleanString(data.headerLogoPosition).toLowerCase()
        : 'left',
      logoSize: normalizeLogoSize(data.headerLogoSize),
      textAlign: HEADER_ALIGNMENTS.has(cleanString(data.headerTextAlign).toLowerCase())
        ? cleanString(data.headerTextAlign).toLowerCase()
        : 'left',
      showStoreName: Boolean(data.headerShowStoreName),
      storeName: cleanString(data.headerStoreName),
      storeNameSize: HEADER_NAME_SIZES.has(cleanString(data.headerStoreNameSize).toLowerCase())
        ? cleanString(data.headerStoreNameSize).toLowerCase()
        : 'md',
      showAddress: Boolean(data.headerShowAddress),
      address: cleanString(data.headerAddress),
      showPhone: Boolean(data.headerShowPhone),
      phone: cleanString(data.headerPhone),
      showTaxId: Boolean(data.headerShowTaxId),
      taxId: cleanString(data.headerTaxId),
      showBranchLabel: currentDefault.showBranchLabel,
      headerNote: cleanString(data.headerNote),
    },
    documents:
      currentConfig?.documents && typeof currentConfig.documents === 'object' && !Array.isArray(currentConfig.documents)
        ? currentConfig.documents
        : {},
  };
};

export {
  DEFAULT_DOCUMENT_HEADER_PROFILE,
  DOCUMENT_LOGO_SIZE_DEFAULT,
  DOCUMENT_LOGO_SIZE_MAX,
  DOCUMENT_LOGO_SIZE_MIN,
  HEADER_ALIGNMENTS,
  HEADER_NAME_SIZES,
  LEGACY_LOGO_SIZE_PIXELS,
  buildDocumentHeaderConfigFromForm,
  buildStoreDocumentHeader,
  normalizeHeaderProfile,
  normalizeLogoSize,
  projectDocumentHeaderFormDefaults,
  resolveDocumentHeaderProfile,
};
