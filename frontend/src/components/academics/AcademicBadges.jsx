import { CalendarClock, CircleAlert } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { displayStatus, isDueSoon, statusMeta, submissionStatusMeta } from '../../services/academicsService.js';
import { formatDateTime, formatRelative } from '../../utils/format.js';

export function AssignmentStatusBadge({ assignment }) {
  const meta = statusMeta[displayStatus(assignment)] ?? statusMeta.OPEN;
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function SubmissionStatusBadge({ status }) {
  const meta = submissionStatusMeta[status] ?? submissionStatusMeta.NOT_SUBMITTED;
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

/** Due date with relative time. Highlights overdue (unsubmitted) and due-within-48h work. */
export function DeadlineIndicator({ assignment }) {
  const status = displayStatus(assignment);
  const overdue = status === 'OVERDUE';
  const soon = !overdue && ['PENDING', 'OPEN'].includes(status) && isDueSoon(assignment);
  const tone = overdue
    ? 'font-medium text-rose-600 dark:text-rose-400'
    : soon
      ? 'font-medium text-amber-700 dark:text-amber-300'
      : 'text-slate-500 dark:text-slate-400';
  return (
    <p className={`flex flex-wrap items-center gap-1.5 text-xs ${tone}`}>
      <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
      Due <time dateTime={assignment.dueAt}>{formatDateTime(assignment.dueAt)}</time>
      <span aria-hidden="true">·</span>
      {formatRelative(assignment.dueAt)}
      {soon && <Badge tone="warning">Due soon</Badge>}
    </p>
  );
}

export function FormError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="flex items-start gap-2 text-sm text-rose-600 dark:text-rose-400">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
