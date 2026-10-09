import { useCallback, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Bell, ChevronDown, LayoutDashboard, LogOut, Moon, Sun, UserRound } from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useDismiss } from '../../hooks/useDismiss.js';
import { Avatar } from '../ui/Avatar.jsx';
import { focusRing } from '../ui/Card.jsx';
import { roleLabels } from '../../utils/format.js';

const iconButton = `inline-flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 ${focusRing}`;
const panel =
  'absolute right-0 top-full z-40 mt-2 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900';

/** Open/close state + outside-click/Escape handling shared by the header popovers. */
function useDisclosure() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, close, open);
  return { open, setOpen, close, ref, panelId: useId() };
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={iconButton}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
    >
      {isDark ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
    </button>
  );
}

/** No notifications API exists yet, so this explains that honestly instead of showing fake alerts. */
export function NotificationsMenu() {
  const { open, setOpen, ref, panelId } = useDisclosure();
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={iconButton}
        aria-label="Notifications"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <Bell className="size-5" aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId} className={`${panel} w-72 p-4`}>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Live notifications are not connected yet. They will appear here once the Announcements &amp;
            Notifications module is integrated.
          </p>
        </div>
      )}
    </div>
  );
}

/** Development-only: lets the team preview each role's dashboard without a login page. */
export function DemoRoleSwitcher() {
  const { isDemo, demoRole, setDemoRole } = useAuth();
  const id = useId();
  if (!isDemo) return null;
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <label htmlFor={id} className="text-xs font-medium text-amber-700 dark:text-amber-300">
        Demo role
      </label>
      <select
        id={id}
        value={demoRole}
        onChange={(event) => setDemoRole(event.target.value)}
        className={`h-9 rounded-lg border border-amber-300 bg-amber-50 px-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200 ${focusRing}`}
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {roleLabels[role]}
          </option>
        ))}
      </select>
    </div>
  );
}

export function UserMenu() {
  const { user, isDemo, signOut, demoRole, setDemoRole } = useAuth();
  const { open, setOpen, close, ref, panelId } = useDisclosure();
  if (!user) return null;

  const linkClass = `flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 ${focusRing}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${focusRing}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Account menu for ${user.name}`}
      >
        <Avatar name={user.name} src={user.profileImage} />
        <span className="hidden text-left md:block">
          <span className="block max-w-40 truncate text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">{roleLabels[user.role]}</span>
        </span>
        <ChevronDown className="hidden size-4 text-slate-400 md:block" aria-hidden="true" />
      </button>

      {open && (
        <div id={panelId} className={`${panel} w-64 p-2`}>
          <div className="border-b border-slate-100 px-3 pb-3 pt-1 dark:border-slate-800">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>

          {isDemo && (
            <div className="border-b border-slate-100 px-3 py-3 sm:hidden dark:border-slate-800">
              <label htmlFor={`${panelId}-role`} className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Demo role
              </label>
              <select
                id={`${panelId}-role`}
                value={demoRole}
                onChange={(event) => setDemoRole(event.target.value)}
                className={`mt-1 h-9 w-full rounded-lg border border-amber-300 bg-amber-50 px-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200 ${focusRing}`}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
            </div>
          )}

          <ul className="space-y-0.5 pt-2">
            <li>
              <Link to="/dashboard" onClick={close} className={linkClass}>
                <LayoutDashboard className="size-4 text-slate-400" aria-hidden="true" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/profile" onClick={close} className={linkClass}>
                <UserRound className="size-4 text-slate-400" aria-hidden="true" />
                Profile
              </Link>
            </li>
            {!isDemo && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    signOut();
                  }}
                  className={`${linkClass} w-full`}
                >
                  <LogOut className="size-4 text-slate-400" aria-hidden="true" />
                  Sign out
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
