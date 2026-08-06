import { BadgeCheck, Building2, ImagePlus, PackageSearch, Phone } from 'lucide-react';

export const SECTION_OPTIONS = [
  ['HERO', 'ภาพเปิดร้าน', 'ภาพหลัก คำโปรย และข้อความต้อนรับลูกค้า', ImagePlus],
  ['FEATURED_PRODUCTS', 'สินค้าแนะนำ', 'นำเสนอสินค้าที่ร้านต้องการผลักดันเป็นพิเศษ', BadgeCheck],
  ['PRODUCT_GRID', 'สินค้าทั้งหมด', 'แสดงสินค้าพร้อมขายจากร้านในรูปแบบมาตรฐาน', PackageSearch],
  ['FULFILLMENT', 'การรับสินค้า', 'แจ้งวิธีรับสินค้าและบริการจัดส่งของร้าน', Building2],
  ['CONTACT', 'ช่องทางติดต่อ', 'แสดงข้อมูลติดต่อเพื่อสร้างความมั่นใจให้ลูกค้า', Phone],
];

export const DEFAULT_CAPABILITY = Object.freeze({
  storefrontEnabled: false,
  storefrontSlug: '',
  displayName: '',
  contactPhone: '',
  pickupEnabled: true,
  deliveryEnabled: false,
  deliveryFeeMode: null,
  fixedDeliveryFee: null,
  serviceAreaMode: 'PICKUP_ONLY',
  maxDeliveryDistanceKm: null,
  preparationSlaMinutes: 60,
  pickupInstruction: 'รับสินค้าที่หน้าร้าน',
  deliveryInstruction: null,
  serviceAreas: [],
});

export const PLATFORM_THEME_TOKENS = Object.freeze({
  brandPrimary: '#f97316',
  brandAccent: '#fb923c',
  surface: '#ffffff',
  text: '#0f172a',
});

export const DEFAULT_CONTENT_CONFIGURATION = Object.freeze({
  identity: {
    logoAssetId: null,
    coverAssetId: null,
    tagline: '',
    shortDescription: '',
  },
  hero: {
    desktopAssetId: null,
    mobileAssetId: null,
    eyebrow: '',
    title: '',
    description: '',
    ctaLabel: 'เลือกซื้อสินค้า',
    ctaTarget: '/products',
  },
  promotions: [],
});

export const createDefaultDraft = () => ({
  status: 'DRAFT',
  themePreset: 'platform-default',
  themeTokens: { ...PLATFORM_THEME_TOKENS },
  layoutPreset: 'platform-default',
  sectionConfiguration: SECTION_OPTIONS.map(([type], index) => ({
    id: `${type.toLowerCase().replaceAll('_', '-')}-${index + 1}`,
    type,
    enabled: true,
  })),
  contentConfiguration: {
    identity: { ...DEFAULT_CONTENT_CONFIGURATION.identity },
    hero: { ...DEFAULT_CONTENT_CONFIGURATION.hero },
    promotions: [],
  },
});
