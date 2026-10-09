import { Badge } from '../ui/Badge.jsx';
import { formatShortDate } from '../../utils/format.js';

/** Teacher's recent assignments. Items: { id, title, course, dueAt, submitted, total }. */
function AssignmentsTable({ items }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <tr className="border-b border-slate-100 dark:border-slate-800">
            <th scope="col" className="px-5 py-3 font-medium">Assignment</th>
            <th scope="col" className="px-5 py-3 font-medium">Due</th>
            <th scope="col" className="px-5 py-3 font-medium">Submissions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item) => {
            const percent = item.total ? Math.round((item.submitted / item.total) * 100) : 0;
            const closed = new Date(item.dueAt) < new Date();
            return (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.course}</p>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <time dateTime={item.dueAt} className="text-slate-700 dark:text-slate-300">{formatShortDate(item.dueAt)}</time>
                  {closed && <Badge className="ml-2">Closed</Badge>}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${item.title} submissions`}
                    >
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="whitespace-nowrap tabular-nums text-xs text-slate-600 dark:text-slate-400">
                      {item.submitted}/{item.total}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AssignmentsTable;
