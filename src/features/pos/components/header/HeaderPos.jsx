// HeaderPos.jsx

import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useThemeStore from '@/store/themeStore';

import { useAuthStore } from '@/features/auth/store/authStore';
import { P1_CAP } from '@/features/auth/rbac/rbacClient';
import { useBranchStore } from '@/features/branch/store/branchStore';

const HeaderPos = () => {
  const navigate = useNavigate();
  const employee = useAuthStore((state) => state.employee);
  const logoutAction = useAuthStore((state) => state.logoutAction);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  // RBAC (P1 Bestline) - FE menu guard (Minimal Disruption)
  const canSelector = useAuthStore((state) => state.canSelector);
  const can = (capKey) => (typeof canSelector === 'function' ? canSelector(capKey) : true);

  const canPurchasing = can(P1_CAP.PURCHASING) || can(P1_CAP.RECEIVE_STOCK);
  const canSales = can(P1_CAP.POS_SALE);
  const canStock = can(P1_CAP.RECEIVE_STOCK) || can(P1_CAP.STOCK_AUDIT) || can(P1_CAP.MANAGE_PRODUCTS);
  const canReports = can(P1_CAP.VIEW_REPORTS);
  const canFinance = can(P1_CAP.VIEW_REPORTS); // conservative baseline (ปรับละเอียดได้ภายหลัง)
  const canSettings = can(P1_CAP.MANAGE_EMPLOYEES) || can(P1_CAP.MANAGE_PRODUCTS); // conservative baseline
  const canEmployees = can(P1_CAP.MANAGE_EMPLOYEES);

  const branchName = useBranchStore((state) => state.currentBranch?.name);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const clearBranch = useBranchStore((state) => state.clearBranch);
  const loadAndSetBranchById = useBranchStore((state) => state.loadAndSetBranchById);

    const { isDark, toggleTheme } = useThemeStore();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    clearBranch();
    logoutAction();
    navigate('/');
  };

  useEffect(() => {
    if (token && role === 'employee' && employee?.branchId && selectedBranchId) {
      loadAndSetBranchById(selectedBranchId);
    }
  }, [token, role, employee?.branchId, selectedBranchId, loadAndSetBranchById]);

  const navLinkClass = ({ isActive }) =>
    `px-5 py-2 rounded-md text-base font-medium transition-all duration-200 whitespace-nowrap border border-white/20 shadow-sm ${
      isActive ? 'bg-white text-blue-800' : 'text-white/80 hover:bg-blue-600'
    }`;

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-3 bg-blue-700 text-white shadow-md dark:bg-slate-900 dark:text-white">
      {/* Responsive Dropdown Menu */}
      <div className="block md:hidden">
        <select
          onChange={(e) => navigate(e.target.value)}
          className="bg-blue-600 text-white rounded-md px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled hidden>เมนูทั้งหมด</option>
          <option value="/pos">หน้าหลัก</option>
          {canPurchasing && <option value="/pos/purchases">จัดซื้อ</option>}
          {canSales && <option value="/pos/sales">การขาย</option>}
          <option value="/pos/services">บริการ</option>
          {canStock && <option value="/pos/stock">สต๊อก</option>}
          {canReports && <option value="/pos/reports">รายงาน</option>}
          {canFinance && <option value="/pos/finance">การเงิน</option>}
          {canEmployees && <option value="/pos/employees">พนักงาน</option>}
        </select>
      </div>

      <nav className="hidden md:flex flex-wrap gap-2 max-w-full overflow-x-auto scrollbar-thin">
        <NavLink to="/pos" className={navLinkClass}>หน้าหลัก</NavLink>
        {canPurchasing && (
          <NavLink to="/pos/purchases" className={navLinkClass}>
            จัดซื้อ
          </NavLink>
        )}
        {canSales && (
          <NavLink to="/pos/sales" className={navLinkClass}>
            การขาย
          </NavLink>
        )}
        <NavLink to="/pos/services" className={navLinkClass}>บริการ</NavLink>
        {canStock && (
          <NavLink to="/pos/stock" className={navLinkClass}>
            สต๊อก
          </NavLink>
        )}
        {canReports && (
          <NavLink to="/pos/reports" className={navLinkClass}>
            รายงาน
          </NavLink>
        )}
        {canFinance && (
          <NavLink to="/pos/finance" className={navLinkClass}>
            การเงิน
          </NavLink>
        )}
        {canSettings && (
          <NavLink to="/pos/settings" className={navLinkClass}>
            ตั้งค่าระบบ
          </NavLink>
        )}
      </nav>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3 w-full md:w-auto relative">
        <Button
          variant="ghost"
          className="text-white/80 hover:text-white"
          onClick={toggleTheme}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {branchName && (
          <div className="text-sm font-medium bg-blue-600/60 px-3 py-1 rounded-full dark:bg-slate-700 max-w-[250px] truncate">
            สาขา: {branchName}
          </div>
        )}

        {employee?.name && (
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-1 bg-blue-600/80 hover:bg-blue-700 rounded-full text-sm"
              onClick={() => setShowMenu(!showMenu)}
            >
              <UserCircle className="w-5 h-5" />
              <span className="truncate max-w-[150px]">{employee.name}</span>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-md z-50">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  ดูโปรไฟล์
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderPos;




