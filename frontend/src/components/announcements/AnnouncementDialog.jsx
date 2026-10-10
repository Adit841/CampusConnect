import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { CATEGORIES, AUDIENCE_OPTIONS } from '../../services/announcementService.js';
import { focusRing } from '../ui/Card.jsx';
import { RefreshCw, Pin, AlertCircle } from 'lucide-react';

export function AnnouncementDialog({
  open,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  apiError = null,
}) {
  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [audience, setAudience] = useState('ALL');
  const [department, setDepartment] = useState('');
  const [pinned, setPinned] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setCategory(initialData.category || 'GENERAL');
      setAudience(initialData.audience || 'ALL');
      setDepartment(initialData.department || '');
      setPinned(Boolean(initialData.pinned));
    } else {
      setTitle('');
      setContent('');
      setCategory('GENERAL');
      setAudience('ALL');
      setDepartment('');
      setPinned(false);
    }
    setErrors({});
  }, [initialData, open]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title is required';
    } else if (title.trim().length > 255) {
      errs.title = 'Title must be 255 characters or less';
    }
    if (!content.trim()) {
      errs.content = 'Announcement content is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      category,
      audience,
      department: department.trim() || null,
      pinned,
    });
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className={`rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${focusRing}`}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400 ${focusRing}`}
      >
        {isSubmitting && <RefreshCw className="size-4 animate-spin" />}
        {isEditing ? 'Save Changes' : 'Publish Notice'}
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Announcement' : 'Post New Announcement'}
      description={
        isEditing
          ? 'Update the announcement details and targeted audience.'
          : 'Publish an announcement visible to campus students and faculty.'
      }
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Title Field */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="announcement-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Title <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{title.length}/255</span>
          </div>
          <input
            id="announcement-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            maxLength={255}
            placeholder="e.g. Mid-semester examination schedule published"
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${
              errors.title ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-700'
            } ${focusRing}`}
          />
          {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
        </div>

        {/* Category & Audience Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="announcement-category" className="block text-xs font-semibold text-slate-700 mb-1 dark:text-slate-300">
              Category
            </label>
            <select
              id="announcement-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 ${focusRing}`}
            >
              {CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="announcement-audience" className="block text-xs font-semibold text-slate-700 mb-1 dark:text-slate-300">
              Intended Audience
            </label>
            <select
              id="announcement-audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 ${focusRing}`}
            >
              {AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Department */}
        <div>
          <label htmlFor="announcement-dept" className="block text-xs font-semibold text-slate-700 mb-1 dark:text-slate-300">
            Target Department <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="announcement-dept"
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Computer Science & Engineering"
            className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${focusRing}`}
          />
        </div>

        {/* Content Field */}
        <div>
          <label htmlFor="announcement-content" className="block text-xs font-semibold text-slate-700 mb-1 dark:text-slate-300">
            Content Details <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="announcement-content"
            rows={5}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) setErrors((prev) => ({ ...prev, content: null }));
            }}
            placeholder="Write the announcement description, instructions, schedule, or links here…"
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${
              errors.content ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-700'
            } ${focusRing}`}
          />
          {errors.content && <p className="mt-1 text-xs text-rose-500">{errors.content}</p>}
        </div>

        {/* Pin Notice Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id="announcement-pinned"
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
          />
          <label
            htmlFor="announcement-pinned"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer dark:text-slate-300"
          >
            <Pin className="size-3 text-amber-500" />
            Pin this announcement to the top of the feed
          </label>
        </div>
      </form>
    </Modal>
  );
}

export default AnnouncementDialog;
