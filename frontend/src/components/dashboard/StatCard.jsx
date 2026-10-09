import { Card } from '../ui/Card.jsx';

const iconTones = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
};

export function StatGrid({ children }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

/** A single headline number. Pass `loading` to show a placeholder while data is being fetched. */
function StatCard({ label, value, hint, icon: Icon, tone = 'indigo', loading = false }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          {loading ? (
            <span className="mt-2 block h-8 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
          ) : (
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
              {value?.toLocaleString() ?? '—'}
            </p>
          )}
        </div>
        {Icon && (
          <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg ${iconTones[tone]}`}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
        )}
      </div>
      {hint && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </Card>
  );
}

export default StatCard;
