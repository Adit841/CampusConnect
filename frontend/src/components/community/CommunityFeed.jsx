import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  Filter,
} from 'lucide-react';
import PostCard from './PostCard.jsx';
import CreatePostModal from './CreatePostModal.jsx';
import PostDetailModal from './PostDetailModal.jsx';
import {
  communityService,
  CATEGORIES,
} from '../../services/communityService.js';
import { Card, focusRing } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { EmptyState } from '../ui/StateViews.jsx';

export default function CommunityFeed({ currentUser }) {
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('trending'); // 'trending' | 'recent'
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load posts
  const posts = useMemo(() => {
    // refreshTrigger is used as a dependency to force re-computation
    void refreshTrigger;
    return communityService.getPosts({ category, sort, search });
  }, [category, sort, search, refreshTrigger]);

  const handleCreatePost = (newPostData) => {
    communityService.createPost(newPostData);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleUpvote = (postId) => {
    communityService.toggleUpvote(postId, currentUser?.id);
    setRefreshTrigger((prev) => prev + 1);
    if (selectedPost && selectedPost.id === postId) {
      const updated = communityService.getPosts().find((p) => p.id === postId);
      setSelectedPost(updated);
    }
  };

  const handleStatusChange = (postId, newStatus) => {
    communityService.updateStatus(postId, newStatus);
    setRefreshTrigger((prev) => prev + 1);
    if (selectedPost && selectedPost.id === postId) {
      const updated = communityService.getPosts().find((p) => p.id === postId);
      setSelectedPost(updated);
    }
  };

  const handleAddComment = (postId, commentPayload) => {
    const res = communityService.addComment(postId, commentPayload);
    setRefreshTrigger((prev) => prev + 1);
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(res.target);
    }
  };

  const handleReport = (postId) => {
    communityService.reportPost(postId, currentUser?.id);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* ── Community Hub Intro Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 p-5 dark:border-indigo-950/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <Sparkles className="size-4" />
              </span>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
                Campus Community &amp; Feedback Hub
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 sm:text-sm leading-relaxed">
              Discover campus ideas, connect with classmates for study circles, and suggest improvements
              to cafeteria, facilities, and campus services with transparent status tracking.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition-all ${focusRing}`}
          >
            <Plus className="size-4" />
            <span>Create Post / Suggestion</span>
          </button>
        </div>

        {/* Status Transparency Quick Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-indigo-100/60 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">Suggestion Statuses:</span>
          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
            <span className="size-2 rounded-full bg-amber-400" /> Submitted (Awaiting inspection)
          </span>
          <span className="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-400">
            <span className="size-2 rounded-full bg-indigo-500" /> Under Review (Faculty/Council active)
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500" /> Resolved (Completed)
          </span>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions, cafeteria feedback, study groups..."
            className={`w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${focusRing}`}
          />
        </div>

        {/* Sort Tabs */}
        <div className="flex items-center gap-1 self-start rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setSort('trending')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              sort === 'trending'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Flame className="size-3.5" />
            <span>Trending</span>
          </button>
          <button
            type="button"
            onClick={() => setSort('recent')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              sort === 'recent'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="size-3.5" />
            <span>Most Recent</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${focusRing} ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs dark:bg-indigo-600'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              {cat.id === 'facilities' && (
                <span className="size-1.5 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Feed Stream ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <EmptyState
              icon={Sparkles}
              title="No posts found in this section"
              description={
                search
                  ? `No community discussions matched "${search}". Try another keyword or create a new post.`
                  : 'Be the first to start a campus conversation, share an event, or report a facility issue!'
              }
            />
            <div className="pb-6 text-center">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className={`inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 ${focusRing}`}
              >
                <Plus className="size-3.5" />
                <span>Create New Post</span>
              </button>
            </div>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              userRole={currentUser?.role}
              onUpvote={handleUpvote}
              onOpenDetails={setSelectedPost}
              onStatusChange={handleStatusChange}
              onReport={handleReport}
            />
          ))
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <CreatePostModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreatePost}
        currentUser={currentUser}
      />

      <PostDetailModal
        open={!!selectedPost}
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        currentUser={currentUser}
        onUpvote={handleUpvote}
        onAddComment={handleAddComment}
        onStatusChange={handleStatusChange}
        onReport={handleReport}
      />
    </div>
  );
}
