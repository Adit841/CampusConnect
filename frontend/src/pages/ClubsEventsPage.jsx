import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  Users,
  Search,
  Plus,
  Compass,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { focusRing } from '../components/ui/Card.jsx';
import { SkeletonList, EmptyState, ErrorState, Spinner } from '../components/ui/StateViews.jsx';

import CategoryDiscoveryStrip from '../components/clubs/CategoryDiscoveryStrip.jsx';
import FeaturedEventCard from '../components/clubs/FeaturedEventCard.jsx';
import EventCard from '../components/clubs/EventCard.jsx';
import EventAgendaTimeline from '../components/clubs/EventAgendaTimeline.jsx';
import ClubCard from '../components/clubs/ClubCard.jsx';
import ClubDetailModal from '../components/clubs/ClubDetailModal.jsx';
import EventDetailModal from '../components/clubs/EventDetailModal.jsx';
import MyActivitySection from '../components/clubs/MyActivitySection.jsx';
import AttendeeListModal from '../components/clubs/AttendeeListModal.jsx';
import CreateEventModal from '../components/clubs/CreateEventModal.jsx';
import CreateClubModal from '../components/clubs/CreateClubModal.jsx';

import {
  getClubsLandingSummary,
  getClubs,
  getUpcomingEvents,
  getPastEvents,
  joinClub,
  leaveClub,
  registerForEvent,
  cancelEventRegistration,
  getMyClubMemberships,
  getMyEventRegistrations,
} from '../services/clubsEventsApi.js';

export default function ClubsEventsPage() {
  const { user } = useAuth();

  // Navigation tab: 'discovery' | 'clubs' | 'events' | 'my_activity' | 'hub'
  const [activeTab, setActiveTab] = useState('discovery');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Events sub-tab: 'upcoming' | 'past'
  const [eventsSubTab, setEventsSubTab] = useState('upcoming');

  // Landing summary state
  const [landingSummary, setLandingSummary] = useState(null);
  const [landingLoading, setLandingLoading] = useState(true);
  const [landingError, setLandingError] = useState(null);

  // Directory lists state
  const [clubsList, setClubsList] = useState([]);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [clubsError, setClubsError] = useState(null);

  const [eventsList, setEventsList] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);

  // My activity state
  const [myMemberships, setMyMemberships] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Action mutation states
  const [registeringId, setRegisteringId] = useState(null);
  const [clubActionId, setClubActionId] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Modals state
  const [activeClubDetail, setActiveClubDetail] = useState(null);
  const [activeEventDetail, setActiveEventDetail] = useState(null);
  const [attendeeModalEventId, setAttendeeModalEventId] = useState(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Show temporary feedback toast
  const showToast = useCallback((message, tone = 'success') => {
    setFeedbackToast({ message, tone });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4000);
  }, []);

  // 1. Fetch Landing Summary
  const fetchLandingData = useCallback(async () => {
    setLandingLoading(true);
    setLandingError(null);
    try {
      const summary = await getClubsLandingSummary();
      setLandingSummary(summary);
    } catch (err) {
      console.error('Error fetching clubs & events landing summary', err);
      setLandingError('Unable to load campus discovery feed. Please check your network.');
    } finally {
      setLandingLoading(false);
    }
  }, []);

  // 2. Fetch User Personal Activity
  const fetchUserActivity = useCallback(async () => {
    if (!user) return;
    setActivityLoading(true);
    try {
      const [memberships, registrations] = await Promise.all([
        getMyClubMemberships().catch(() => []),
        getMyEventRegistrations().catch(() => []),
      ]);
      setMyMemberships(memberships);
      setMyRegistrations(registrations);
    } catch (err) {
      console.error('Error loading my activity', err);
    } finally {
      setActivityLoading(false);
    }
  }, [user]);

  // 3. Fetch Clubs Directory
  const fetchClubsData = useCallback(async () => {
    setClubsLoading(true);
    setClubsError(null);
    try {
      const data = await getClubs({
        search: debouncedSearch,
        category: selectedCategory,
        page: 0,
        size: 50,
      });
      setClubsList(data.content || []);
    } catch (err) {
      console.error('Error loading clubs directory', err);
      setClubsError('Could not load student clubs directory.');
    } finally {
      setClubsLoading(false);
    }
  }, [debouncedSearch, selectedCategory]);

  // 4. Fetch Events Directory
  const fetchEventsData = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const fetchFn = eventsSubTab === 'past' ? getPastEvents : getUpcomingEvents;
      const data = await fetchFn({
        search: debouncedSearch,
        category: selectedCategory,
        page: 0,
        size: 50,
      });
      setEventsList(data.content || []);
    } catch (err) {
      console.error('Error loading events directory', err);
      setEventsError('Could not load campus events.');
    } finally {
      setEventsLoading(false);
    }
  }, [eventsSubTab, debouncedSearch, selectedCategory]);

  // Initial load
  useEffect(() => {
    fetchLandingData();
    fetchUserActivity();
  }, [fetchLandingData, fetchUserActivity]);

  // Trigger directory queries on tab change
  useEffect(() => {
    if (activeTab === 'clubs') {
      fetchClubsData();
    } else if (activeTab === 'events') {
      fetchEventsData();
    } else if (activeTab === 'my_activity') {
      fetchUserActivity();
    }
  }, [activeTab, fetchClubsData, fetchEventsData, fetchUserActivity]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleRegister = async (eventId) => {
    setRegisteringId(eventId);
    try {
      await registerForEvent(eventId);
      showToast('Successfully registered for the event!');
      fetchLandingData();
      fetchUserActivity();
      if (activeTab === 'events') fetchEventsData();
    } catch (err) {
      console.error('Registration failed', err);
      showToast(err.response?.data?.message || 'Registration failed.', 'danger');
    } finally {
      setRegisteringId(null);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    try {
      await cancelEventRegistration(eventId);
      showToast('Registration cancelled.');
      fetchLandingData();
      fetchUserActivity();
      if (activeTab === 'events') fetchEventsData();
    } catch (err) {
      console.error('Failed to cancel registration', err);
      showToast(err.response?.data?.message || 'Could not cancel registration.', 'danger');
    }
  };

  const handleJoinClub = async (clubId) => {
    setClubActionId(clubId);
    try {
      await joinClub(clubId);
      showToast('Joined club successfully!');
      fetchLandingData();
      fetchUserActivity();
      if (activeTab === 'clubs') fetchClubsData();
      if (activeClubDetail && activeClubDetail.id === clubId) {
        setActiveClubDetail((prev) => ({ ...prev, userMembershipStatus: 'APPROVED' }));
      }
    } catch (err) {
      console.error('Failed to join club', err);
      showToast(err.response?.data?.message || 'Could not join club.', 'danger');
    } finally {
      setClubActionId(null);
    }
  };

  const handleLeaveClub = async (clubId) => {
    setClubActionId(clubId);
    try {
      await leaveClub(clubId);
      showToast('Left club.');
      fetchLandingData();
      fetchUserActivity();
      if (activeTab === 'clubs') fetchClubsData();
      if (activeClubDetail && activeClubDetail.id === clubId) {
        setActiveClubDetail((prev) => ({ ...prev, userMembershipStatus: null }));
      }
    } catch (err) {
      console.error('Failed to leave club', err);
      showToast(err.response?.data?.message || 'Could not leave club.', 'danger');
    } finally {
      setClubActionId(null);
    }
  };

  const isOrganizerOrAdmin = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl p-3.5 text-xs font-semibold shadow-lg transition-all ${
            feedbackToast.tone === 'danger'
              ? 'bg-rose-600 text-white shadow-rose-600/20'
              : 'bg-emerald-600 text-white shadow-emerald-600/20'
          }`}
        >
          {feedbackToast.tone === 'danger' ? (
            <AlertCircle className="size-4 shrink-0" />
          ) : (
            <CheckCircle2 className="size-4 shrink-0" />
          )}
          <span>{feedbackToast.message}</span>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="ml-2 rounded-lg p-1 hover:bg-white/20"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* ── Compact Editorial Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-md sm:p-8 dark:border-slate-800">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3 py-1 text-[11px] font-bold text-indigo-200">
              <Sparkles className="size-3 text-indigo-300" />
              <span>Campus Activities & Student Societies</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              Find your people. Make campus count.
            </h1>

            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Discover official student clubs, join technical and cultural initiatives, and
              participate in hackathons, sports championships, and creative arts.
            </p>

            {landingSummary && (
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-medium text-slate-300">
                <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1">
                  <Users className="size-3 text-indigo-300" />
                  <span>{landingSummary.totalClubs ?? landingSummary.totalActiveClubs ?? 18} Clubs</span>
                </span>
                <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1">
                  <Calendar className="size-3 text-indigo-300" />
                  <span>{landingSummary.totalUpcomingEvents ?? 12} Upcoming Events</span>
                </span>
              </div>
            )}
          </div>

          {/* Quick Hero Actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('clubs');
                setSelectedCategory('ALL');
              }}
              className={`inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-md transition-all hover:bg-slate-100 active:scale-98 ${focusRing}`}
            >
              <Users className="size-3.5 text-indigo-600" />
              <span>Explore Clubs</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('events');
                setSelectedCategory('ALL');
              }}
              className={`inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white shadow-xs backdrop-blur-sm transition-all hover:bg-white/20 active:scale-98 ${focusRing}`}
            >
              <Calendar className="size-3.5 text-indigo-300" />
              <span>Discover Events</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Main Navigation Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'discovery', label: 'Campus Feed', icon: Compass },
            { id: 'clubs', label: 'Clubs Directory', icon: Users },
            { id: 'events', label: 'Events Directory', icon: Calendar },
            { id: 'my_activity', label: 'My Activity', icon: CheckCircle2 },
            ...(isOrganizerOrAdmin ? [{ id: 'hub', label: 'Organizer Hub', icon: ShieldCheck }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Search and Admin Actions */}
        <div className="flex items-center gap-2.5">
          {(activeTab === 'clubs' || activeTab === 'events') && (
            <div className="relative flex-1 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'clubs' ? 'Search clubs by name...' : 'Search events by title...'
                }
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          )}

          {isOrganizerOrAdmin && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateEventOpen(true)}
                className={`inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-500 ${focusRing}`}
              >
                <Plus className="size-3.5" />
                <span>New Event</span>
              </button>

              {user?.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => setIsCreateClubOpen(true)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 ${focusRing}`}
                >
                  <Plus className="size-3.5" />
                  <span>New Club</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Category Discovery Strip (for feed, clubs & events) ────────────── */}
      {(activeTab === 'discovery' || activeTab === 'clubs' || activeTab === 'events') && (
        <CategoryDiscoveryStrip
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            if (activeTab === 'discovery') {
              // When user picks a category from feed, switch to events or clubs for deep discovery
              setActiveTab('events');
            }
          }}
          counts={landingSummary?.categoryClubCounts || landingSummary?.categoryCounts || {}}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. DISCOVERY FEED TAB                                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'discovery' && (
        <div className="space-y-10">
          {landingLoading ? (
            <div className="space-y-4">
              <div className="h-56 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              <SkeletonList rows={3} />
            </div>
          ) : landingError ? (
            <ErrorState title="Campus discovery feed error" message={landingError} onRetry={fetchLandingData} />
          ) : (
            <>
              {/* Featured Event Card */}
              {(landingSummary?.featuredEvents?.[0] || landingSummary?.featuredEvent) && (
                <div>
                  <FeaturedEventCard
                    event={landingSummary.featuredEvents?.[0] || landingSummary.featuredEvent}
                    onOpenDetail={setActiveEventDetail}
                    onRegister={handleRegister}
                    registeringId={registeringId}
                  />
                </div>
              )}

              {/* Two Column Section: This Week's Timeline & Popular Clubs */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Agenda Timeline (2 cols) */}
                <div className="space-y-4 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Upcoming This Week
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Chronological agenda of campus activities and club meetups.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('events')}
                      className={`inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 ${focusRing}`}
                    >
                      <span>View All Events</span>
                      <ArrowRight className="size-3" />
                    </button>
                  </div>

                  <EventAgendaTimeline
                    events={landingSummary?.upcomingThisWeek || []}
                    onOpenDetail={setActiveEventDetail}
                    onRegister={handleRegister}
                    registeringId={registeringId}
                  />
                </div>

                {/* Popular Clubs Discovery Column (1 col) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Popular Clubs
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Explore student-led communities.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('clubs')}
                      className={`inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 ${focusRing}`}
                    >
                      <span>Browse All</span>
                      <ArrowRight className="size-3" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(landingSummary?.popularClubs || []).slice(0, 4).map((club) => (
                      <div
                        key={club.id}
                        onClick={() => setActiveClubDetail(club)}
                        className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 transition-all hover:border-slate-300 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                      >
                        <div className="min-w-0 space-y-1">
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {club.category?.replace('_', ' ')}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 truncate">
                            {club.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {club.tagline || `${club.memberCount || 0} members`}
                          </p>
                        </div>
                        <ArrowRight className="size-4 text-slate-400 group-hover:text-indigo-600 dark:text-slate-500 dark:group-hover:text-indigo-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. CLUBS DIRECTORY TAB                                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'clubs' && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Student Clubs & Chapters
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Join a student organization to network, develop skills, and collaborate on projects.
              </p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Showing {clubsList.length} clubs
            </span>
          </div>

          {clubsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : clubsError ? (
            <ErrorState title="Clubs directory error" message={clubsError} onRetry={fetchClubsData} />
          ) : clubsList.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No clubs found"
              description="No clubs match your selected filters. Try choosing a different category or clearing the search."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {clubsList.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onOpenDetail={setActiveClubDetail}
                  onJoin={handleJoinClub}
                  onLeave={handleLeaveClub}
                  isActionLoading={clubActionId === club.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. EVENTS DIRECTORY TAB                                             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Sub-tabs: Upcoming vs Past */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEventsSubTab('upcoming')}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  eventsSubTab === 'upcoming'
                    ? 'bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                Upcoming Events
              </button>
              <button
                type="button"
                onClick={() => setEventsSubTab('past')}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  eventsSubTab === 'past'
                    ? 'bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                Past Events Archive
              </button>
            </div>

            <span className="text-xs text-slate-400 dark:text-slate-500">
              {eventsList.length} {eventsSubTab === 'upcoming' ? 'upcoming' : 'archived'} events
            </span>
          </div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : eventsError ? (
            <ErrorState title="Events directory error" message={eventsError} onRetry={fetchEventsData} />
          ) : eventsList.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={`No ${eventsSubTab} events found`}
              description="No campus events match the selected category or search filters."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {eventsList.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onOpenDetail={setActiveEventDetail}
                  onRegister={handleRegister}
                  onCancel={handleCancelRegistration}
                  registeringId={registeringId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. MY ACTIVITY TAB                                                  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'my_activity' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              My Campus Life & Registrations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your confirmed event registrations and memberships in student organizations.
            </p>
          </div>

          <MyActivitySection
            registrations={myRegistrations}
            memberships={myMemberships}
            onOpenEventDetail={setActiveEventDetail}
            onOpenClubDetail={setActiveClubDetail}
            onCancelRegistration={handleCancelRegistration}
            onLeaveClub={handleLeaveClub}
            onExploreClubs={() => setActiveTab('clubs')}
            onExploreEvents={() => setActiveTab('events')}
            loading={activityLoading}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. ORGANIZER & ADMIN HUB TAB                                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'hub' && isOrganizerOrAdmin && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Organizer & Admin Management Hub
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage campus events, publish schedules, review attendance rosters, and maintain clubs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateEventOpen(true)}
                className={`inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 ${focusRing}`}
              >
                <Plus className="size-3.5" />
                <span>Create Event</span>
              </button>

              {user?.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => setIsCreateClubOpen(true)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 ${focusRing}`}
                >
                  <Plus className="size-3.5" />
                  <span>Register Club</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats / Overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Active Campus Clubs
              </span>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                {landingSummary?.totalClubs ?? 18}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Upcoming Events Scheduled
              </span>
              <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {landingSummary?.totalUpcomingEvents || 12}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Your Organizer Role
              </span>
              <p className="mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Faculty / Coordinator'}
              </p>
            </div>
          </div>

          {/* Recent Events Table for Quick Management */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              All Campus Events Roster
            </h3>
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
              {(landingSummary?.upcomingThisWeek || []).map((ev) => (
                <div
                  key={ev.id}
                  className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {ev.category?.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {ev.clubName || 'General Campus'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {ev.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Capacity: {ev.registeredCount} / {ev.capacity || '∞'} registered
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAttendeeModalEventId(ev.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 ${focusRing}`}
                    >
                      <Users className="size-3.5 text-indigo-500" />
                      <span>View Attendees ({ev.registeredCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEventDetail(ev)}
                      className={`rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 ${focusRing}`}
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modals & Dialogs ───────────────────────────────────────────────── */}
      {/* Club Detail Modal */}
      <ClubDetailModal
        club={activeClubDetail}
        open={Boolean(activeClubDetail)}
        onClose={() => setActiveClubDetail(null)}
        onJoin={handleJoinClub}
        onLeave={handleLeaveClub}
        isActionLoading={clubActionId === activeClubDetail?.id}
        onOpenEventDetail={(ev) => {
          setActiveClubDetail(null);
          setActiveEventDetail(ev);
        }}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        event={activeEventDetail}
        open={Boolean(activeEventDetail)}
        onClose={() => setActiveEventDetail(null)}
        onRegister={handleRegister}
        onCancel={handleCancelRegistration}
        registeringId={registeringId}
        user={user}
        onOpenAttendees={(eventId) => setAttendeeModalEventId(eventId)}
      />

      {/* Attendee List Modal (for organizers) */}
      <AttendeeListModal
        eventId={attendeeModalEventId}
        open={Boolean(attendeeModalEventId)}
        onClose={() => setAttendeeModalEventId(null)}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        open={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        clubs={clubsList.length > 0 ? clubsList : landingSummary?.popularClubs || []}
        onEventCreated={() => {
          showToast('New event published successfully!');
          fetchLandingData();
          if (activeTab === 'events') fetchEventsData();
        }}
      />

      {/* Create Club Modal */}
      <CreateClubModal
        open={isCreateClubOpen}
        onClose={() => setIsCreateClubOpen(false)}
        onClubCreated={() => {
          showToast('New campus club registered successfully!');
          fetchLandingData();
          if (activeTab === 'clubs') fetchClubsData();
        }}
      />
    </div>
  );
}
