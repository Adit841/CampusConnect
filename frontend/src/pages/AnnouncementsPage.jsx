import { useCallback, useEffect, useMemo, useState } from 'react';
import { Megaphone, Plus, Pin, AlertCircle, RefreshCw, Bell, Layers, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, focusRing } from '../components/ui/Card.jsx';
import { DataSourceBadge } from '../components/ui/Badge.jsx';
import { SkeletonList, EmptyState, ErrorState } from '../components/ui/StateViews.jsx';
import AnnouncementCard from '../components/announcements/AnnouncementCard.jsx';
import AnnouncementFilters from '../components/announcements/AnnouncementFilters.jsx';
import AnnouncementDialog from '../components/announcements/AnnouncementDialog.jsx';
import DeleteConfirmDialog from '../components/announcements/DeleteConfirmDialog.jsx';
import AnnouncementDetailModal from '../components/announcements/AnnouncementDetailModal.jsx';
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  AUDIENCE_OPTIONS,
} from '../services/announcementService.js';

export function AnnouncementsPage() {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';
  const canCreate = role === 'TEACHER' || role === 'ADMIN';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('api');

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [audienceFilter, setAudienceFilter] = useState('ALL');

  // Dialog & Modal states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Success alert toast banner
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAnnouncements({
        category: category !== 'ALL' ? category : undefined,
        search: search.trim() || undefined,
      });
      setAnnouncements(res.data || []);
      setSource(res.source || 'api');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side audience filtering
  const visibleAnnouncements = useMemo(() => {
    let list = announcements;
    if (audienceFilter !== 'ALL') {
      list = list.filter((a) => {
        const aud = (a.audience || '').toUpperCase();
        const filterUpper = audienceFilter.toUpperCase();
        return aud === filterUpper || a.department === audienceFilter;
      });
    }
    return list;
  }, [announcements, audienceFilter]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = announcements.length;
    const pinned = announcements.filter((a) => a.pinned).length;
    const urgent = announcements.filter((a) => (a.category || '').toUpperCase() === 'URGENT').length;
    const academic = announcements.filter((a) =>
      ['ACADEMIC', 'EXAM'].includes((a.category || '').toUpperCase())
    ).length;
    return { total, pinned, urgent, academic };
  }, [announcements]);

  // Create or Update handler
  const handleDialogSubmit = async (payload) => {
    setDialogSubmitting(true);
    setDialogError(null);
    try {
      if (editingData?.id) {
        await updateAnnouncement(editingData.id, payload);
        showToast('Announcement updated successfully.');
      } else {
        await createAnnouncement(payload);
        showToast('Announcement published successfully.');
      }
      setDialogOpen(false);
      setEditingData(null);
      await loadData();
    } catch (err) {
      setDialogError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          'Failed to save announcement. Please check your permissions.'
      );
    } finally {
      setDialogSubmitting(false);
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!deletingAnnouncement) return;
    setDeleteSubmitting(true);
    try {
      await deleteAnnouncement(deletingAnnouncement.id);
      showToast('Announcement deleted successfully.');
      setDeleteDialogOpen(false);
      setDeletingAnnouncement(null);
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete announcement');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingData(null);
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (announcement) => {
    setEditingData(announcement);
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleOpenDelete = (announcement) => {
    setDeletingAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const handleOpenDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 transition-all"
        >
          <CheckCircle className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Announcements &amp; Notices
            </h1>
            <DataSourceBadge source={source} />
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Official university bulletins, department circulars, examination alerts, and campus news.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            title="Refresh announcements"
            className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${focusRing}`}
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className={`inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 ${focusRing}`}
            >
              <Plus className="size-4" />
              Post Announcement
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Layers className="size-3.5 text-indigo-500" />
            Total Notices
          </div>
          <p className="mt-1.5 text-xl font-semibold text-slate-900 dark:text-slate-100">{stats.total}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Pin className="size-3.5 text-amber-500" />
            Pinned Notices
          </div>
          <p className="mt-1.5 text-xl font-semibold text-amber-600 dark:text-amber-400">{stats.pinned}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <AlertCircle className="size-3.5 text-rose-500" />
            Urgent Alerts
          </div>
          <p className="mt-1.5 text-xl font-semibold text-rose-600 dark:text-rose-400">{stats.urgent}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Bell className="size-3.5 text-emerald-500" />
            Academic &amp; Exams
          </div>
          <p className="mt-1.5 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{stats.academic}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <AnnouncementFilters
        search={search}
        onSearchChange={setSearch}
        selectedCategory={category}
        onCategoryChange={setCategory}
        selectedAudience={audienceFilter}
        onAudienceChange={setAudienceFilter}
        audienceOptions={AUDIENCE_OPTIONS}
        totalCount={announcements.length}
        filteredCount={visibleAnnouncements.length}
        onReset={() => {
          setSearch('');
          setCategory('ALL');
          setAudienceFilter('ALL');
        }}
      />

      {/* Main Content Feed */}
      <div>
        {loading ? (
          <Card>
            <SkeletonList rows={5} />
          </Card>
        ) : error ? (
          <Card>
            <ErrorState title="Unable to load announcements" message={error} onRetry={loadData} />
          </Card>
        ) : visibleAnnouncements.length === 0 ? (
          <Card>
            <EmptyState
              icon={Megaphone}
              title="No announcements found"
              description={
                search || category !== 'ALL' || audienceFilter !== 'ALL'
                  ? 'No notices match your current filters. Try resetting or adjusting your search query.'
                  : 'There are no announcements posted for your audience at this time.'
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                currentUser={user}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onViewDetails={handleOpenDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs & Modals */}
      <AnnouncementDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingData(null);
        }}
        onSubmit={handleDialogSubmit}
        initialData={editingData}
        isSubmitting={dialogSubmitting}
        apiError={dialogError}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingAnnouncement(null);
        }}
        onConfirm={handleDeleteConfirm}
        announcementTitle={deletingAnnouncement?.title}
        isDeleting={deleteSubmitting}
      />

      <AnnouncementDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        announcement={selectedAnnouncement}
        currentUser={user}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />
    </div>
  );
}

export default AnnouncementsPage;
