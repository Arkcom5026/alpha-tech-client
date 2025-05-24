export const permissionsByPosition = {
    'ผู้จัดการ': ['dashboard', 'sales', 'purchases', 'stock', 'reports', 'employees'],
    'พนักงานขาย': ['dashboard', 'sales'],
    'พนักงานคลัง': ['dashboard', 'stock'],
    'ช่างเทคนิค': ['dashboard', 'services'],
    'บัญชี': ['dashboard', 'reports'],
  };
  
  // ✅ ใช้ใน frontend
  export const canAccess = (position, menu) => {
    const permissions = permissionsByPosition[position] || [];
    return permissions.includes(menu);
  };
  