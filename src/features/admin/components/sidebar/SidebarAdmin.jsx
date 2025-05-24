import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react';
import { ChartNoAxesGantt } from 'lucide-react';
import { LogOut } from 'lucide-react';

const SidebarAdmin = () => {
    return (
        <div className='bg-blue-500 text-white w-64 h-screen flex flex-col'>          
            <div className='h-24 bg-blue-900 flex items-center justify-center text-2xl font-bold'>
                Admin Panel
            </div>

            <div className='flex-1 px-4 py-4 space-y-2'>
                <NavLink
                    to={'/admin'}
                    end
                    className={({ isActive }) =>
                        isActive
                            ? 'bg-blue-900 rounded-md px-4 py-2 text-white flex items-center'
                            : 'text-blue-300 rounded px-4 py-2 hover:bg-blue-700 hover:text-white flex items-center'
                    }
                >
                    <LayoutDashboard className='mr-2' />
                    Dashboard
                </NavLink>

                <NavLink
                    to={'Manage'}
                    className={({ isActive }) =>
                        isActive
                            ? 'bg-blue-900 rounded-md px-4 py-2 text-white flex items-center'
                            : 'text-blue-300 rounded px-4 py-2 hover:bg-blue-700 hover:text-white flex items-center'
                    }
                >
                    <ChartNoAxesGantt className='mr-2' />
                    Manage
                </NavLink>

                <NavLink
                    to={'ProductType'}
                    className={({ isActive }) =>
                        isActive
                            ? 'bg-blue-900 rounded-md px-4 py-2 text-white flex items-center'
                            : 'text-blue-300 rounded px-4 py-2 hover:bg-blue-700 hover:text-white flex items-center'
                    }
                >
                    <ChartNoAxesGantt className='mr-2' />
                    ProductType
                </NavLink>

                <NavLink
                    to={'bank'}
                    className={({ isActive }) =>
                        isActive
                            ? 'bg-blue-900 rounded-md px-4 py-2 text-white flex items-center'
                            : 'text-blue-300 rounded px-4 py-2 hover:bg-blue-700 hover:text-white flex items-center'
                    }
                >
                    <ChartNoAxesGantt className='mr-2' />
                    bank
                </NavLink>

                <NavLink
                    to={'branch'}
                    className={({ isActive }) =>
                        isActive
                            ? 'bg-blue-900 rounded-md px-4 py-2 text-white flex items-center'
                            : 'text-blue-300 rounded px-4 py-2 hover:bg-blue-700 hover:text-white flex items-center'
                    }
                >
                    <ChartNoAxesGantt className='mr-2' />
                    branch
                </NavLink>

                <NavLink
                    to={'Product'}
                    className={({ isActive }) =>
                        isActive
                            ? 'bg-blue-900 rounded-md px-4 py-2 text-white flex items-center'
                            : 'text-blue-300 rounded px-4 py-2 hover:bg-blue-700 hover:text-white flex items-center'
                    }
                >
                    <ChartNoAxesGantt className='mr-2' />
                    Product
                </NavLink>

                <NavLink
                    to={'orders'}
                    className={({ isActive }) =>
                        isActive
                            ? 'bg-blue-900 rounded-md px-4 py-2 text-white flex items-center'
                            : 'text-blue-300 rounded px-4 py-2 hover:bg-blue-700 hover:text-white flex items-center'
                    }
                >
                    <ChartNoAxesGantt className='mr-2' />
                    Orders
                </NavLink>

            </div>

            <div>
            <NavLink
                    to={'Logout'}
                    className={({ isActive }) =>
                        isActive
                            ? 'bg-gray-900 rounded-md px-4 py-2 text-white flex items-center'
                            : 'text-gray-300 rounded px-4 py-2 hover:bg-blue-700 hover:text-white flex items-center'
                    }
                >

                    <LogOut className='mr-2'/>
                    Logout
                </NavLink>
            </div>
        </div>
    )
}

export default SidebarAdmin