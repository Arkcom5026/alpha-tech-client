// UnifiedMainNav.jsx (อัปเดตการแสดงผล Avatar ให้เหมือน LoginForm.jsx)

import React, { useState, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UserCircle, Package, LogOut, User } from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/online/cart/store/cartStore';
import { useBranchStore } from '@/features/branch/store/branchStore';


const UnifiedMainNav = () => {
  const customer = useAuthStore((state) => state.customer);
  
  const logout = useAuthStore((state) => state.logout);
  const clearAuthStorage = useAuthStore((state) => state.clearStorage);

  const clearCart = useCartStore((state) => state.clearCart);
  const clearBranchStorage = useBranchStore((state) => state.clearStorage);
    
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  
  const navClass = ({ isActive }) =>
    isActive
      ? 'bg-blue-200 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-blue-700 border border-white/40 border-[1px]'
      : 'px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-white border border-white/40 border-[1px] hover:bg-blue-100/60';

  const handleLogout = () => {
    logout();
    clearAuthStorage();
    clearCart();
    clearBranchStorage();

    localStorage.removeItem('auth-storage');
    localStorage.removeItem('cart-storage');
    localStorage.removeItem('branch-storage');

    navigate('/');
  };

  return (
    <nav className="bg-blue-500">
      <div className="mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Left Section: Logo + Nav */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/" className="text-lg sm:text-2xl font-bold text-white">
              LOGO
            </Link>
            <NavLink to="/" className={navClass}>Home</NavLink>
            <NavLink to="/shop" className={navClass}>Shop</NavLink>
            <NavLink to="/cart" className={navClass}>Cart</NavLink>
          </div>

          {/* Right Section: Auth / Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            {!customer && (
              <NavLink to="/login" className={navClass}>Login</NavLink>
            )}

            {customer && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 px-3 py-1 sm:py-2 text-white hover:bg-blue-600 rounded-full bg-blue-700"
                >
                  <UserCircle className="w-5 h-5" />
                  <span className="font-semibold text-xs sm:text-sm text-white">{customer?.name}</span>
                </button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white shadow-md rounded-md z-50 text-sm">
                    <div className="px-4 py-2 text-gray-700 border-b font-semibold">{customer?.name}</div>
                    <Link to="/customers/profile" className="flex w-full px-4 py-2 hover:bg-gray-100 items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" /> โปรไฟล์ของฉัน
                    </Link>
                    <Link to="/customers/orders" className="flex w-full px-4 py-2 hover:bg-gray-100 items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500" /> คำสั่งซื้อของฉัน
                    </Link>
                    <button type="button" onClick={handleLogout} className="flex w-full text-left px-4 py-2 hover:bg-gray-100 items-center gap-2">
                      <LogOut className="w-4 h-4 text-gray-500" /> ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UnifiedMainNav;


