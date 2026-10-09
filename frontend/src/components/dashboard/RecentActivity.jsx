import { formatRelative } from '../../utils/format.js';

/** A simple timeline. Items: { id, text, at }. */
function RecentActivity({ items }) {
  return (
    <ol className="px-5 py-4">
      {items.map((item, index) => (
        <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
          {index < items.length - 1 && (
            <span className="absolute left-[5px] top-4 h-full w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
          )}
          <span className="relative mt-1.5 size-2.5 shrink-0 rounded-full bg-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-500/15" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm text-slate-700 dark:text-slate-200">{item.text}</p>
            <time dateTime={item.at} className="text-xs text-slate-500 dark:text-slate-400">
              {formatRelative(item.at)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default RecentActivity;
