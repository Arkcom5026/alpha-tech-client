// ✅ src/features/pos/config/menuConfig.js
import {
    FaShoppingCart,
    FaShoppingBasket,
    FaTools,
    FaMoneyBillWave,
    FaBoxes,
    FaChartBar,
  } from 'react-icons/fa';
  
  // ✅ เมนูหลัก Header POS
  export const posMenuItems = [
    {
      path: '/pos/purchases',
      label: 'จัดซื้อ',
      icon: FaShoppingCart,
      roles: ['admin', 'manager', 'employee'],
      positions: ['ฝ่ายจัดซื้อ', 'ผู้จัดการ', 'บัญชี'],
    },
    {
      path: '/pos/sales',
      label: 'การขาย',
      icon: FaShoppingBasket,
      roles: ['admin', 'employee'],
      positions: ['ฝ่ายขาย', 'ผู้จัดการ'],
    },
    {
      path: '/pos/services',
      label: 'บริการ',
      icon: FaTools,
      roles: ['admin', 'employee'],
      positions: ['ช่างเทคนิค', 'ผู้จัดการ'],
    },
    {
      path: '/pos/finance',
      label: 'การเงิน',
      icon: FaMoneyBillWave,
      roles: ['admin', 'manager'],
      positions: ['บัญชี'],
    },
    {
      path: '/pos/stock',
      label: 'สต๊อกสินค้า',
      icon: FaBoxes,
      roles: ['admin', 'employee'],
      positions: ['คลังสินค้า', 'ผู้จัดการ'],
    },
    {
      path: '/pos/reports',
      label: 'รายงาน',
      icon: FaChartBar,
      roles: ['admin', 'manager'],
      positions: ['ผู้จัดการ', 'บัญชี'],
    },
  ];
  
 