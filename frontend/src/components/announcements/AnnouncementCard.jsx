import { Pin, Calendar, Users, Edit3, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { Card, focusRing } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { formatRelative, formatShortDate } from '../../utils/format.js';

const categoryTones = {
  GENERAL: 'neutral',
  ACADEMIC: 'accent',
  EXAM: 'danger',
  EVENT: 'warning',
  URGENT: 'danger',
};

export function AnnouncementCard({
  announcement,
  currentUser,
  onEdit,
  onDelete,
  onViewDetails,
}) {
  const authorName = announcement.authorName || announcement.author || 'Faculty Member';
  const postedAt = announcement.createdAt || announcement.postedAt || new Date().toISOString();
  const category = (announcement.category || 'GENERAL').toUpperCase();
  const audience = announcement.audience || 'ALL';

  // Determine if current user can edit/delete
  const isAuthor =
    currentUser &&
    (currentUser.id === announcement.authorId ||
      currentUser.email === announcement.authorEmail ||
      (currentUser.role === 'TEACHER' && currentUser.name === authorName));

  const canManage = currentUser?.role === 'ADMIN' || (currentUser?.role === 'TEACHER' && isAuthor);

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700">
      {announcement.pinned && (
        <div className="absolute top-0 right-0 z-10">
          <div className="flex items-center gap-1 rounded-bl-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-400/20 dark:text-amber-300">
            <Pin className="size-3 fill-amber-500 text-amber-500 dark:text-amber-300" aria-hidden="true" />
            Pinned Notice
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Header Tags */}
        <div className="flex flex-wrap items-center gap-2 pr-24">
          <Badge tone={categoryTones[category] || 'neutral'}>
            {category === 'URGENT' && <AlertTriangle className="size-3" />}
            {category}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Users className="size-3.5" aria-hidden="true" />
            <span>{audience === 'ALL' ? 'Everyone' : audience}</span>
          </span>
          {announcement.department && (
            <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {announcement.department}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetails(announcement)}
          className={`mt-3 cursor-pointer text-base font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 sm:text-lg dark:text-slate-100 dark:group-hover:text-indigo-400`}
        >
          {announcement.title}
        </h3>

        {/* Content Body Preview */}
        {announcement.content && (
          <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
            {announcement.content}
          </p>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800/80 dark:bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <Avatar name={authorName} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">
              {authorName}
            </p>
            <p className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Calendar className="size-3" aria-hidden="true" />
              <time dateTime={postedAt} title={new Date(postedAt).toLocaleString()}>
                {formatRelative(postedAt)} ({formatShortDate(postedAt)})
              </time>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <div className="flex items-center gap-1 border-r border-slate-200 pr-2 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onEdit(announcement)}
                title="Edit announcement"
                aria-label={`Edit ${announcement.title}`}
                className={`rounded p-1.5 text-slate-500 hover:bg-slate-200/60 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 ${focusRing}`}
              >
                <Edit3 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(announcement)}
                title="Delete announcement"
                aria-label={`Delete ${announcement.title}`}
                className={`rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 ${focusRing}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => onViewDetails(announcement)}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10 ${focusRing}`}
          >
            Read details
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>
    </Card>
  );
}

export default AnnouncementCard;
