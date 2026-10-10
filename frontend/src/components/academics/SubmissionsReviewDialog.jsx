import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Download, RefreshCw, Users } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { Badge } from '../ui/Badge.jsx';
import { EmptyState, ErrorState, SkeletonList } from '../ui/StateViews.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import {
  describeError,
  downloadSubmissionFile,
  fetchAssignmentSubmissions,
  formatFileSize,
  formatMarks,
  gradeSubmission,
} from '../../services/academicsService.js';
import { formatDateTime } from '../../utils/format.js';
import { fieldClass, labelClass, primaryButton, secondaryButton, textareaClass } from './buttonStyles.js';
import { FormError, SubmissionStatusBadge } from './AcademicBadges.jsx';

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'PENDING', label: 'Not submitted' },
  { id: 'SUBMITTED', label: 'Awaiting review' },
  { id: 'GRADED', label: 'Graded' },
  { id: 'LATE', label: 'Late' },
];

function matches(entry, filter) {
  switch (filter) {
    case 'PENDING': return !entry.submission;
    case 'SUBMITTED': return entry.status === 'SUBMITTED';
    case 'GRADED': return entry.status === 'GRADED' || entry.status === 'RETURNED';
    case 'LATE': return Boolean(entry.submission?.late);
    default: return true;
  }
}

function GradeForm({ submission, maxMarks, onGraded }) {
  const id = useId();
  const [marks, setMarks] = useState(submission.marksAwarded != null ? String(submission.marksAwarded) : '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const returned = submission.status === 'RETURNED';

  const save = async (returnToStudent) => {
    if (busy) return;
    const value = Number(marks);
    if (marks.trim() === '' || Number.isNaN(value)) return setError('Enter the marks awarded.');
    if (value < 0) return setError('Marks cannot be negative.');
    if (value > maxMarks) return setError(`Marks cannot exceed ${maxMarks}.`);
    if (Math.round(value * 100) !== value * 100) return setError('Use at most 2 decimal places.');
    setBusy(returnToStudent ? 'return' : 'save');
    setError(null);
    try {
      await gradeSubmission(submission.id, { marks: value, feedback: feedback.trim() || null, returnToStudent });
      await onGraded();
    } catch (err) {
      setError(await describeError(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save(true);
      }}
      className="space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[10rem_1fr]">
        <div>
          <label htmlFor={`${id}-marks`} className={labelClass}>Marks (of {maxMarks})</label>
          <input id={`${id}-marks`} type="number" min={0} max={maxMarks} step="0.01" value={marks}
            onChange={(event) => setMarks(event.target.value)} className={fieldClass} />
        </div>
        <div>
          <label htmlFor={`${id}-feedback`} className={labelClass}>Feedback</label>
          <textarea id={`${id}-feedback`} rows={3} maxLength={5000} value={feedback}
            onChange={(event) => setFeedback(event.target.value)} className={textareaClass} />
        </div>
      </div>
      <FormError>{error}</FormError>
      <div className="flex flex-wrap gap-2">
        {!returned && (
          <button type="button" onClick={() => save(false)} disabled={Boolean(busy)} className={secondaryButton}>
            {busy === 'save' && <RefreshCw className="size-4 animate-spin" aria-hidden="true" />}
            Save grade
          </button>
        )}
        <button type="submit" disabled={Boolean(busy)} className={primaryButton}>
          {busy === 'return' && <RefreshCw className="size-4 animate-spin" aria-hidden="true" />}
          {returned ? 'Update returned grade' : 'Save & return to student'}
        </button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {returned
          ? 'This work has been returned; the student sees updates immediately.'
          : 'Saved grades stay hidden from the student until you return the work.'}
      </p>
    </form>
  );
}

function RosterRow({ entry, assignment, canGrade, expanded, onToggle, onGraded }) {
  const submission = entry.submission;
  const [downloadError, setDownloadError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadSubmissionFile(submission);
    } catch (err) {
      setDownloadError(await describeError(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <li className="px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{entry.studentName}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {[entry.enrollmentNo, entry.studentEmail].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SubmissionStatusBadge status={entry.status} />
          {submission?.late && <Badge tone="danger">Late</Badge>}
          {submission?.marksAwarded != null && (
            <Badge tone="accent">{formatMarks(submission.marksAwarded)}/{assignment.maxMarks}</Badge>
          )}
          {submission && (
            <button type="button" onClick={onToggle} aria-expanded={expanded} className={`${secondaryButton} px-2.5 py-1 text-xs`}>
              {expanded ? <ChevronUp className="size-3.5" aria-hidden="true" /> : <ChevronDown className="size-3.5" aria-hidden="true" />}
              {canGrade ? (submission.status === 'SUBMITTED' ? 'Review' : 'View / regrade') : 'View'}
            </button>
          )}
        </div>
      </div>

      {expanded && submission && (
        <div className="mt-3 space-y-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submitted <time dateTime={submission.submittedAt}>{formatDateTime(submission.submittedAt)}</time>
            {submission.attemptNumber > 1 && ` · revision ${submission.attemptNumber}`}
            {submission.gradedAt && ` · graded ${formatDateTime(submission.gradedAt)}`}
          </p>
          {submission.textResponse ? (
            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{submission.textResponse}</p>
          ) : (
            <p className="text-sm italic text-slate-500">No written response.</p>
          )}
          {submission.file && (
            <button type="button" onClick={download} disabled={downloading} className={`${secondaryButton} px-2.5 py-1.5 text-xs`}>
              {downloading ? <RefreshCw className="size-3.5 animate-spin" aria-hidden="true" /> : <Download className="size-3.5" aria-hidden="true" />}
              {submission.file.fileName} ({formatFileSize(submission.file.sizeBytes)})
            </button>
          )}
          <FormError>{downloadError}</FormError>
          {!canGrade && submission.feedback && (
            <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-medium">Feedback:</span> {submission.feedback}</p>
          )}
          {canGrade && <GradeForm key={submission.gradedAt ?? 'new'} submission={submission} maxMarks={assignment.maxMarks} onGraded={onGraded} />}
        </div>
      )}
    </li>
  );
}

/** Roster for one assignment. Teachers who own the subject can grade; administrators get a read-only view. */
function SubmissionsReviewDialog({ assignment, onClose, onChanged }) {
  const loader = useCallback(() => fetchAssignmentSubmissions(assignment.id), [assignment.id]);
  const { data, status, error, reload } = useAsyncData(loader);
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const live = data?.assignment ?? assignment;
  const canGrade = Boolean(live.canManage);
  const entries = useMemo(() => data?.entries ?? [], [data]);
  const visible = entries.filter((e) => matches(e, filter));
  const stats = live.stats;

  useEffect(() => {
    if (!error) return undefined;
    let active = true;
    describeError(error).then((message) => active && setErrorMessage(message));
    return () => {
      active = false;
    };
  }, [error]);

  const graded = async () => {
    reload();
    await onChanged();
  };

  return (
    <Modal
      open
      size="xl"
      onClose={onClose}
      title={`Submissions · ${assignment.title}`}
      description={`${assignment.subjectName} · ${assignment.maxMarks} marks${canGrade ? '' : ' · read-only'}`}
      footer={<button type="button" onClick={onClose} className={secondaryButton}>Close</button>}
    >
      {status === 'error' ? (
        <ErrorState title="Couldn't load submissions" message={errorMessage} onRetry={reload} />
      ) : (
        <div className="space-y-4">
          {stats && (
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ['Students', stats.totalStudents],
                ['Submitted', stats.submitted],
                ['Not submitted', stats.pending],
                ['Awaiting review', stats.awaitingReview],
                ['Graded', stats.graded],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
                  <dd className="text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div role="group" aria-label="Filter submissions" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`${filter === f.id ? primaryButton : secondaryButton} px-2.5 py-1 text-xs`}
              >
                {f.label}
                <span className="tabular-nums opacity-80">{entries.filter((e) => matches(e, f.id)).length}</span>
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700">
            {status === 'loading' && !data ? (
              <SkeletonList rows={4} />
            ) : entries.length === 0 ? (
              <EmptyState icon={Users} title="No students yet" description="No student profiles match this subject's department, course, year and section." />
            ) : visible.length === 0 ? (
              <EmptyState title="Nothing in this view" description="Try another filter." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {visible.map((entry) => (
                  <RosterRow
                    key={entry.studentId}
                    entry={entry}
                    assignment={live}
                    canGrade={canGrade}
                    expanded={expandedId === entry.studentId}
                    onToggle={() => setExpandedId((idValue) => (idValue === entry.studentId ? null : entry.studentId))}
                    onGraded={graded}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default SubmissionsReviewDialog;
