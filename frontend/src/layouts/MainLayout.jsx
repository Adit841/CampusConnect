import { Link, Outlet } from 'react-router';
import { GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ThemeToggle } from '../components/layout/HeaderMenus.jsx';
import { focusRing } from '../components/ui/Card.jsx';

function MainLayout() {
  const { status, user, signOut } = useAuth();
  const isLoggedIn = status === 'authenticated' || status === 'demo';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-20 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className={`flex items-center gap-2.5 rounded-lg ${focusRing}`}>
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">CampusConnect</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3.5 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 ${focusRing}`}
                >
                  <LayoutDashboard className="size-4" aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${focusRing}`}
                >
                  <LogOut className="size-4 text-slate-400" aria-hidden="true" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white ${focusRing}`}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className={`inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 ${focusRing}`}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-slate-500 sm:flex-row sm:px-6 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
          <p className="text-xs">Student Academic &amp; Communication Portal</p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
