import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/uiHelpers';

const Sidebar = ({ items = [] }) => {
  return (
    <div className='bg-blue-500 dark:bg-zinc-900 w-52 text-gray-100 dark:text-gray-200 flex flex-col h-screen'>
      <div className='h-16 bg-blue-900 dark:bg-zinc-800 flex items-center justify-center text-2xl font-bold'>
        POS System
      </div>
      <div className='h-72 px-5 py-4 w-48 '>
        <nav className="space-y-1 pb-4">
          {items.map((item, index) => {
            const label = item.label || item.name;
            const linkTo = item.path || item.to;
            const isSubItem = item?.level === 'sub';

            return (
              <NavLink
                key={index}
                to={linkTo}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'border border-white/20 shadow-sm',
                    'block rounded-md transition-colors duration-150 max-w-full',
                    isSubItem
                      ? 'ml-5 pl-4 pr-2 py-1.5 text-sm text-blue-100 dark:text-blue-200'
                      : 'pl-6 pr-2 py-2 text-sm font-medium text-blue-50 dark:text-blue-100',
                    isActive
                      ? 'bg-white dark:bg-zinc-100 text-blue-900 font-semibold text-sm shadow-sm'
                      : 'hover:bg-blue-600 dark:hover:bg-blue-500'
                  )
                }
              >
                {label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
