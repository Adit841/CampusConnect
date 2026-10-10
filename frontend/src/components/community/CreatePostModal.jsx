import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { focusRing } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { CATEGORIES } from '../../services/communityService.js';
import { Building2, Sparkles, AlertCircle } from 'lucide-react';

export default function CreatePostModal({ open, onClose, onSubmit, currentUser }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('facilities');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableCategories = CATEGORIES.filter((c) => c.id !== 'all');
  const isFacility = category === 'facilities';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a post title.');
      return;
    }
    if (!content.trim()) {
      setError('Please provide post details.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
        isSuggestion: category === 'facilities',
      });
      setTitle('');
      setContent('');
      setCategory('facilities');
      setError('');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create post. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Campus Post or Suggestion"
      description="Share campus feedback, ask questions, or organize study and club activities."
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Posting as <strong className="text-slate-700 dark:text-slate-200">{currentUser?.name || 'Student'}</strong>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${focusRing}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={`rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 ${focusRing}`}
            >
              {submitting ? 'Publishing…' : 'Publish Post'}
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Category selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Category
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {availableCategories.map((cat) => {
              const selected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-start rounded-xl border p-2.5 text-left text-xs transition-all ${focusRing} ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50/50 font-medium text-indigo-700 ring-1 ring-indigo-600 dark:border-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-semibold">
                    {cat.id === 'facilities' ? (
                      <Building2 className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Sparkles className="size-3.5 text-slate-400" />
                    )}
                    {cat.label}
                  </span>
                  {cat.isSuggestion && (
                    <span className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                      Tracks Feedback Status
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Suggestion notice */}
        {isFacility && (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            <p className="font-medium">Facility &amp; Campus Feedback</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700 dark:text-amber-300/80">
              This post will be assigned status <span className="font-semibold underline">Submitted</span> and can be transitioned to <span className="font-semibold">Under Review</span> and <span className="font-semibold">Resolved</span> by campus administration.
            </p>
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="post-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Title
          </label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cafeteria water cooler low pressure / Java lab study group"
            maxLength={120}
            className={`mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${focusRing}`}
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="post-content" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Details
          </label>
          <textarea
            id="post-content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe the context, location, problem, or topic in detail..."
            maxLength={2000}
            className={`mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${focusRing}`}
          />
        </div>
      </form>
    </Modal>
  );
}
