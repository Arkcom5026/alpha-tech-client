// ✅ @filename: employeeAccess.js
// ✅ @folder: src/features/employee/

import useEmployeeStore from '@/store/employeeStore';

export const hasEmployeeAccess = () => {
  const role = useEmployeeStore.getState().role;
  const position = useEmployeeStore.getState().position?.name;
  return (
    role === 'employee' && ['ผู้ดูแลระบบ', 'ผู้จัดการสาขา'].includes(position)
  );
};