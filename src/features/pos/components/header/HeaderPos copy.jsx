// ✅ HeaderPos.jsx — Responsive + Mobile Friendly
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { Sun, Moon } from 'lucide-react';
import useEmployeeStore from '@/store/employeeStore';
import useThemeStore from '@/store/themeStore';
import { Button } from '@/components/ui/button';

const HeaderPos = () => {
  const navigate = useNavigate();
  const branchName = useEmployeeStore((state) => state.branchName);
  const employee = useEmployeeStore((state) => state.employee);
  const logoutEmployee = useEmployeeStore((state) => state.logoutEmployee);
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logoutEmployee();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
  `px-7 py-2 rounded-md text-base font-medium transition-all duration-200 whitespace-nowrap border border-white/20 shadow-sm ${
    isActive ? 'bg-white text-blue-800' : 'text-white/80 hover:bg-blue-600'
  }`;

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-3 bg-blue-700 text-white shadow-md dark:bg-slate-900 dark:text-white">
      {/* ✅ Responsive Menu: Dropdown on small screens */}
      <div className="block md:hidden">
        <select
          onChange={(e) => navigate(e.target.value)}
          className="bg-blue-600 text-white rounded-md px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled hidden>เมนูทั้งหมด</option>
          <option value="/pos">หน้าหลัก</option>
          <option value="/pos/purchases">จัดซื้อ</option>
          <option value="/pos/sales">การขาย</option>
          <option value="/pos/services">บริการ</option>
          <option value="/pos/stock">สต๊อก</option>
          <option value="/pos/reports">รายงาน</option>
          <option value="/pos/finance">การเงิน</option>
        </select>
      </div>

      {/* ✅ Horizontal Menu for md+ screens */}
      <nav className="hidden md:flex flex-wrap gap-2 max-w-full overflow-x-auto scrollbar-thin">
        <NavLink to="/pos" className={(props) => navLinkClass({ ...props, to: '/pos' })}>หน้าหลัก</NavLink>
        <NavLink to="/pos/purchases" className={navLinkClass}>จัดซื้อ</NavLink>
        <NavLink to="/pos/sales" className={navLinkClass}>การขาย</NavLink>
        <NavLink to="/pos/services" className={navLinkClass}>บริการ</NavLink>
        <NavLink to="/pos/stock" className={navLinkClass}>สต๊อก</NavLink>
        <NavLink to="/pos/reports" className={navLinkClass}>รายงาน</NavLink>
        <NavLink to="/pos/finance" className={navLinkClass}>การเงิน</NavLink>
      </nav>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3 w-full md:w-auto">
        <Button
          variant="ghost"
          className="text-white/80 hover:text-white"
          onClick={toggleTheme}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {branchName && (
          <div className="text-sm font-medium bg-blue-600/60 px-3 py-1 rounded-full dark:bg-slate-700 max-w-[160px] truncate">
            สาขา: {branchName}
          </div>
        )}

        {employee?.name && (
          <div className="text-sm text-white/90 dark:text-white max-w-[160px] break-words">
            👤 {employee.name}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm shadow"
          >
            <FaSignOutAlt /> ออกจากระบบ
          </button>
          <button
            onClick={handleLogout}
            className="md:hidden flex items-center justify-center bg-red-600 hover:bg-red-700 p-2 rounded-lg text-white text-sm shadow"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  );

};

export default HeaderPos;
