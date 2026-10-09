import { FlaskConical } from 'lucide-react';

const tones = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  accent: 'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
};

export function Badge({ tone = 'neutral', className = '', children, ...props }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

/** Marks content that comes from demo data rather than a live API. Renders nothing for live data. */
export function DataSourceBadge({ source }) {
  if (source !== 'mock') return null;
  return (
    <Badge tone="warning" title="Fictional sample data — the API for this section is not available yet">
      <FlaskConical className="size-3" aria-hidden="true" />
      Demo data
    </Badge>
  );
}
