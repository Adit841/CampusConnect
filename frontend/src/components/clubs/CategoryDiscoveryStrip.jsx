import { Code, Music, Trophy, BookOpen, Users, Sparkles } from 'lucide-react';

export const CATEGORIES = [
  { id: 'ALL', label: 'All Categories', icon: Sparkles, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  { id: 'TECHNICAL', label: 'Technical & Coding', icon: Code, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { id: 'CULTURAL', label: 'Cultural & Arts', icon: Music, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { id: 'SPORTS', label: 'Sports & Athletics', icon: Trophy, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { id: 'ACADEMIC', label: 'Academic & Science', icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { id: 'SOCIAL', label: 'Social & Impact', icon: Users, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
];

export default function CategoryDiscoveryStrip({ selectedCategory, onSelectCategory, counts = {} }) {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;
        const count = cat.id === 'ALL' ? null : counts[cat.id];

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={[
              'group inline-flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all select-none',
              isSelected
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80',
            ].join(' ')}
          >
            <span
              className={[
                'flex size-6 items-center justify-center rounded-lg transition-colors',
                isSelected ? 'bg-white/20 text-white' : `${cat.bg} ${cat.color}`,
              ].join(' ')}
            >
              <Icon className="size-3.5" aria-hidden="true" />
            </span>
            <span>{cat.label}</span>
            {count != null && (
              <span
                className={[
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                ].join(' ')}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
