import { useRef } from 'react';
import { focusRing } from '../ui/Card.jsx';

/**
 * ARIA tab list. Arrow keys / Home / End move between tabs (roving tabindex).
 * Panels must use id `${idPrefix}-panel-${tab.id}` and aria-labelledby `${idPrefix}-tab-${tab.id}`.
 */
function AcademicsTabs({ tabs, activeTab, onChange, idPrefix }) {
  const refs = useRef({});

  const onKeyDown = (event) => {
    const index = tabs.findIndex((tab) => tab.id === activeTab);
    const moves = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = tabs[(moves[event.key] + tabs.length) % tabs.length];
    onChange(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <div className="overflow-x-auto border-b border-slate-200 dark:border-slate-800">
      <div role="tablist" aria-label="Academics sections" className="flex min-w-max gap-1" onKeyDown={onKeyDown}>
        {tabs.map(({ id, label, icon: Icon, count }) => {
          const selected = id === activeTab;
          return (
            <button
              key={id}
              ref={(node) => (refs.current[id] = node)}
              id={`${idPrefix}-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${idPrefix}-panel-${id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(id)}
              className={`-mb-px inline-flex items-center gap-2 rounded-t-lg border-b-2 px-3 py-2.5 text-sm sm:px-4 font-medium transition-colors ${focusRing} ${
                selected
                  ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="hidden size-4 sm:block" aria-hidden="true" />
              {label}
              {count != null && (
                <span className="rounded-full bg-slate-100 px-1.5 text-xs tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AcademicsTabs;
