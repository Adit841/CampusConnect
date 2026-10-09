import { CalendarClock } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { priorityMeta, statusMeta } from '../../services/academicsService.js';
import { formatDateTime, formatRelative } from '../../utils/format.js';
import { primaryButton, secondaryButton } from './buttonStyles.js';

function StatusBadge({ assignment }) {
  const meta = statusMeta[assignment.status];
  return (
    <Badge tone={meta.tone}>
      {meta.label}
      {assignment.demoSubmission && ' (demo)'}
    </Badge>
  );
}

function SubmissionProgress({ assignment }) {
  const percent = assignment.totalStudents ? Math.round((assignment.submittedCount / assignment.totalStudents) * 100) : 0;
  const toReview = assignment.submittedCount - assignment.reviewedCount;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <div
        className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${assignment.title} submissions`}
      >
        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs tabular-nums text-slate-600 dark:text-slate-400">
        {assignment.submittedCount}/{assignment.totalStudents} submitted
      </span>
      {toReview > 0 && <Badge tone="warning">{toReview} to review</Badge>}
    </div>
  );
}

/** Assignment rows; `onOpen(assignment)` opens the details dialog. */
function AssignmentList({ assignments, role, onOpen }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {assignments.map((assignment) => {
        const overdue = assignment.status === 'OVERDUE';
        const canSubmit = role === 'STUDENT' && assignment.status !== 'SUBMITTED';
        return (
          <li key={assignment.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{assignment.title}</h3>
                <StatusBadge assignment={assignment} />
                {assignment.priority && role === 'STUDENT' && assignment.status !== 'SUBMITTED' && (
                  <Badge tone={priorityMeta[assignment.priority].tone}>{priorityMeta[assignment.priority].label}</Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {assignment.subject?.name ?? 'Unknown subject'} · {assignment.subject?.code}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{assignment.summary}</p>
              <p className={`mt-2 flex items-center gap-1.5 text-xs ${overdue ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
                Due <time dateTime={assignment.dueAt}>{formatDateTime(assignment.dueAt)}</time>
                <span aria-hidden="true">·</span>
                {formatRelative(assignment.dueAt)}
              </p>
              {role === 'TEACHER' && (
                <div className="mt-2">
                  <SubmissionProgress assignment={assignment} />
                </div>
              )}
            </div>
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => onOpen(assignment)}
                className={canSubmit ? primaryButton : secondaryButton}
                aria-label={`${canSubmit ? 'Submit' : 'View details for'} ${assignment.title}`}
              >
                {canSubmit ? (overdue ? 'Submit late' : 'Submit') : 'View details'}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default AssignmentList;
