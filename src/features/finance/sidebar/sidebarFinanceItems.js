// ✅ sidebarFinanceItems.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';



export const sidebarFinanceItems = [
    {
      label: 'การเงิน',
      items: [
        { label: 'หน้าหลักการเงิน', to: '/pos/finance', cap: P1_CAP.VIEW_REPORTS },
        { label: 'คืนเงินลูกค้า', to: '/pos/finance/refunds', cap: P1_CAP.POS_SALE },
        { label: 'รับเงินมัดจำ', to: '/pos/finance/deposit', cap: P1_CAP.POS_SALE },
        { label: 'จ่ายเงิน Sup', to: '/pos/finance/payments/advance', cap: P1_CAP.PURCHASING },
        { label: 'ตัดยอด Sup', to: '/pos/finance/payments/receipt', cap: P1_CAP.PURCHASING },      
      ],
    },
  ];
  
