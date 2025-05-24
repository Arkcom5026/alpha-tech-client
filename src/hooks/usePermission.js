// ✅ src/hooks/usePermission.js — ตรวจ role/permission แบบปลอดภัยจาก ESLint เตือนทุกกรณี
import { useMemo } from 'react';
import useEmployeeStore from '@/store/employeeStore';
import useCustomerStore from '@/features/customer/store/customerStore';

export default function usePermission() {
  const employee = useEmployeeStore((state) => state.employee);
  const customer = useCustomerStore((state) => state.customer);

  const activeUser = useMemo(() => employee || customer, [employee, customer]);

  return useMemo(() => {
    const role = activeUser?.role || null;
    const permissions = activeUser?.permissions || [];

    const hasRole = (targetRole) => role === targetRole;

    const hasPermission = (targetPermission) =>
      Array.isArray(permissions) && permissions.includes(targetPermission);

    const hasAll = (targetPermissions = []) =>
      targetPermissions.every((p) => permissions.includes(p));

    const hasSome = (targetPermissions = []) =>
      targetPermissions.some((p) => permissions.includes(p));

    return { role, permissions, hasRole, hasPermission, hasAll, hasSome };
  }, [activeUser]);
}
