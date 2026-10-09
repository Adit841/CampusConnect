import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { focusRing } from './Card.jsx';

/**
 * Accessible modal built on the native <dialog> element, which provides focus containment,
 * Escape-to-close and the backdrop. Render it conditionally or toggle `open`.
 */
function Modal({ open, onClose, title, description, children, footer }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-xl border border-slate-200 bg-white p-0 text-slate-800 shadow-xl backdrop:bg-slate-900/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            {description && <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={`-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 ${focusRing}`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-3 dark:border-slate-800">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}

export default Modal;
