import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { focusRing } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { FEEDBACK_STATUSES } from '../../services/communityService.js';
import {
  ThumbsUp,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Flag,
  Share2,
} from 'lucide-react';

function formatRelativeTime(isoString) {
  try {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(isoString).toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export default function PostDetailModal({
  open,
  post,
  onClose,
  currentUser,
  onUpvote,
  onAddComment,
  onStatusChange,
  onReport,
}) {
  const [commentText, setCommentText] = useState('');
  const [reported, setReported] = useState(false);

  if (!post) return null;

  const currentUserId = currentUser?.id || 'current-user';
  const hasUpvoted = post.upvotedBy?.includes(String(currentUserId));
  const isAuthor = String(post.author?.id) === String(currentUserId);
  const canManageStatus = isAuthor || currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN';

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    await onAddComment(post.id, {
      text: commentText.trim(),
    });
    setCommentText('');
  };

  const handleReport = () => {
    if (reported) return;
    onReport?.(post.id);
    setReported(true);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={post.categoryLabel || 'Community Discussion'}
      description={`Started by ${post.author?.name} · ${formatRelativeTime(post.createdAt)}`}
    >
      <div className="space-y-6">
        {/* Author info & post title */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30">
                {post.author?.initials || 'ST'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {post.author?.name}
                  </span>
                  <Badge tone={post.author?.role === 'TEACHER' ? 'accent' : 'neutral'}>
                    {post.author?.role === 'TEACHER' ? 'Faculty' : post.author?.role === 'ADMIN' ? 'Staff' : 'Student'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {post.author?.department || 'Campus Member'} · {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReport}
                title={reported ? 'Reported' : 'Report'}
                className={`inline-flex size-8 items-center justify-center rounded-lg ${focusRing} ${
                  reported ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800'
                }`}
              >
                <Flag className="size-3.5" />
              </button>
            </div>
          </div>

          <h1 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Suggestion Feedback Status Stepper if applicable */}
        {post.isSuggestion && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Campus Feedback Progress
              </span>
              {canManageStatus && (
                <div className="flex gap-1.5">
                  {Object.values(FEEDBACK_STATUSES).map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => onStatusChange?.(post.id, st.key)}
                      className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        post.status === st.key
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stepper visualization */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div
                className={`flex flex-col items-center rounded-lg p-2 text-center text-xs ${
                  post.status === 'SUBMITTED' || post.status === 'UNDER_REVIEW' || post.status === 'RESOLVED'
                    ? 'border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}
              >
                <Clock className="size-4 shrink-0" />
                <span className="mt-1 font-semibold">1. Submitted</span>
                <span className="text-[10px] opacity-80">Logged</span>
              </div>

              <div
                className={`flex flex-col items-center rounded-lg p-2 text-center text-xs ${
                  post.status === 'UNDER_REVIEW' || post.status === 'RESOLVED'
                    ? 'border border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}
              >
                <AlertCircle className="size-4 shrink-0" />
                <span className="mt-1 font-semibold">2. Under Review</span>
                <span className="text-[10px] opacity-80">Evaluating</span>
              </div>

              <div
                className={`flex flex-col items-center rounded-lg p-2 text-center text-xs ${
                  post.status === 'RESOLVED'
                    ? 'border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="size-4 shrink-0" />
                <span className="mt-1 font-semibold">3. Resolved</span>
                <span className="text-[10px] opacity-80">Action Taken</span>
              </div>
            </div>
          </div>
        )}

        {/* Upvote & stats row */}
        <div className="flex items-center justify-between border-y border-slate-100 py-3 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onUpvote?.(post.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${focusRing} ${
              hasUpvoted
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <ThumbsUp className={`size-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
            <span>{post.upvotes || 0} Upvotes</span>
          </button>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {post.comments?.length || 0} discussion replies
          </span>
        </div>

        {/* Comments section */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Discussion &amp; Comments
          </h2>

          <div className="mt-3 space-y-3">
            {(!post.comments || post.comments.length === 0) && (
              <p className="py-4 text-center text-xs text-slate-400">
                No replies yet. Be the first to share your thoughts or advice!
              </p>
            )}

            {post.comments?.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                  {comment.author?.initials || 'ST'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {comment.author?.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* New comment input */}
          <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a reply or helpful suggestion..."
              className={`flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${focusRing}`}
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className={`inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 ${focusRing}`}
            >
              <Send className="size-3" />
              <span>Reply</span>
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
