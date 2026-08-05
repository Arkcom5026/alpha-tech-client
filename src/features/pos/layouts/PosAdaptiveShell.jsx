import { useEffect, useState } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { X } from 'lucide-react';

import HeaderPos from '@/features/pos/components/header/HeaderPos';
import SidebarLoader from '@/features/pos/components/sidebar/SidebarLoader';
import PosKeyboardRuntime from '@/features/pos/runtime/PosKeyboardRuntime';

const SIDEBAR_PREFERENCE_KEY = 'alpha-tech.pos.sidebar.expanded.v2';

const readDesktopPreference = () => {
  if (typeof window === 'undefined') return true;
  const savedValue = window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY);
  return savedValue === null ? true : savedValue === 'true';
};

const PosAdaptiveShell = () => {
  const { shopSlug } = useParams();
  const { pathname } = useLocation();
  const [desktopExpanded, setDesktopExpanded] = useState(readDesktopPreference);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [mobileOpen]);

  const toggleDesktopSidebar = () => {
    setDesktopExpanded((current) => {
      const nextValue = !current;
      window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, String(nextValue));
      return nextValue;
    });
  };

  return (
    <div className="flex min-h-[100dvh] w-full overflow-hidden bg-slate-50 font-sans text-slate-800">
      <PosKeyboardRuntime />

      <div
        className={[
          'hidden h-[100dvh] shrink-0 overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-200 lg:block',
          desktopExpanded ? 'w-64' : 'w-16',
        ].join(' ')}
      >
        <SidebarLoader collapsed={!desktopExpanded} onToggle={toggleDesktopSidebar} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="เมนูย่อย POS">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-label="ปิดเมนูย่อย POS"
          />

          <div className="absolute inset-y-0 left-0 w-[min(88vw,320px)] overflow-hidden bg-white shadow-2xl">
            <SidebarLoader collapsed={false} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="ปิดเมนูย่อย POS"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <HeaderPos shopSlug={shopSlug} onMobileModuleSelect={() => setMobileOpen(true)} />

        <main className="min-w-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-4 animate-fadeIn sm:px-4 md:px-6 md:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1680px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PosAdaptiveShell;
