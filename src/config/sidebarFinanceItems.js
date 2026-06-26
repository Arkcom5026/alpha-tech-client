// src/config/sidebarFinanceItems.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

/**
 * 🟢 [DYNAMIC FIXED] แปลงเป็นฟังก์ชันรับค่า shopSlug เพื่อควบคุมสิทธิ์โมดูลบัญชีและการเงินระดับองค์กร
 */
export const getSidebarFinanceItems = (shopSlug) => {
  const prefix = shopSlug ? `/${shopSlug}/pos` : '/pos';

  return [
    {
      label: 'การเงิน',
      items: [
        { label: 'สรุปปิดร้าน', to: `${prefix}/finance/daily-closing`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'ลูกหนี้/ยอดค้าง', to: `${prefix}/finance/ar`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'เครดิตลูกค้า', to: `${prefix}/finance/customer-credit`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'ใบรับชำระลูกหนี้', to: `${prefix}/finance/customer-receipts`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'คืนเงินลูกค้า', to: `${prefix}/finance/refunds`, cap: P1_CAP.POS_SALE },
        { label: 'รับเงินมัดจำ', to: `${prefix}/finance/deposit`, cap: P1_CAP.POS_SALE },
        { label: 'จ่ายเงิน Sup', to: `${prefix}/finance/payments/advance`, cap: P1_CAP.PURCHASING },
        { label: 'ตัดยอด Sup', to: `${prefix}/finance/payments/receipt`, cap: P1_CAP.PURCHASING },
      ],
    },
  ];
};