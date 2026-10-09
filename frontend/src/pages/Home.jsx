import { Link } from 'react-router';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { focusRing } from '../components/ui/Card.jsx';

function Home() {
  const { status } = useAuth();
  const isLoggedIn = status === 'authenticated' || status === 'demo';

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
        Welcome to <span className="text-indigo-600 dark:text-indigo-400">CampusConnect</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
        One place for students and faculty to stay connected with academics,
        announcements, clubs, and each other.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {isLoggedIn ? (
          <Link
            to="/dashboard"
            className={`inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 ${focusRing}`}
          >
            <LayoutDashboard className="size-5" aria-hidden="true" />
            Go to Dashboard
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <>
            <Link
              to="/register"
              className={`inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 ${focusRing}`}
            >
              Get Started
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/login"
              className={`inline-flex items-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${focusRing}`}
            >
              Sign In
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

export default Home;
