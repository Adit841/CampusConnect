import { Search, X, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '../../services/announcementService.js';
import { focusRing } from '../ui/Card.jsx';

export function AnnouncementFilters({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedAudience,
  onAudienceChange,
  audienceOptions = [],
  totalCount,
  filteredCount,
  onReset,
}) {
  const hasActiveFilters = search || selectedCategory !== 'ALL' || selectedAudience !== 'ALL';

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, keywords or content…"
            className={`w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pr-9 pl-9 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:bg-slate-800 ${focusRing}`}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Audience Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="audience-filter" className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
            Audience:
          </label>
          <select
            id="audience-filter"
            value={selectedAudience}
            onChange={(e) => onAudienceChange(e.target.value)}
            className={`rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 ${focusRing}`}
          >
            <option value="ALL">All Audiences</option>
            {audienceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 inline-flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500">
            <SlidersHorizontal className="size-3" />
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                } ${focusRing}`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredCount}</span> of{' '}
          <span>{totalCount}</span> notices
        </div>
      </div>
    </div>
  );
}

export default AnnouncementFilters;
