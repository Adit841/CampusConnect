import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { Badge } from '../ui/Badge.jsx';
import { focusRing } from '../ui/Card.jsx';
import { getEventBySlug } from '../../services/clubsEventsApi.js';

export default function EventDetailModal({
  event,
  open,
  onClose,
  onRegister,
  onCancel,
  registeringId,
  user,
  onOpenAttendees,
}) {
  const [fullEvent, setFullEvent] = useState(event);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !event?.slug) {
      setFullEvent(event);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getEventBySlug(event.slug)
      .then((data) => {
        if (!cancelled) setFullEvent(data);
      })
      .catch((err) => {
        console.error('Error fetching full event details', err);
        if (!cancelled) setFullEvent(event);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, event]);

  if (!fullEvent) return null;

  const startDate = new Date(fullEvent.startDateTime);
  const endDate = fullEvent.endDateTime ? new Date(fullEvent.endDateTime) : null;
  const deadlineDate = fullEvent.registrationDeadline
    ? new Date(fullEvent.registrationDeadline)
    : null;

  const now = new Date();
  const isDeadlinePassed = deadlineDate && now > deadlineDate;
  const isClosingSoon =
    deadlineDate && !isDeadlinePassed && deadlineDate.getTime() - now.getTime() < 86400000; // < 24h

  const isFull = fullEvent.capacity != null && fullEvent.registeredCount >= fullEvent.capacity;
  const remainingSpots =
    fullEvent.capacity != null ? Math.max(0, fullEvent.capacity - fullEvent.registeredCount) : null;

  const isRegistering = registeringId === fullEvent.id;

  const isOrganizer =
    user?.role === 'ADMIN' ||
    (fullEvent.organizerId != null && user?.id === fullEvent.organizerId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="truncate">{fullEvent.title}</span>
          {fullEvent.sampleData && (
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
              Sample Data
            </span>
          )}
        </div>
      }
      description={
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {fullEvent.category?.replace('_', ' ')}
          </span>
          {fullEvent.clubName && (
            <>
              <span>•</span>
              <span className="text-slate-500 dark:text-slate-400">
                Organized by {fullEvent.clubName}
              </span>
            </>
          )}
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

          <div className="flex items-center gap-2">
            {isOrganizer && onOpenAttendees && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAttendees(fullEvent.id);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${focusRing}`}
              >
                <ShieldCheck className="size-3.5 text-indigo-500" />
                <span>Attendees ({fullEvent.registeredCount})</span>
              </button>
            )}

            {fullEvent.userRegistered ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                  <CheckCircle2 className="size-3.5" />
                  Registered
                </span>
                {onCancel && (
                  <button
                    type="button"
                    onClick={() => onCancel(fullEvent.id)}
                    className={`rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300 ${focusRing}`}
                  >
                    Cancel Registration
                  </button>
                )}
              </div>
            ) : fullEvent.status === 'CANCELLED' ? (
              <Badge tone="danger">Event Cancelled</Badge>
            ) : fullEvent.status === 'COMPLETED' ? (
              <Badge tone="neutral">Event Completed</Badge>
            ) : isDeadlinePassed ? (
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Registration Closed
              </span>
            ) : isFull ? (
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Capacity Full
              </span>
            ) : onRegister ? (
              <button
                type="button"
                onClick={() => onRegister(fullEvent.id)}
                disabled={isRegistering}
                className={`inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-500 active:scale-98 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400 ${focusRing}`}
              >
                <span>{isRegistering ? 'Registering…' : 'Register for Event'}</span>
                <ArrowRight className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status notice banner */}
        {isClosingSoon && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
            <AlertCircle className="size-4 shrink-0 text-amber-600" />
            <span>Registration closes in less than 24 hours. Reserve your spot now.</span>
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            About this Event
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {fullEvent.description}
          </p>
        </div>

        {/* Key Event Details Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Date & Time */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Calendar className="size-3.5 text-indigo-500" />
              <span>Schedule</span>
            </div>
            <p className="mt-1 text-xs text-slate-800 dark:text-slate-200 font-semibold">
              {startDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {startDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              {endDate &&
                ` – ${endDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`}
            </p>
          </div>

          {/* Location */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              {fullEvent.online ? (
                <>
                  <Video className="size-3.5 text-emerald-500" />
                  <span>Online Session</span>
                </>
              ) : (
                <>
                  <MapPin className="size-3.5 text-amber-500" />
                  <span>Campus Venue</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-800 dark:text-slate-200 font-semibold">
              {fullEvent.online ? 'Virtual Meeting' : fullEvent.venue || 'Campus Auditorium'}
            </p>
            {fullEvent.online && fullEvent.meetingUrl && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate">
                {fullEvent.meetingUrl}
              </p>
            )}
          </div>

          {/* Capacity */}
          {fullEvent.capacity != null && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Users className="size-3.5 text-indigo-500" />
                <span>Attendance Capacity</span>
              </div>
              <p className="mt-1 text-xs text-slate-800 dark:text-slate-200 font-semibold">
                {fullEvent.registeredCount} / {fullEvent.capacity} spots filled
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {remainingSpots > 0 ? `${remainingSpots} seats remaining` : 'At maximum capacity'}
              </p>
            </div>
          )}

          {/* Registration Deadline */}
          {deadlineDate && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Clock className="size-3.5 text-slate-500" />
                <span>Registration Closes</span>
              </div>
              <p className="mt-1 text-xs text-slate-800 dark:text-slate-200 font-semibold">
                {deadlineDate.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {deadlineDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
