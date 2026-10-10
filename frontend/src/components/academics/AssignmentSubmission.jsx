import { useId, useState } from 'react';
import { CircleCheck, Clock, Download, FlaskConical, Lock, Paperclip, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import {
  acceptAttribute,
  describeError,
  downloadSubmissionFile,
  fileRules,
  formatFileSize,
  formatMarks,
  resubmitAssignment,
  submitAssignment,
  validateFile,
} from '../../services/academicsService.js';
import { formatDateTime } from '../../utils/format.js';
import { fileInputClass, labelClass, primaryButton, secondaryButton, textareaClass } from './buttonStyles.js';
import { FormError } from './AcademicBadges.jsx';

function SubmissionForm({ assignment, existing, onSaved, onCancel }) {
  const id = useId();
  const [text, setText] = useState(existing?.textResponse ?? '');
  const [file, setFile] = useState(null);
  const [removeFile, setRemoveFile] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const keepsFile = existing?.file && !file && !removeFile;
  const late = !existing && new Date(assignment.dueAt) < new Date();

  const onFileChange = (event) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setFileError(validateFile(selected));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!text.trim() && !file && !keepsFile) {
      setError('Add a written response or attach a file.');
      return;
    }
    if (fileError) return;
    setBusy(true);
    setError(null);
    try {
      if (existing) {
        await resubmitAssignment(existing.id, { textResponse: text, file, removeFile: removeFile && !file });
      } else {
        await submitAssignment(assignment.id, { textResponse: text, file });
      }
      await onSaved();
    } catch (err) {
      setError(await describeError(err));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      {late && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          The deadline has passed. This assignment accepts late work, so your submission will be marked as late.
        </p>
      )}
      <div>
        <label htmlFor={`${id}-text`} className={labelClass}>
          Written response <span className="font-normal text-slate-500">(optional if you attach a file)</span>
        </label>
        <textarea
          id={`${id}-text`}
          rows={5}
          maxLength={20000}
          value={text}
          onChange={(event) => setText(event.target.value)}
          className={textareaClass}
        />
      </div>

      <div>
        <label htmlFor={`${id}-file`} className={labelClass}>
          {existing?.file ? 'Replace file' : 'Attach a file'}
        </label>
        <input
          id={`${id}-file`}
          type="file"
          accept={acceptAttribute}
          onChange={onFileChange}
          aria-describedby={`${id}-hint`}
          aria-invalid={Boolean(fileError)}
          className={fileInputClass}
        />
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Up to {fileRules.maxSizeMb} MB · PDF, Office documents, text, ZIP or images
        </p>
        {file && !fileError && (
          <p className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <Paperclip className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{file.name}</span>
            <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
          </p>
        )}
        {existing?.file && !file && (
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={removeFile} onChange={(event) => setRemoveFile(event.target.checked)} />
            Remove current file ({existing.file.fileName})
          </label>
        )}
        <FormError>{fileError}</FormError>
      </div>

      <FormError>{error}</FormError>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className={primaryButton} disabled={busy || Boolean(fileError)}>
          {busy && <RefreshCw className="size-4 animate-spin" aria-hidden="true" />}
          {existing ? 'Save changes' : late ? 'Submit late' : 'Submit assignment'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={busy} className={secondaryButton}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function SubmissionSummary({ assignment, submission, onError }) {
  const graded = submission.status === 'RETURNED';
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);
    try {
      await downloadSubmissionFile(submission);
    } catch (err) {
      onError(await describeError(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex flex-wrap items-center gap-2">
        <CircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {graded ? 'Graded' : 'Submitted — awaiting review'}
        </span>
        {submission.late && <Badge tone="danger">Late</Badge>}
        {submission.attemptNumber > 1 && <Badge>Revision {submission.attemptNumber}</Badge>}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Clock className="size-3.5" aria-hidden="true" />
        Submitted <time dateTime={submission.submittedAt}>{formatDateTime(submission.submittedAt)}</time>
      </p>
      {submission.textResponse && (
        <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {submission.textResponse}
        </p>
      )}
      {submission.file && (
        <button type="button" onClick={download} disabled={downloading} className={`${secondaryButton} px-2.5 py-1.5 text-xs`}>
          {downloading ? <RefreshCw className="size-3.5 animate-spin" aria-hidden="true" /> : <Download className="size-3.5" aria-hidden="true" />}
          {submission.file.fileName}
          {submission.file.sizeBytes != null && <span className="text-slate-400">({formatFileSize(submission.file.sizeBytes)})</span>}
        </button>
      )}
      {graded && (
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-500/10">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            Marks: {formatMarks(submission.marksAwarded)} / {assignment.maxMarks}
          </p>
          {submission.feedback && (
            <p className="mt-1 whitespace-pre-wrap text-sm text-emerald-900 dark:text-emerald-100">{submission.feedback}</p>
          )}
        </div>
      )}
    </div>
  );
}

/** Student's submission area inside the assignment details dialog. `onChanged` reloads page data. */
function AssignmentSubmission({ assignment, readOnly, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const submission = assignment.mySubmission;
  const overdue = new Date(assignment.dueAt) < new Date();

  if (readOnly) {
    return (
      <div className="space-y-3">
        {submission && <SubmissionSummary assignment={assignment} submission={submission} onError={setError} />}
        <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <FlaskConical className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Demo mode shows sample data only. Sign in with a real account to submit work.
        </p>
      </div>
    );
  }

  const saved = async () => {
    setEditing(false);
    await onChanged();
  };

  if (submission) {
    return (
      <div className="space-y-3">
        {editing ? (
          <SubmissionForm assignment={assignment} existing={submission} onSaved={saved} onCancel={() => setEditing(false)} />
        ) : (
          <>
            <SubmissionSummary assignment={assignment} submission={submission} onError={setError} />
            {submission.canEdit ? (
              <button type="button" onClick={() => setEditing(true)} className={secondaryButton}>
                Edit submission
              </button>
            ) : (
              submission.status === 'SUBMITTED' && (
                <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Lock className="size-3.5" aria-hidden="true" />
                  Submissions can be changed only before the deadline and before grading.
                </p>
              )
            )}
          </>
        )}
        <FormError>{error}</FormError>
      </div>
    );
  }

  if (overdue && !assignment.allowLateSubmissions) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        The deadline has passed and this assignment does not accept late submissions.
      </p>
    );
  }

  return <SubmissionForm assignment={assignment} onSaved={saved} />;
}

export default AssignmentSubmission;
