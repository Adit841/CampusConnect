import Modal from '../ui/Modal.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { formatDateTime } from '../../utils/format.js';
import { focusRing } from '../ui/Card.jsx';
import { Calendar, Users, Building, Pin, Edit3, Trash2 } from 'lucide-react';

export function AnnouncementDetailModal({
  announcement,
  open,
  onClose,
  currentUser,
  onEdit,
  onDelete,
}) {
  if (!announcement) return null;

  const authorName = announcement.authorName || announcement.author || 'Faculty Member';
  const postedAt = announcement.createdAt || announcement.postedAt || new Date().toISOString();
  const category = (announcement.category || 'GENERAL').toUpperCase();
  const audience = announcement.audience || 'ALL';

  const isAuthor =
    currentUser &&
    (currentUser.id === announcement.authorId ||
      currentUser.email === announcement.authorEmail ||
      (currentUser.role === 'TEACHER' && currentUser.name === authorName));

  const canManage = currentUser?.role === 'ADMIN' || (currentUser?.role === 'TEACHER' && isAuthor);

  const footer = (
    <div className="flex w-full items-center justify-between">
      <div>
        {canManage && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(announcement);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${focusRing}`}
            >
              <Edit3 className="size-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(announcement);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20 ${focusRing}`}
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className={`rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white ${focusRing}`}
      >
        Close
      </button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={announcement.title} footer={footer}>
      <div className="space-y-4">
        {/* Badges / Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          {announcement.pinned && (
            <Badge tone="warning">
              <Pin className="size-3 fill-amber-500 text-amber-500" />
              Pinned
            </Badge>
          )}
          <Badge tone="neutral">{category}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Users className="size-3" />
            <span>Audience: {audience === 'ALL' ? 'Everyone' : audience}</span>
          </span>
          {announcement.department && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Building className="size-3" />
              <span>{announcement.department}</span>
            </span>
          )}
        </div>

        {/* Author & Date Card */}
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <Avatar name={authorName} size="md" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{authorName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {announcement.authorRole || 'Faculty'} {announcement.authorEmail ? `· ${announcement.authorEmail}` : ''}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
            <p className="flex items-center gap-1 justify-end">
              <Calendar className="size-3" />
              <span>{formatDateTime(postedAt)}</span>
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="rounded-lg border border-slate-100 bg-white p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {announcement.content}
        </div>
      </div>
    </Modal>
  );
}

export default AnnouncementDetailModal;
