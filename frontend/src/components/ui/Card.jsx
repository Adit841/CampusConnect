import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500';

export function Card({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag
      className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

/** A titled dashboard section with an optional badge and "view all" link. */
export function SectionCard({ title, icon: Icon, badge, viewAllTo, viewAllLabel = 'View all', className = '', children }) {
  return (
    <Card as="section" className={`flex flex-col ${className}`} aria-label={title}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && <Icon className="size-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />}
          <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          {badge}
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className={`inline-flex items-center gap-1 rounded text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 ${focusRing}`}
          >
            {viewAllLabel}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        )}
      </header>
      <div className="flex-1">{children}</div>
    </Card>
  );
}
