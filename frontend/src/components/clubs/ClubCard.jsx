import { Users, Sparkles, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { focusRing } from '../ui/Card.jsx';

const CATEGORY_STYLES = {
  TECHNICAL: {
    badge: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30',
    avatarBg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  },
  CULTURAL: {
    badge: 'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-500/30',
    avatarBg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  },
  SPORTS: {
    badge: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
    avatarBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
  },
  ACADEMIC: {
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
    avatarBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  SOCIAL: {
    badge: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30',
    avatarBg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
  },
};

export default function ClubCard({
  club,
  onOpenDetail,
  onJoin,
  onLeave,
  isActionLoading = false,
}) {
  if (!club) return null;

  const style = CATEGORY_STYLES[club.category] || CATEGORY_STYLES.TECHNICAL;
  const initial = club.name ? club.name.replace(/^Arya\s+/i, '').charAt(0) || 'C' : 'C';

  const isJoined = club.userMembershipStatus === 'APPROVED';
  const isPending = club.userMembershipStatus === 'PENDING';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div>
        {/* Header row: Avatar, Category, Sample Tag */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl font-bold text-base shadow-xs select-none ${style.avatarBg}`}
            >
              {initial}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${style.badge}`}
                >
                  {club.category?.replace('_', ' ')}
                </span>
                {club.sampleData && (
                  <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                    Sample
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Users className="size-3 text-slate-400" />
                <span>{club.memberCount || 0} members</span>
              </div>
            </div>
          </div>
        </div>

        {/* Club Name */}
        <h3
          onClick={() => onOpenDetail && onOpenDetail(club)}
          className="mt-3.5 cursor-pointer text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400"
        >
          {club.name}
        </h3>

        {/* Tagline */}
        {club.tagline && (
          <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 line-clamp-1">
            {club.tagline}
          </p>
        )}

        {/* Description */}
        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
          {club.description}
        </p>

        {/* Activities preview chips */}
        {club.activities && (
          <div className="mt-3 flex flex-wrap gap-1">
            {club.activities
              .split(',')
              .slice(0, 3)
              .map((act, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {act.trim()}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => onOpenDetail && onOpenDetail(club)}
          className={`text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 ${focusRing}`}
        >
          Explore Club
        </button>

        <div>
          {isJoined ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
              <CheckCircle2 className="size-3" />
              Joined
            </span>
          ) : isPending ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
              <Clock className="size-3" />
              Requested
            </span>
          ) : onJoin ? (
            <button
              type="button"
              onClick={() => onJoin(club.id)}
              disabled={isActionLoading}
              className={`inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-indigo-500 active:scale-98 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400 ${focusRing}`}
            >
              <span>{isActionLoading ? 'Joining…' : 'Join Club'}</span>
              <ArrowRight className="size-3" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
