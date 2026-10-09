import { Link, NavLink } from 'react-router';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getNavSectionsForRole } from '../../config/navigation.js';
import { focusRing } from '../ui/Card.jsx';
import { roleLabels } from '../../utils/format.js';

export function Brand() {
  return (
    <Link to="/dashboard" className={`flex items-center gap-2.5 rounded-lg ${focusRing}`}>
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">CampusConnect</span>
    </Link>
  );
}

/** Brand + role-filtered navigation. Shared by the desktop sidebar and the mobile drawer. */
export function SidebarContent({ onNavigate }) {
  const { user } = useAuth();
  const sections = getNavSectionsForRole(user?.role);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Brand />
      </div>

      <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${focusRing} ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`size-4.5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`}
                          aria-hidden="true"
                        />
                        {label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {user && (
        <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Signed in as <span className="font-medium text-slate-700 dark:text-slate-200">{roleLabels[user.role]}</span>
        </div>
      )}
    </div>
  );
}

function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
      <SidebarContent />
    </aside>
  );
}

export default AppSidebar;
