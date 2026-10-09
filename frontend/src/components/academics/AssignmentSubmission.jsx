import { useId, useState } from 'react';
import { CircleAlert, FlaskConical, Paperclip } from 'lucide-react';
import { formatFileSize, validateSubmissionFile } from '../../services/academicsService.js';
import { focusRing } from '../ui/Card.jsx';
import { primaryButton } from './buttonStyles.js';

/**
 * Demo-only submission form. It validates the chosen file locally and reports it to `onDemoSubmit`;
 * nothing is uploaded because no submission API exists yet.
 */
function AssignmentSubmission({ assignment, onDemoSubmit }) {
  const id = useId();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const rules = assignment.submission;
  const accept = rules.allowedTypes.map((type) => `.${type}`).join(',');

  const onFileChange = (event) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setError(selected ? validateSubmissionFile(selected, rules) : null);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const problem = validateSubmissionFile(file, rules);
    setError(problem);
    if (!problem) onDemoSubmit(assignment.id, file.name);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        <FlaskConical className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <p>
          <strong className="font-semibold">Demo only.</strong> The submission API isn't available yet, so your file
          will <strong className="font-semibold">not</strong> be uploaded. The status change is kept only until you reload
          the page.
        </p>
      </div>

      <div>
        <label htmlFor={`${id}-file`} className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-200">
          Submission file
        </label>
        <input
          id={`${id}-file`}
          type="file"
          accept={accept}
          onChange={onFileChange}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
          aria-invalid={Boolean(error)}
          className={`block w-full rounded-lg border border-slate-200 text-sm text-slate-600 file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200 ${focusRing}`}
        />
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Accepted: {rules.allowedTypes.map((type) => `.${type}`).join(', ')} · Max {rules.maxSizeMb} MB
        </p>
      </div>

      {file && !error && (
        <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Paperclip className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{file.name}</span>
          <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
        </p>
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400">
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <button type="submit" className={primaryButton} disabled={!file || Boolean(error)}>
        Mark as submitted (demo)
      </button>
    </form>
  );
}

export default AssignmentSubmission;
