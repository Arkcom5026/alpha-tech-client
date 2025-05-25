// UnifiedMainNav.jsx (Responsive with smaller text on small screens)

import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import useCartStore from '@/features/online/store/cartStore';
import useCustomerStore from '@/features/customer/store/customerStore';

const UnifiedMainNav = () => {
  const carts = useCartStore((state) => state.carts);
  const customers = useCustomerStore((state) => state.customers);
  const logout = useCustomerStore((state) => state.logout);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navClass = ({ isActive }) =>
    isActive
      ? 'bg-blue-200 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-blue-700 border border-white/40 border-[1px]'
      : 'px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-white border border-white/40 border-[1px] hover:bg-blue-100/60';

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
            <NavLink to="/cart" className={navClass}>
              Cart
              {carts.length > 0 && (
                <span className="ml-1 text-[10px] sm:text-xs bg-white text-blue-700 font-bold px-1.5 py-0.5 rounded-full">
                  {carts.length}
                </span>
              )}
            </NavLink>
          </div>

          {/* Right Section: Auth / Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            {!customers && (
              <>
                                <NavLink to="/login" className={navClass}>Login</NavLink>
              </>
            )}

            {customers && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-2 text-white text-xs sm:text-sm hover:bg-blue-600 rounded-md"
                >
                  <img
                    src="https://cdn.iconscout.com/icon/free/png-512/free-avatar-icon-download-in-svg-png-gif-file-formats--user-professor-avatars-flat-icons-pack-people-456317.png?f=webp&w=256"
                    className="w-6 sm:w-8 h-6 sm:h-8 rounded-full"
                    alt="avatar"
                  />
                  <ChevronDown size={16} className="sm:hidden" />
                </button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white shadow-md rounded-md z-50 text-sm">
                    <Link to="/customers/history" className="block px-4 py-2 hover:bg-gray-100">History</Link>
                    <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
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
