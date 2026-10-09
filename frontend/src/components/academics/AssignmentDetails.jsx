import { CircleCheck, Info } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { Badge, DataSourceBadge } from '../ui/Badge.jsx';
import { priorityMeta, statusMeta } from '../../services/academicsService.js';
import { formatDateTime, formatRelative } from '../../utils/format.js';
import AssignmentSubmission from './AssignmentSubmission.jsx';
import { secondaryButton } from './buttonStyles.js';

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  );
}

function SubmissionArea({ assignment, role, onDemoSubmit }) {
  if (role === 'TEACHER') {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Reviewing submissions, editing and grading need the Academics API, which isn't available yet.
      </p>
    );
  }
  if (assignment.demoSubmission) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
        <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Marked as submitted in this demo with <strong className="font-medium">{assignment.demoSubmission.fileName}</strong>.
          Nothing was uploaded, and this resets when you reload.
        </span>
      </p>
    );
  }
  if (assignment.submittedAt) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
        <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Submitted <time dateTime={assignment.submittedAt}>{formatDateTime(assignment.submittedAt)}</time> (demo record).
      </p>
    );
  }
  return <AssignmentSubmission assignment={assignment} onDemoSubmit={onDemoSubmit} />;
}

function AssignmentDetails({ assignment, role, source, onClose, onDemoSubmit }) {
  const status = statusMeta[assignment.status];
  const rules = assignment.submission;

  return (
    <Modal
      open
      onClose={onClose}
      title={assignment.title}
      description={
        <span className="flex flex-wrap items-center gap-2">
          {assignment.subject?.name} · {assignment.subject?.code}
          <Badge tone={status.tone}>{status.label}</Badge>
          <DataSourceBadge source={source} />
        </span>
      }
      footer={
        <button type="button" onClick={onClose} className={secondaryButton}>
          Close
        </button>
      }
    >
      <div className="space-y-5">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Detail label="Deadline">
            <time dateTime={assignment.dueAt}>{formatDateTime(assignment.dueAt)}</time>
            <span className={`block text-xs ${assignment.status === 'OVERDUE' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {formatRelative(assignment.dueAt)}
            </span>
          </Detail>
          {assignment.priority && <Detail label="Priority">{priorityMeta[assignment.priority].label}</Detail>}
          <Detail label="Faculty">{assignment.subject?.faculty}</Detail>
          <Detail label="Submission format">
            {rules.allowedTypes.map((type) => `.${type}`).join(', ')} · up to {rules.maxSizeMb} MB
          </Detail>
        </dl>

        <section>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Summary</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{assignment.summary}</p>
        </section>

        {assignment.instructions?.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Instructions</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
              {assignment.instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {role === 'TEACHER' ? 'Management' : 'Your submission'}
          </h3>
          <SubmissionArea assignment={assignment} role={role} onDemoSubmit={onDemoSubmit} />
        </section>
      </div>
    </Modal>
  );
}

export default AssignmentDetails;
