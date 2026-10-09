import { Avatar } from '../ui/Avatar.jsx';
import { formatRelative } from '../../utils/format.js';

/** Submissions waiting for the teacher. Items: { id, student, assignment, submittedAt }. */
function PendingReviewList({ items }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 px-5 py-3.5">
          <Avatar name={item.student} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.student}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.assignment}</p>
          </div>
          <time dateTime={item.submittedAt} className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
            {formatRelative(item.submittedAt)}
          </time>
        </li>
      ))}
    </ul>
  );
}

export default PendingReviewList;
