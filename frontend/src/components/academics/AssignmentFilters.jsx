import { useId } from 'react';
import { Search, X } from 'lucide-react';
import { statusMeta } from '../../services/academicsService.js';
import { fieldClass, secondaryButton } from './buttonStyles.js';

function AssignmentFilters({ filters, onChange, onReset, statusOptions, subjects, resultCount, totalCount }) {
  const id = useId();
  const set = (key) => (event) => onChange({ ...filters, [key]: event.target.value });
  const isFiltered = filters.query || filters.status !== 'ALL' || filters.subjectId !== 'ALL';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor={`${id}-q`} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id={`${id}-q`}
              type="search"
              value={filters.query}
              onChange={set('query')}
              placeholder="Search by title"
              className={`${fieldClass} pl-9`}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${id}-status`} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Status
          </label>
          <select id={`${id}-status`} value={filters.status} onChange={set('status')} className={fieldClass}>
            <option value="ALL">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{statusMeta[status].label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-subject`} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Subject
          </label>
          <select id={`${id}-subject`} value={filters.subjectId} onChange={set('subjectId')} className={fieldClass}>
            <option value="ALL">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={String(subject.id)}>{subject.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-sort`} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Sort by
          </label>
          <select id={`${id}-sort`} value={filters.sort} onChange={set('sort')} className={fieldClass}>
            <option value="DUE_ASC">Nearest deadline</option>
            <option value="NEWEST">Newest published</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
          Showing {resultCount} of {totalCount} assignments
        </p>
        {isFiltered && (
          <button type="button" onClick={onReset} className={`${secondaryButton} px-2.5 py-1 text-xs`}>
            <X className="size-3.5" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

export default AssignmentFilters;
