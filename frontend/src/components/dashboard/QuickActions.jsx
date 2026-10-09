import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { quickActions } from '../../config/navigation.js';
import { focusRing } from '../ui/Card.jsx';

function QuickActions({ role }) {
  const actions = quickActions[role] ?? [];
  if (actions.length === 0) return null;

  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Quick actions
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ to, label, description, icon: Icon }) => (
          <li key={label}>
            <Link
              to={to}
              className={`group flex h-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50 ${focusRing}`}
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{description}</span>
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-slate-600"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default QuickActions;
