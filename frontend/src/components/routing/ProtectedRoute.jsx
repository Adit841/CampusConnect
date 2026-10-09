import { Link, Navigate, Outlet, useLocation } from 'react-router';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, focusRing } from '../ui/Card.jsx';
import { ErrorState, Spinner } from '../ui/StateViews.jsx';

function FullPageMessage({ children }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="w-full max-w-md">{children}</Card>
    </div>
  );
}

/**
 * Renders child routes only when there is a signed-in user (or development demo user).
 * Redirects unauthenticated users to /login while saving the attempted path in state.
 */
export function ProtectedRoute() {
  const { status, profileError, refreshProfile, signOut } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner label="Loading your account" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <FullPageMessage>
        <ErrorState title="We couldn't load your profile" message={profileError} onRetry={refreshProfile} />
        <div className="border-t border-slate-100 p-4 text-center dark:border-slate-800">
          <button
            type="button"
            onClick={signOut}
            className={`rounded text-sm font-medium text-indigo-600 dark:text-indigo-400 ${focusRing}`}
          >
            Sign out
          </button>
        </div>
      </FullPageMessage>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * For public auth pages (/login, /register).
 * Redirects already authenticated users to /dashboard.
 */
export function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner label="Checking session" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

/** Hides a page from roles it isn't meant for. The backend must still authorize the underlying API calls. */
export function RequireRole({ roles }) {
  const { user } = useAuth();
  if (roles.includes(user?.role)) return <Outlet />;

  return (
    <Card>
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <span className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <ShieldCheck className="size-5 text-slate-500" aria-hidden="true" />
        </span>
        <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">This page isn't available for your role</h1>
        <Link
  to="/"
  className={`mt-4 rounded text-sm font-medium text-indigo-600 dark:text-indigo-400 ${focusRing}`}
>
  Back to home
</Link>
      </div>
    </Card>
  );
}
