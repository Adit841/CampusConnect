import { useEffect, useState } from 'react';
import { Users, Calendar, MapPin, Video, CheckCircle2, Clock, LogOut, ArrowRight, Sparkles } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { Badge } from '../ui/Badge.jsx';
import { focusRing } from '../ui/Card.jsx';
import { getClubBySlug } from '../../services/clubsEventsApi.js';

export default function ClubDetailModal({
  club,
  open,
  onClose,
  onJoin,
  onLeave,
  isActionLoading = false,
  onOpenEventDetail,
}) {
  const [fullClub, setFullClub] = useState(club);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !club?.slug) {
      setFullClub(club);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getClubBySlug(club.slug)
      .then((data) => {
        if (!cancelled) setFullClub(data);
      })
      .catch((err) => {
        console.error('Error fetching full club details', err);
        if (!cancelled) setFullClub(club);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, club]);

  if (!fullClub) return null;

  const isJoined = fullClub.userMembershipStatus === 'APPROVED';
  const isPending = fullClub.userMembershipStatus === 'PENDING';
  const activitiesList = fullClub.activities
    ? fullClub.activities.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="truncate">{fullClub.name}</span>
          {fullClub.sampleData && (
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
              Sample Directory Entry
            </span>
          )}
        </div>
      }
      description={
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {fullClub.category?.replace('_', ' ')}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Users className="size-3" />
            {fullClub.memberCount || 0} members
          </span>
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 ${focusRing}`}
          >
            Close
          </button>

          <div>
            {isJoined ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                  <CheckCircle2 className="size-3.5" />
                  Joined Member
                </span>
                {onLeave && (
                  <button
                    type="button"
                    onClick={() => onLeave(fullClub.id)}
                    disabled={isActionLoading}
                    className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 ${focusRing}`}
                  >
                    <LogOut className="size-3" />
                    <span>Leave</span>
                  </button>
                )}
              </div>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                <Clock className="size-3.5" />
                Membership Pending Approval
              </span>
            ) : onJoin ? (
              <button
                type="button"
                onClick={() => onJoin(fullClub.id)}
                disabled={isActionLoading}
                className={`inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-500 active:scale-98 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400 ${focusRing}`}
              >
                <span>{isActionLoading ? 'Joining…' : 'Join Club'}</span>
                <ArrowRight className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Editorial Club Banner */}
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-slate-50 p-4 dark:border-indigo-500/20 dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-slate-800/40">
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
            {fullClub.tagline || 'Student Organization & Campus Chapter'}
          </p>
          {fullClub.sampleData && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              * Seeded campus club directory record for platform demonstration.
            </p>
          )}
        </div>

        {/* About Section */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            About the Club
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {fullClub.description}
          </p>
        </div>

        {/* Activities and Focus Areas */}
        {activitiesList.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Focus Areas & Activities
            </h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activitiesList.map((act, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {act}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Leadership & Info */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Club Leadership
          </h4>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {fullClub.leadCoordinatorName ? (
              <span>Lead Coordinator: <strong className="text-slate-700 dark:text-slate-200">{fullClub.leadCoordinatorName}</strong></span>
            ) : (
              <span>Student Council & Faculty Mentor Committee</span>
            )}
          </p>
        </div>

        {/* Upcoming Club Events */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Upcoming Events by {fullClub.name}
          </h4>

          {fullClub.upcomingEvents && fullClub.upcomingEvents.length > 0 ? (
            <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
              {fullClub.upcomingEvents.map((ev) => {
                const startDate = new Date(ev.startDateTime);
                return (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <h5
                        onClick={() => {
                          onClose();
                          onOpenEventDetail && onOpenEventDetail(ev);
                        }}
                        className="cursor-pointer text-xs font-bold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400 truncate"
                      >
                        {ev.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-indigo-500" />
                          {startDate.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>{ev.online ? 'Online' : ev.venue}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenEventDetail && onOpenEventDetail(ev);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-xs italic text-slate-400 dark:text-slate-500">
              No upcoming events announced yet by this club.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
