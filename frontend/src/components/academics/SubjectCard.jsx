import { FileText, Link2, Presentation, UserRound } from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';

const materialIcons = { PDF: FileText, Slides: Presentation, Link: Link2 };

/** Materials are listed by name only; files are not hosted anywhere yet, so they are not links. */
function SubjectCard({ subject, assignmentCount }) {
  return (
    <Card as="article" className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{subject.code}</p>
          <h3 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-slate-100">{subject.name}</h3>
        </div>
        <Badge>{subject.credits} credits</Badge>
      </div>

      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
        <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
        {subject.faculty}
      </p>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{subject.description}</p>

      <div className="mt-4 flex-1 border-t border-slate-100 pt-4 dark:border-slate-800">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Study materials</h4>
        {subject.materials.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No materials shared yet.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {subject.materials.map((material) => {
              const Icon = materialIcons[material.type] ?? FileText;
              return (
                <li key={material.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Icon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{material.title}</span>
                  <span className="text-xs text-slate-400">{material.type}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        {assignmentCount} {assignmentCount === 1 ? 'assignment' : 'assignments'}
      </p>
    </Card>
  );
}

export default SubjectCard;
