import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { SidebarContent } from './AppSidebar.jsx';
import { focusRing } from '../ui/Card.jsx';

/** Slide-in navigation drawer for screens narrower than the `lg` breakpoint. */
function MobileNavigation({ open, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeButtonRef.current?.focus();
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        inert={!open}
        className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl transition-transform duration-200 dark:bg-slate-900 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className={`absolute right-3 top-3.5 inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 ${focusRing}`}
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}

export default MobileNavigation;
