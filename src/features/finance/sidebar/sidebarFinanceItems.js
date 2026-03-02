

// ✅ sidebarFinanceItems.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';



export const sidebarFinanceItems = [
    {
      label: 'การเงิน',
      items: [
        { label: 'ลูกหนี้/ยอดค้าง', to: '/pos/finance/ar', cap: P1_CAP.VIEW_REPORTS },
        { label: 'เครดิตลูกค้า', to: '/pos/finance/customer-credit', cap: P1_CAP.VIEW_REPORTS },
        // ⏳ (ยังไม่เปิดใช้ในเวอร์ชันนี้) — ป้องกันผู้ใช้คลิกแล้ว 404
        // { label: 'คืนเงินลูกค้า', to: '/pos/finance/refunds', cap: P1_CAP.POS_SALE },
        // { label: 'รับเงินมัดจำ', to: '/pos/finance/deposit', cap: P1_CAP.POS_SALE },
        // { label: 'จ่ายเงิน Sup', to: '/pos/finance/payments/advance', cap: P1_CAP.PURCHASING },
        // { label: 'ตัดยอด Sup', to: '/pos/finance/payments/receipt', cap: P1_CAP.PURCHASING },      
      ],
    },
  ];
  


