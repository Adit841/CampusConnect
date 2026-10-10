import { Suspense, useCallback, useState } from 'react';
import { Outlet } from 'react-router';
import { FlaskConical } from 'lucide-react';
import { Spinner } from '../components/ui/StateViews.jsx';
import AppSidebar from '../components/layout/AppSidebar.jsx';
import AppHeader from '../components/layout/AppHeader.jsx';
import MobileNavigation from '../components/layout/MobileNavigation.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/** Shared shell (sidebar + header + content) for every signed-in page, regardless of role. */
function DashboardLayout() {
  const { isDemo } = useAuth();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const closeNavigation = useCallback(() => setNavigationOpen(false), []);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-indigo-700 focus:shadow"
      >
        Skip to content
      </a>

      <AppSidebar />
      <MobileNavigation open={navigationOpen} onClose={closeNavigation} />

      <div className="flex min-h-dvh flex-col lg:pl-64">
        <AppHeader onOpenNavigation={() => setNavigationOpen(true)} navigationOpen={navigationOpen} />

        {isDemo && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 sm:px-6 lg:px-8 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            <p className="flex items-start gap-2">
              <FlaskConical className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>
                <strong className="font-semibold">Development demo mode.</strong> No one is signed in, so a fictional demo
                user is shown. Use the role selector to preview each dashboard. This mode is not available in production builds.
              </span>
            </p>
          </div>
        )}

        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Suspense fallback={<Spinner label="Loading page" />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
