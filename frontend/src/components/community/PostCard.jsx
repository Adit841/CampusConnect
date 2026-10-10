import { useState } from 'react';
import {
  ThumbsUp,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  Share2,
  ChevronRight,
  Sparkles,
  Building2,
  BookOpen,
  CalendarDays,
  Compass,
  HelpCircle,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { Card, focusRing } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { FEEDBACK_STATUSES } from '../../services/communityService.js';
import { formatDistanceToNow } from '../../util/dateUtils.js';

function CategoryIcon({ category, className = 'size-3.5' }) {
  switch (category) {
    case 'facilities':
      return <Building2 className={className} />;
    case 'academics':
      return <BookOpen className={className} />;
    case 'clubs-events':
      return <CalendarDays className={className} />;
    case 'campus-life':
      return <Compass className={className} />;
    case 'qna':
      return <HelpCircle className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

export default function PostCard({
  post,
  currentUserId,
  userRole,
  onUpvote,
  onOpenDetails,
  onStatusChange,
  onReport,
  onDelete,
  onResolveReports,
}) {
  const [reported, setReported] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasUpvoted = post.upvotedBy?.includes(String(currentUserId || 'current-user'));
  const isAuthor = String(post.author?.id) === String(currentUserId);
  const isAdmin = userRole === 'ADMIN';
  const canManageStatus = isAuthor || userRole === 'TEACHER' || isAdmin;
  const canDelete = isAuthor || isAdmin;

  const statusConfig = post.isSuggestion ? FEEDBACK_STATUSES[post.status] || FEEDBACK_STATUSES.SUBMITTED : null;

  const handleReportClick = (e) => {
    e.stopPropagation();
    if (reported) return;
    onReport?.(post.id);
    setReported(true);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Link to community post copied to clipboard!');
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete?.(post.id);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <Card className="transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md">
      <div className="p-5 sm:p-6">
        {/* Header row: Author + Badges */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30">
              {post.author?.initials || 'CC'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {post.author?.name}
                </span>
                <Badge
                  tone={
                    post.author?.role === 'TEACHER'
                      ? 'accent'
                      : post.author?.role === 'ADMIN'
                      ? 'warning'
                      : 'neutral'
                  }
                >
                  {post.author?.role === 'TEACHER'
                    ? 'Faculty'
                    : post.author?.role === 'ADMIN'
                    ? 'Admin'
                    : 'Student'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {post.author?.department ? `${post.author.department} · ` : ''}
                {formatDistanceToNow(post.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Moderation Flag Badge for Admin */}
            {isAdmin && post.reportsCount > 0 && (
              <Badge tone="danger" className="gap-1 py-1 font-semibold">
                <ShieldAlert className="size-3 text-rose-600" />
                <span>{post.reportsCount} {post.reportsCount === 1 ? 'Report' : 'Reports'}</span>
              </Badge>
            )}

            {/* Category Badge */}
            <Badge tone="neutral" className="gap-1.5 py-1">
              <CategoryIcon category={post.category} />
              {post.categoryLabel || post.category}
            </Badge>

            {/* Facility Feedback Status Pill */}
            {post.isSuggestion && statusConfig && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canManageStatus) setStatusMenuOpen(!statusMenuOpen);
                  }}
                  disabled={!canManageStatus}
                  title={canManageStatus ? 'Click to change status' : statusConfig.description}
                  className={`cursor-pointer ${canManageStatus ? 'hover:opacity-85' : 'cursor-default'}`}
                >
                  <Badge tone={statusConfig.tone} className="gap-1.5 py-1 font-semibold">
                    {post.status === 'RESOLVED' ? (
                      <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : post.status === 'UNDER_REVIEW' ? (
                      <AlertCircle className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
                    )}
                    <span>{statusConfig.label}</span>
                  </Badge>
                </button>

                {/* Status Dropdown menu */}
                {statusMenuOpen && (
                  <div
                    className="absolute right-0 top-full z-20 mt-1.5 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Update Status
                    </div>
                    {Object.values(FEEDBACK_STATUSES).map((statusItem) => (
                      <button
                        key={statusItem.key}
                        type="button"
                        onClick={() => {
                          onStatusChange?.(post.id, statusItem.key);
                          setStatusMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                          post.status === statusItem.key
                            ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        {statusItem.label}
                        {post.status === statusItem.key && <CheckCircle2 className="size-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Title & Body */}
        <div className="mt-4 cursor-pointer" onClick={() => onOpenDetails?.(post)}>
          <h2 className="text-base font-semibold text-slate-900 transition-colors hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400 sm:text-lg">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {/* Upvote Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpvote?.(post.id);
              }}
              aria-label={`Upvote. Current count: ${post.upvotes || 0}`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${focusRing} ${
                hasUpvoted
                  ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-500'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <ThumbsUp className={`size-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
              <span>{post.upvotes || 0}</span>
              <span className="hidden sm:inline">{hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
            </button>

            {/* Comments Counter */}
            <button
              type="button"
              onClick={() => onOpenDetails?.(post)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 ${focusRing}`}
            >
              <MessageSquare className="size-3.5" />
              <span>{post.comments?.length || post.commentsCount || 0}</span>
              <span className="hidden sm:inline">Comments</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Admin Dismiss Reports Button */}
            {isAdmin && post.reportsCount > 0 && onResolveReports && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onResolveReports(post.id);
                }}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 ${focusRing}`}
                title="Dismiss and resolve user reports"
              >
                <span>Dismiss Flags</span>
              </button>
            )}

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShareClick}
              title="Share discussion"
              aria-label="Share discussion"
              className={`inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 ${focusRing}`}
            >
              <Share2 className="size-3.5" />
            </button>

            {/* Report Button */}
            <button
              type="button"
              onClick={handleReportClick}
              title={reported ? 'Reported for review' : 'Report inappropriate post'}
              aria-label="Report post"
              className={`inline-flex size-8 items-center justify-center rounded-lg transition-colors ${focusRing} ${
                reported
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800'
              }`}
            >
              <Flag className="size-3.5" />
            </button>

            {/* Moderation / Author Delete Button with confirmation */}
            {canDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                title={confirmDelete ? 'Click again to confirm deletion' : 'Delete post'}
                aria-label="Delete post"
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${focusRing} ${
                  confirmDelete
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40'
                }`}
              >
                <Trash2 className="size-3.5" />
                {confirmDelete && <span>Confirm?</span>}
              </button>
            )}

            {/* View Thread */}
            <button
              type="button"
              onClick={() => onOpenDetails?.(post)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 ${focusRing}`}
            >
              <span>View thread</span>
              <ChevronRight className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
