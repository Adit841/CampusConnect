import { useId, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import {
  acceptAttribute,
  createAssignment,
  describeError,
  fileRules,
  removeAssignmentAttachment,
  toLocalInputValue,
  updateAssignment,
  uploadAssignmentAttachment,
  validateFile,
} from '../../services/academicsService.js';
import { fieldClass, fileInputClass, labelClass, primaryButton, secondaryButton, textareaClass } from './buttonStyles.js';
import { FormError } from './AcademicBadges.jsx';

function initialForm(assignment, defaultSubjectId, subjects) {
  return {
    subjectId: String(assignment?.subjectId ?? defaultSubjectId ?? subjects[0]?.id ?? ''),
    title: assignment?.title ?? '',
    description: assignment?.description ?? '',
    instructions: assignment?.instructions ?? '',
    maxMarks: String(assignment?.maxMarks ?? 100),
    dueAt: toLocalInputValue(assignment?.dueAt),
    allowLateSubmissions: Boolean(assignment?.allowLateSubmissions),
  };
}

function validate(form, original) {
  const errors = {};
  if (!form.subjectId) errors.subjectId = 'Choose a subject.';
  if (!form.title.trim()) errors.title = 'Title is required.';
  else if (form.title.trim().length > 200) errors.title = 'Title must be 200 characters or fewer.';
  const marks = Number(form.maxMarks);
  if (!Number.isInteger(marks) || marks < 1 || marks > 1000) errors.maxMarks = 'Maximum marks must be a whole number from 1 to 1000.';
  if (!form.dueAt) errors.dueAt = 'Deadline is required.';
  else {
    const changed = !original || toLocalInputValue(original.dueAt) !== form.dueAt;
    if (changed && new Date(form.dueAt) <= new Date()) errors.dueAt = 'The deadline must be in the future.';
  }
  return errors;
}

/**
 * Create or edit an assignment (teachers, own subjects only). New assignments can be saved as drafts or
 * published directly; published assignments stay published. `onSaved` refreshes the page data.
 */
function AssignmentFormDialog({ assignment, subjects, defaultSubjectId, onClose, onSaved }) {
  const id = useId();
  const [current, setCurrent] = useState(assignment ?? null);
  const [form, setForm] = useState(() => initialForm(assignment, defaultSubjectId, subjects));
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [busy, setBusy] = useState(null);

  const isPublished = current?.status === 'PUBLISHED';
  const fileError = validateFile(file);
  const set = (key) => (event) =>
    setForm((f) => ({ ...f, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const save = async (publish) => {
    if (busy) return;
    const found = validate(form, current);
    setErrors(found);
    if (Object.keys(found).length > 0 || fileError) return;

    setBusy(publish ? 'publish' : 'save');
    setApiError(null);
    const payload = {
      subjectId: Number(form.subjectId),
      title: form.title.trim(),
      description: form.description.trim() || null,
      instructions: form.instructions.trim() || null,
      maxMarks: Number(form.maxMarks),
      dueAt: new Date(form.dueAt).toISOString(),
      allowLateSubmissions: form.allowLateSubmissions,
      publish,
    };

    let saved;
    try {
      saved = current ? await updateAssignment(current.id, payload) : await createAssignment(payload);
      setCurrent(saved);
    } catch (err) {
      setApiError(await describeError(err));
      setBusy(null);
      return;
    }

    try {
      if (file) {
        saved = await uploadAssignmentAttachment(saved.id, file);
      } else if (removeAttachment && saved.attachment) {
        saved = await removeAssignmentAttachment(saved.id);
      }
    } catch (err) {
      setApiError(`The assignment was saved, but the attachment change failed: ${await describeError(err)}`);
      setBusy(null);
      await onSaved(saved, { keepOpen: true });
      return;
    }

    await onSaved(saved);
  };

  const fieldError = (key) => errors[key] && <FormError id={`${id}-${key}-error`}>{errors[key]}</FormError>;
  const describedBy = (key) => (errors[key] ? `${id}-${key}-error` : undefined);

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={current ? 'Edit assignment' : 'New assignment'}
      description={isPublished ? 'This assignment is published. Changes are visible to students immediately.' : 'Drafts are hidden from students until you publish them.'}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={Boolean(busy)} className={secondaryButton}>
            Cancel
          </button>
          {!isPublished && (
            <button type="button" onClick={() => save(false)} disabled={Boolean(busy)} className={secondaryButton}>
              {busy === 'save' && <RefreshCw className="size-4 animate-spin" aria-hidden="true" />}
              Save draft
            </button>
          )}
          <button type="button" onClick={() => save(!isPublished)} disabled={Boolean(busy)} className={primaryButton}>
            {busy === 'publish' && <RefreshCw className="size-4 animate-spin" aria-hidden="true" />}
            {isPublished ? 'Save changes' : 'Publish'}
          </button>
        </>
      }
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          save(!isPublished);
        }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-subject`} className={labelClass}>Subject</label>
          <select id={`${id}-subject`} value={form.subjectId} onChange={set('subjectId')} className={fieldClass} aria-describedby={describedBy('subjectId')}>
            {subjects.map((s) => (
              <option key={s.id} value={String(s.id)}>{s.name} ({s.code})</option>
            ))}
          </select>
          {fieldError('subjectId')}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-title`} className={labelClass}>Title</label>
          <input id={`${id}-title`} value={form.title} onChange={set('title')} maxLength={200} className={fieldClass}
            aria-invalid={Boolean(errors.title)} aria-describedby={describedBy('title')} />
          {fieldError('title')}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-description`} className={labelClass}>Description</label>
          <textarea id={`${id}-description`} rows={3} maxLength={10000} value={form.description} onChange={set('description')} className={textareaClass} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-instructions`} className={labelClass}>Instructions</label>
          <textarea id={`${id}-instructions`} rows={4} maxLength={10000} value={form.instructions} onChange={set('instructions')} className={textareaClass}
            placeholder="One instruction per line" />
        </div>

        <div>
          <label htmlFor={`${id}-due`} className={labelClass}>Deadline</label>
          <input id={`${id}-due`} type="datetime-local" value={form.dueAt} onChange={set('dueAt')} className={fieldClass}
            aria-invalid={Boolean(errors.dueAt)} aria-describedby={describedBy('dueAt')} />
          {fieldError('dueAt')}
        </div>

        <div>
          <label htmlFor={`${id}-marks`} className={labelClass}>Maximum marks</label>
          <input id={`${id}-marks`} type="number" min={1} max={1000} step={1} value={form.maxMarks} onChange={set('maxMarks')} className={fieldClass}
            aria-invalid={Boolean(errors.maxMarks)} aria-describedby={describedBy('maxMarks')} />
          {fieldError('maxMarks')}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2 dark:text-slate-300">
          <input type="checkbox" checked={form.allowLateSubmissions} onChange={set('allowLateSubmissions')} />
          Accept late submissions (they are flagged as late)
        </label>

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-file`} className={labelClass}>{current?.attachment ? 'Replace attachment' : 'Attachment (optional)'}</label>
          <input id={`${id}-file`} type="file" accept={acceptAttribute} onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className={fileInputClass} aria-describedby={`${id}-file-hint`} />
          <p id={`${id}-file-hint`} className="mt-1 text-xs text-slate-500 dark:text-slate-400">Up to {fileRules.maxSizeMb} MB.</p>
          {current?.attachment && !file && (
            <label className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={removeAttachment} onChange={(event) => setRemoveAttachment(event.target.checked)} />
              Remove current attachment ({current.attachment.fileName})
            </label>
          )}
          <FormError>{fileError}</FormError>
        </div>

        <div className="sm:col-span-2">
          <FormError>{apiError}</FormError>
        </div>
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}

export default AssignmentFormDialog;
