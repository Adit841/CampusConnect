import { CircleAlert, Inbox, RefreshCw } from 'lucide-react';
import { focusRing } from './Card.jsx';

export function Spinner({ label = 'Loading' }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
      {label}…
    </span>
  );
}

/** Placeholder rows shown while list data is loading. */
export function SkeletonList({ rows = 3 }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex animate-pulse items-center gap-3 px-5 py-4">
          <span className="size-9 rounded-lg bg-slate-100 dark:bg-slate-800" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
            <span className="block h-2.5 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Icon className="size-5 text-slate-400" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
  );
}

export function ErrorState({ title = 'Could not load this section', message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
        <CircleAlert className="size-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{title}</p>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${focusRing}`}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
