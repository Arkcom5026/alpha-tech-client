// ✅ src/components/auth/IfPermission.jsx — ใช้งานง่าย แสดงผลตามสิทธิ์
import React from 'react';
import usePermission from '@/hooks/usePermission';

/**
 * ใช้ตรวจ permission อย่างง่าย เช่นซ่อน/แสดงปุ่ม
 * @param {string|string[]} permission
 * @param {boolean} all
 */
const IfPermission = ({ permission, all = false, children }) => {
  const { hasAll, hasSome } = usePermission();

  const pass = Array.isArray(permission)
    ? all ? hasAll(permission) : hasSome(permission)
    : hasSome([permission]);

  return pass ? <>{children}</> : null;
};

export default IfPermission;
