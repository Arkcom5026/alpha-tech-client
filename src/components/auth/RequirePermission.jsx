// ✅ src/components/auth/RequirePermission.jsx
import React from 'react';
import usePermission from '@/hooks/usePermission';

/**
 * Component สำหรับควบคุมการแสดงเนื้อหา/ปุ่ม ตาม role หรือ permission
 * @param {string|string[]} role - role เดียว หรือหลาย role
 * @param {string|string[]} permission - permission เดียว หรือหลายรายการ
 * @param {boolean} all - ถ้า true: ต้องมีทุก permission (default: false)
 */
const RequirePermission = ({ role, permission, all = false, children }) => {
  const {
    hasRole,
    hasPermission,
    hasAll,
    hasSome,
  } = usePermission();

  const checkRole = () => {
    if (!role) return true;
    if (Array.isArray(role)) return role.some(hasRole);
    return hasRole(role);
  };

  const checkPermission = () => {
    if (!permission) return true;
    if (Array.isArray(permission)) return all ? hasAll(permission) : hasSome(permission);
    return hasPermission(permission);
  };

  if (!checkRole() || !checkPermission()) return null;

  return <>{children}</>;
};

export default RequirePermission;
