import { useEffect } from 'react';

/** Calls onDismiss when the user clicks outside `ref` or presses Escape, while `active` is true. */
export function useDismiss(ref, onDismiss, active) {
  useEffect(() => {
    if (!active) return undefined;
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onDismiss();
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onDismiss();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, onDismiss, active]);
}
