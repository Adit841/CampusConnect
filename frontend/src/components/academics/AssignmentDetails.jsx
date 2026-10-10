import { useState } from 'react';
import { Download, Pencil, RefreshCw, Send, Trash2, Users } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { DataSourceBadge } from '../ui/Badge.jsx';
import {
  deleteAssignment,
  describeError,
  downloadAssignmentAttachment,
  fileRules,
  formatFileSize,
  publishAssignment,
} from '../../services/academicsService.js';
import { formatDateTime } from '../../utils/format.js';
import AssignmentSubmission from './AssignmentSubmission.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { AssignmentStatusBadge, DeadlineIndicator, FormError } from './AcademicBadges.jsx';
import { dangerButton, primaryButton, secondaryButton } from './buttonStyles.js';

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  );
}

function StaffPanel({ assignment, readOnly, onEdit, onViewSubmissions, onChanged, onDeleted }) {
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const canManage = assignment.canManage && !readOnly;
  const isDraft = assignment.status === 'DRAFT';
  const hasSubmissions = (assignment.stats?.submitted ?? 0) > 0;

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      if (confirm === 'publish') {
        await publishAssignment(assignment.id);
        setConfirm(null);
        await onChanged();
      } else {
        await deleteAssignment(assignment.id);
        setConfirm(null);
        await onDeleted();
      }
    } catch (err) {
      setError(await describeError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {assignment.stats && !isDraft && (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {assignment.stats.submitted} of {assignment.stats.totalStudents} students submitted ·{' '}
          {assignment.stats.awaitingReview} awaiting review · {assignment.stats.graded} graded
          {assignment.stats.late > 0 && ` · ${assignment.stats.late} late`}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {!isDraft && (
          <button type="button" onClick={() => onViewSubmissions(assignment)} disabled={readOnly} className={primaryButton}>
            <Users className="size-4" aria-hidden="true" />
            {assignment.canManage ? 'Review submissions' : 'View submissions'}
          </button>
        )}
        {canManage && (
          <>
            <button type="button" onClick={() => onEdit(assignment)} className={secondaryButton}>
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </button>
            {isDraft && (
              <button type="button" onClick={() => setConfirm('publish')} className={primaryButton}>
                <Send className="size-4" aria-hidden="true" />
                Publish
              </button>
            )}
            {!hasSubmissions && (
              <button type="button" onClick={() => setConfirm('delete')} className={dangerButton}>
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </button>
            )}
          </>
        )}
      </div>
      {readOnly && (
        <p className="text-xs text-slate-500 dark:text-slate-400">Demo mode is read-only. Sign in with a real account to manage assignments.</p>
      )}
      {!readOnly && !assignment.canManage && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Read-only oversight: only the subject's teacher can edit, publish or grade this assignment.
        </p>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm === 'publish' ? 'Publish this assignment?' : 'Delete this assignment?'}
          description={
            confirm === 'publish'
              ? 'Students in this subject will see it immediately. Published assignments cannot be moved back to draft.'
              : 'This permanently removes the assignment and its attachment.'
          }
          confirmLabel={confirm === 'publish' ? 'Publish' : 'Delete'}
          destructive={confirm === 'delete'}
          busy={busy}
          error={error}
          onConfirm={run}
          onClose={() => {
            if (!busy) {
              setConfirm(null);
              setError(null);
            }
          }}
        />
      )}
    </div>
  );
}

function AssignmentDetails({ assignment, role, source, readOnly, onClose, onChanged, onEdit, onViewSubmissions, onDeleted }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const instructions = (assignment.instructions ?? '').split('\n').map((line) => line.trim()).filter(Boolean);

  const download = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadAssignmentAttachment(assignment);
    } catch (err) {
      setDownloadError(await describeError(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={assignment.title}
      description={
        <span className="flex flex-wrap items-center gap-2">
          {assignment.subjectName} · {assignment.subjectCode}
          <AssignmentStatusBadge assignment={assignment} />
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
            <span className="mt-1 block">
              <DeadlineIndicator assignment={assignment} />
            </span>
          </Detail>
          <Detail label="Maximum marks">{assignment.maxMarks}</Detail>
          {assignment.teacherName && <Detail label="Teacher">{assignment.teacherName}</Detail>}
          <Detail label="Late submissions">{assignment.allowLateSubmissions ? 'Accepted (flagged as late)' : 'Not accepted'}</Detail>
          {role === 'STUDENT' && (
            <Detail label="Submission format">
              {fileRules.allowedTypes.map((type) => `.${type}`).join(', ')} · up to {fileRules.maxSizeMb} MB
            </Detail>
          )}
          {assignment.publishedAt && (
            <Detail label="Published">
              <time dateTime={assignment.publishedAt}>{formatDateTime(assignment.publishedAt)}</time>
            </Detail>
          )}
        </dl>

        {assignment.description && (
          <section>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Description</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{assignment.description}</p>
          </section>
        )}

        {instructions.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Instructions</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
              {instructions.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {assignment.attachment && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Material</h3>
            <button type="button" onClick={download} disabled={downloading || readOnly} className={`${secondaryButton} text-xs`}>
              {downloading ? <RefreshCw className="size-4 animate-spin" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}
              {assignment.attachment.fileName}
              {assignment.attachment.sizeBytes != null && (
                <span className="text-slate-400">({formatFileSize(assignment.attachment.sizeBytes)})</span>
              )}
            </button>
            <FormError>{downloadError}</FormError>
          </section>
        )}

        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {role === 'STUDENT' ? 'Your submission' : 'Submissions & management'}
          </h3>
          {role === 'STUDENT' ? (
            <AssignmentSubmission assignment={assignment} readOnly={readOnly} onChanged={onChanged} />
          ) : (
            <StaffPanel
              assignment={assignment}
              readOnly={readOnly}
              onEdit={onEdit}
              onViewSubmissions={onViewSubmissions}
              onChanged={onChanged}
              onDeleted={onDeleted}
            />
          )}
        </section>
      </div>
    </Modal>
  );
}

export default AssignmentDetails;
