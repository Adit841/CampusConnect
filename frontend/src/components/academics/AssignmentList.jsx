import { Paperclip } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { displayStatus, formatMarks } from '../../services/academicsService.js';
import { primaryButton, secondaryButton } from './buttonStyles.js';
import { AssignmentStatusBadge, DeadlineIndicator } from './AcademicBadges.jsx';

function SubmissionProgress({ assignment }) {
  const { totalStudents = 0, submitted = 0, awaitingReview = 0, late = 0 } = assignment.stats ?? {};
  const percent = totalStudents ? Math.min(100, Math.round((submitted / totalStudents) * 100)) : 0;
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
        {submitted}/{totalStudents} submitted
      </span>
      {awaitingReview > 0 && <Badge tone="warning">{awaitingReview} to review</Badge>}
      {late > 0 && <Badge tone="danger">{late} late</Badge>}
    </div>
  );
}

function actionLabel(role, status) {
  if (role === 'TEACHER') return { label: 'Manage', primary: false };
  if (role === 'ADMIN') return { label: 'View', primary: false };
  if (status === 'PENDING') return { label: 'Submit', primary: true };
  return { label: 'View details', primary: false };
}

/** Assignment rows; `onOpen(assignment)` opens the details dialog. */
function AssignmentList({ assignments, role, onOpen }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {assignments.map((assignment) => {
        const status = displayStatus(assignment);
        const action = actionLabel(role, status);
        const marks = assignment.mySubmission?.marksAwarded;
        return (
          <li key={assignment.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{assignment.title}</h3>
                <AssignmentStatusBadge assignment={assignment} />
                {status === 'GRADED' && marks != null && (
                  <Badge tone="success">
                    {formatMarks(marks)}/{assignment.maxMarks}
                  </Badge>
                )}
                {assignment.attachment && <Paperclip className="size-3.5 text-slate-400" aria-label="Has attachment" />}
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {assignment.subjectName} · {assignment.subjectCode} · {assignment.maxMarks} marks
              </p>
              {assignment.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{assignment.description}</p>
              )}
              <div className="mt-2">
                <DeadlineIndicator assignment={assignment} />
              </div>
              {role !== 'STUDENT' && assignment.status === 'PUBLISHED' && (
                <div className="mt-2">
                  <SubmissionProgress assignment={assignment} />
                </div>
              )}
            </div>
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => onOpen(assignment)}
                className={action.primary ? primaryButton : secondaryButton}
                aria-label={`${action.label}: ${assignment.title}`}
              >
                {action.label}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default AssignmentList;
