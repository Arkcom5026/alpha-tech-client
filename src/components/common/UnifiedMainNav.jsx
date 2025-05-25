// UnifiedMainNav.jsx (Always Visible Nav)

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
      ? 'bg-blue-200 px-3 py-2 rounded-md text-sm font-medium'
      : 'px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100';

  return (
    <nav className="bg-blue-500">
      <div className="mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Left Section: Logo + Nav */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-white">
              LOGO
            </Link>
            <NavLink to="/" className={navClass}>Home</NavLink>
            <NavLink to="/shop" className={navClass}>Shop</NavLink>
            <NavLink to="/cart" className={navClass}>
              Cart
              {carts.length > 0 && (
                <span className="ml-1 text-xs bg-white text-blue-700 font-bold px-2 py-0.5 rounded-full">
                  {carts.length}
                </span>
              )}
            </NavLink>
          </div>

          {/* Right Section: Auth / Avatar */}
          <div className="flex items-center gap-4">
            {!customers && (
              <>
                <NavLink to="/register" className={navClass}>Register</NavLink>
                <NavLink to="/login" className={navClass}>Login</NavLink>
              </>
            )}

            {customers && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 px-3 py-2 text-white hover:bg-blue-600 rounded-md"
                >
                  <img
                    src="https://cdn.iconscout.com/icon/free/png-512/free-avatar-icon-download-in-svg-png-gif-file-formats--user-professor-avatars-flat-icons-pack-people-456317.png?f=webp&w=256"
                    className="w-8 h-8 rounded-full"
                    alt="avatar"
                  />
                  <ChevronDown />
                </button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md z-50">
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
