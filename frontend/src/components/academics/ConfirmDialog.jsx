import { RefreshCw } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { dangerButton, primaryButton, secondaryButton } from './buttonStyles.js';
import { FormError } from './AcademicBadges.jsx';

/** Confirmation step for destructive or irreversible actions. `onConfirm` may return a promise. */
function ConfirmDialog({ title, description, confirmLabel, destructive = false, busy = false, error, onConfirm, onClose }) {
  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className={secondaryButton}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={destructive ? dangerButton : primaryButton}>
            {busy && <RefreshCw className="size-4 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
        <FormError>{error}</FormError>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
