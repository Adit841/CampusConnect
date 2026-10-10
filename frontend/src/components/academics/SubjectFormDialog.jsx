import { useCallback, useEffect, useId, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { createSubject, describeError, fetchTeacherOptions, updateSubject } from '../../services/academicsService.js';
import { fieldClass, labelClass, primaryButton, secondaryButton, textareaClass } from './buttonStyles.js';
import { FormError } from './AcademicBadges.jsx';

const noTeachers = () => Promise.resolve([]);

function initialForm(subject) {
  return {
    name: subject?.name ?? '',
    code: subject?.code ?? '',
    description: subject?.description ?? '',
    credits: subject?.credits != null ? String(subject.credits) : '',
    department: subject?.department ?? '',
    course: subject?.course ?? '',
    year: subject?.year != null ? String(subject.year) : '',
    section: subject?.section ?? '',
    teacherId: subject?.teacherId != null ? String(subject.teacherId) : '',
  };
}

function validate(form, isAdmin) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!form.code.trim()) errors.code = 'Code is required.';
  else if (!/^[A-Za-z0-9][A-Za-z0-9 _-]*$/.test(form.code.trim()) || form.code.trim().length > 30)
    errors.code = 'Use up to 30 letters, numbers, spaces, hyphens or underscores.';
  if (!form.department.trim()) errors.department = 'Department is required.';
  if (form.credits !== '' && !(Number.isInteger(Number(form.credits)) && Number(form.credits) >= 0 && Number(form.credits) <= 20))
    errors.credits = 'Credits must be a whole number from 0 to 20.';
  if (form.year !== '' && !(Number.isInteger(Number(form.year)) && Number(form.year) >= 1 && Number(form.year) <= 10))
    errors.year = 'Year must be a whole number from 1 to 10.';
  if (isAdmin && !form.teacherId) errors.teacherId = 'Choose the teacher for this subject.';
  return errors;
}

/**
 * Create or edit a subject. Students see it when their department matches and, where set, their course, year
 * and section. Teachers always own subjects they create; administrators pick the teacher.
 */
function SubjectFormDialog({ role, subject, onClose, onSaved }) {
  const id = useId();
  const isAdmin = role === 'ADMIN';
  const [form, setForm] = useState(() => initialForm(subject));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [busy, setBusy] = useState(false);
  const teachers = useAsyncData(useCallback(() => (isAdmin ? fetchTeacherOptions() : noTeachers()), [isAdmin]));
  const [teacherError, setTeacherError] = useState(null);

  useEffect(() => {
    if (!teachers.error) return undefined;
    let active = true;
    describeError(teachers.error).then((message) => active && setTeacherError(message));
    return () => {
      active = false;
    };
  }, [teachers.error]);

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  const save = async (event) => {
    event?.preventDefault();
    if (busy) return;
    const found = validate(form, isAdmin);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    setApiError(null);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim() || null,
      credits: form.credits === '' ? null : Number(form.credits),
      department: form.department.trim(),
      course: form.course.trim() || null,
      year: form.year === '' ? null : Number(form.year),
      section: form.section.trim() || null,
      teacherId: isAdmin ? Number(form.teacherId) : null,
    };
    try {
      const saved = subject ? await updateSubject(subject.id, payload) : await createSubject(payload);
      await onSaved(saved);
    } catch (err) {
      setApiError(await describeError(err));
      setBusy(false);
    }
  };

  const field = (key, label, props = {}) => (
    <div className={props.wide ? 'sm:col-span-2' : undefined}>
      <label htmlFor={`${id}-${key}`} className={labelClass}>{label}</label>
      <input
        id={`${id}-${key}`}
        value={form[key]}
        onChange={set(key)}
        className={fieldClass}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `${id}-${key}-error` : undefined}
        type={props.type ?? 'text'}
        min={props.min}
        max={props.max}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
      />
      {errors[key] && <FormError id={`${id}-${key}-error`}>{errors[key]}</FormError>}
    </div>
  );

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={subject ? 'Edit subject' : 'New subject'}
      description="Students are matched by department and, when set, course, year and section."
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className={secondaryButton}>Cancel</button>
          <button type="button" onClick={save} disabled={busy} className={primaryButton}>
            {busy && <RefreshCw className="size-4 animate-spin" aria-hidden="true" />}
            {subject ? 'Save changes' : 'Create subject'}
          </button>
        </>
      }
    >
      <form noValidate onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field('name', 'Name', { wide: true, maxLength: 150 })}
        {field('code', 'Code', { maxLength: 30, placeholder: 'e.g. CS301' })}
        {field('credits', 'Credits (optional)', { type: 'number', min: 0, max: 20 })}
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-description`} className={labelClass}>Description (optional)</label>
          <textarea id={`${id}-description`} rows={3} maxLength={5000} value={form.description} onChange={set('description')} className={textareaClass} />
        </div>
        {field('department', 'Department', { maxLength: 255, placeholder: 'Must match student profiles' })}
        {field('course', 'Course (optional)', { maxLength: 255 })}
        {field('year', 'Year (optional)', { type: 'number', min: 1, max: 10 })}
        {field('section', 'Section (optional)', { maxLength: 50 })}

        {isAdmin && (
          <div className="sm:col-span-2">
            <label htmlFor={`${id}-teacher`} className={labelClass}>Teacher</label>
            <select
              id={`${id}-teacher`}
              value={form.teacherId}
              onChange={set('teacherId')}
              disabled={teachers.status === 'loading'}
              className={fieldClass}
              aria-invalid={Boolean(errors.teacherId)}
              aria-describedby={errors.teacherId ? `${id}-teacher-error` : undefined}
            >
              <option value="">{teachers.status === 'loading' ? 'Loading teachers…' : 'Select a teacher'}</option>
              {(teachers.data ?? []).map((t) => (
                <option key={t.id} value={String(t.id)}>{t.name} ({t.email})</option>
              ))}
            </select>
            {errors.teacherId && <FormError id={`${id}-teacher-error`}>{errors.teacherId}</FormError>}
            {teachers.status === 'error' && <FormError>{teacherError ?? 'Could not load teachers.'}</FormError>}
            {teachers.status === 'success' && teachers.data.length === 0 && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">No teacher accounts exist yet.</p>
            )}
          </div>
        )}

        <div className="sm:col-span-2">
          <FormError>{apiError}</FormError>
        </div>
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}

export default SubjectFormDialog;
