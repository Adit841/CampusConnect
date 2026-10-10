import Modal from '../ui/Modal.jsx';
import { focusRing } from '../ui/Card.jsx';
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  announcementTitle,
  isDeleting = false,
}) {
  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isDeleting}
        className={`rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${focusRing}`}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isDeleting}
        className={`inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-500 disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-400 ${focusRing}`}
      >
        {isDeleting ? <RefreshCw className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        Delete Notice
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Announcement"
      description="This action cannot be undone. Are you sure you want to remove this announcement?"
      footer={footer}
    >
      <div className="flex items-start gap-3 rounded-lg bg-rose-50/60 p-3.5 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">
        <AlertTriangle className="size-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
        <div>
          <p className="font-semibold text-rose-900 dark:text-rose-100">
            {announcementTitle || 'Selected announcement'}
          </p>
          <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
            This announcement will be permanently removed from all students and faculty feeds.
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteConfirmDialog;
