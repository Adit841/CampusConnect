import { useLocation } from 'react-router';
import { Menu } from 'lucide-react';
import { findNavItem } from '../../config/navigation.js';
import { focusRing } from '../ui/Card.jsx';
import { DemoRoleSwitcher, NotificationsMenu, ThemeToggle, UserMenu } from './HeaderMenus.jsx';

function AppHeader({ onOpenNavigation, navigationOpen }) {
  const { pathname } = useLocation();
  const title = findNavItem(pathname)?.label ?? 'CampusConnect';

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900/90">
      <button
        type="button"
        onClick={onOpenNavigation}
        aria-label="Open navigation menu"
        aria-expanded={navigationOpen}
        aria-controls="mobile-navigation"
        className={`-ml-1 inline-flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800 ${focusRing}`}
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <p className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900 dark:text-slate-100">{title}</p>

      <div className="flex items-center gap-1 sm:gap-2">
        <DemoRoleSwitcher />
        <ThemeToggle />
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}

export default AppHeader;
