import { useState } from 'react';
import { Calendar, Users, MapPin, Video, CheckCircle2, Clock, LogOut, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { focusRing } from '../ui/Card.jsx';
import { SkeletonList, EmptyState } from '../ui/StateViews.jsx';

export default function MyActivitySection({
  registrations = [],
  memberships = [],
  onOpenEventDetail,
  onOpenClubDetail,
  onCancelRegistration,
  onLeaveClub,
  onExploreClubs,
  onExploreEvents,
  loading = false,
}) {
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'clubs'

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <SkeletonList rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'events'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="size-3.5" />
          <span>My Event Registrations</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              activeTab === 'events' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {registrations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clubs')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'clubs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="size-3.5" />
          <span>My Club Memberships</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              activeTab === 'clubs' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {memberships.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Event Registrations */}
      {activeTab === 'events' && (
        <div>
          {registrations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
              <Calendar className="mx-auto size-8 text-slate-400 dark:text-slate-600" />
              <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                You haven't registered for any events yet
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Browse upcoming cultural, technical, academic, or sports events on campus.
              </p>
              {onExploreEvents && (
                <button
                  type="button"
                  onClick={onExploreEvents}
                  className={`mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 ${focusRing}`}
                >
                  <span>Explore Upcoming Events</span>
                  <ArrowRight className="size-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
              {registrations.map((reg) => {
                const startDate = new Date(reg.startDateTime);
                const isUpcoming = new Date() < startDate;
                return (
                  <div
                    key={reg.id}
                    className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                          {reg.category?.replace('_', ' ')}
                        </span>
                        {reg.clubName && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            by {reg.clubName}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <CheckCircle2 className="size-3" />
                          Confirmed
                        </span>
                      </div>

                      <h4
                        onClick={() =>
                          onOpenEventDetail &&
                          onOpenEventDetail({
                            id: reg.eventId,
                            slug: reg.eventSlug,
                            title: reg.eventTitle,
                          })
                        }
                        className="cursor-pointer text-sm font-bold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400 truncate"
                      >
                        {reg.eventTitle}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-indigo-500" />
                          <span>
                            {startDate.toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            at{' '}
                            {startDate.toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                        <span>•</span>
                        <span>{reg.venue || 'Campus Venue'}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenEventDetail &&
                          onOpenEventDetail({
                            id: reg.eventId,
                            slug: reg.eventSlug,
                            title: reg.eventTitle,
                          })
                        }
                        className={`rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 ${focusRing}`}
                      >
                        View Details
                      </button>

                      {isUpcoming && onCancelRegistration && (
                        <button
                          type="button"
                          onClick={() => onCancelRegistration(reg.eventId)}
                          className={`rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300 ${focusRing}`}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Club Memberships */}
      {activeTab === 'clubs' && (
        <div>
          {memberships.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
              <Users className="mx-auto size-8 text-slate-400 dark:text-slate-600" />
              <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                You haven't joined any clubs yet
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Explore campus clubs in coding, arts, robotics, literature, and athletics.
              </p>
              {onExploreClubs && (
                <button
                  type="button"
                  onClick={onExploreClubs}
                  className={`mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 ${focusRing}`}
                >
                  <span>Explore Campus Clubs</span>
                  <ArrowRight className="size-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
              {memberships.map((mem) => {
                const joinedDate = new Date(mem.joinedAt);
                return (
                  <div
                    key={mem.id}
                    className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                          {mem.clubCategory?.replace('_', ' ')}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Role: {mem.role}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <CheckCircle2 className="size-3" />
                          Active Member
                        </span>
                      </div>

                      <h4
                        onClick={() =>
                          onOpenClubDetail &&
                          onOpenClubDetail({
                            id: mem.clubId,
                            slug: mem.clubSlug,
                            name: mem.clubName,
                          })
                        }
                        className="cursor-pointer text-sm font-bold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400 truncate"
                      >
                        {mem.clubName}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Joined on{' '}
                        {joinedDate.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenClubDetail &&
                          onOpenClubDetail({
                            id: mem.clubId,
                            slug: mem.clubSlug,
                            name: mem.clubName,
                          })
                        }
                        className={`rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 ${focusRing}`}
                      >
                        Explore Club
                      </button>

                      {onLeaveClub && (
                        <button
                          type="button"
                          onClick={() => onLeaveClub(mem.clubId)}
                          className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 ${focusRing}`}
                        >
                          <LogOut className="size-3" />
                          <span>Leave</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
