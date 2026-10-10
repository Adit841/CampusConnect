import { ClipboardList, PencilLine, Plus, UserRound, Users } from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { secondaryButton } from './buttonStyles.js';

function audienceLabel(subject) {
  return [subject.department, subject.course, subject.year && `Year ${subject.year}`, subject.section && `Section ${subject.section}`]
    .filter(Boolean)
    .join(' · ');
}

/**
 * `onViewAssignments` filters the assignments tab to this subject. `onEdit` / `onCreateAssignment` are passed
 * only when the current user may perform them; the backend enforces the same rules.
 */
function SubjectCard({ subject, onViewAssignments, onEdit, onCreateAssignment }) {
  const count = subject.assignmentCount ?? 0;
  return (
    <Card as="article" className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{subject.code}</p>
          <h3 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-slate-100">{subject.name}</h3>
        </div>
        {subject.credits != null && <Badge>{subject.credits} credits</Badge>}
      </div>

      {subject.teacherName && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
          {subject.teacherName}
        </p>
      )}
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Users className="size-3.5 shrink-0" aria-hidden="true" />
        {audienceLabel(subject)}
      </p>
      <p className="mt-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
        {subject.description || <span className="italic text-slate-400">No description provided.</span>}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onViewAssignments(subject)}
          className={`${secondaryButton} px-2.5 py-1.5 text-xs`}
          aria-label={`View ${count} assignments for ${subject.name}`}
        >
          <ClipboardList className="size-3.5" aria-hidden="true" />
          {count} {count === 1 ? 'assignment' : 'assignments'}
        </button>
        {onCreateAssignment && (
          <button type="button" onClick={() => onCreateAssignment(subject)} className={`${secondaryButton} px-2.5 py-1.5 text-xs`}>
            <Plus className="size-3.5" aria-hidden="true" />
            New assignment
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(subject)}
            className={`${secondaryButton} ml-auto px-2.5 py-1.5 text-xs`}
            aria-label={`Edit ${subject.name}`}
          >
            <PencilLine className="size-3.5" aria-hidden="true" />
            Edit
          </button>
        )}
      </div>
    </Card>
  );
}

export default SubjectCard;
