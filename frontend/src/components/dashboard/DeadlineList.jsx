import { FileText } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { daysUntil, formatDateTime, formatRelative } from '../../utils/format.js';

function urgencyTone(dueAt) {
  const days = daysUntil(dueAt);
  if (days <= 2) return 'danger';
  if (days <= 5) return 'warning';
  return 'neutral';
}

/** Upcoming assignment deadlines for a student. Items: { id, title, course, dueAt }. */
function DeadlineList({ items }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 px-5 py-3.5">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <FileText className="size-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {item.course} · Due <time dateTime={item.dueAt}>{formatDateTime(item.dueAt)}</time>
            </p>
          </div>
          <Badge tone={urgencyTone(item.dueAt)}>{formatRelative(item.dueAt)}</Badge>
        </li>
      ))}
    </ul>
  );
}

export default DeadlineList;
