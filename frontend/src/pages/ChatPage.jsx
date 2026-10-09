import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { Users, MessagesSquare, Plus, Sparkles, AlertCircle } from 'lucide-react';
import ConversationList from '../components/ConversationList.jsx';
import MessagePane from '../components/MessagePane.jsx';
import NewConversationDialog from '../components/NewConversationDialog.jsx';
import DevAuthModal from '../components/dev/DevAuthModal.jsx';
import CommunityFeed from '../components/community/CommunityFeed.jsx';
import { useConversations } from '../hooks/useConversations.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, focusRing } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';

/**
 * /chat — Campus Community & Communication Hub.
 *
 * Combines:
 * 1. Campus Community & Feedback Hub (public discussions, facility feedback with status tracking, study circles)
 * 2. Direct Messages (private 1-to-1 conversations between students and faculty)
 */
export default function ChatPage() {
  const { currentUser, token, isDemo } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') === 'messages' ? 'messages' : 'community';

  const { conversations, loading, error, reload, startConversation, updateLastMessage } = useConversations();
  const [activeConversation, setActiveConversation] = useState(null);
  const [showPane, setShowPane] = useState(false); // mobile nav state for DM
  const [dialogOpen, setDialogOpen] = useState(false);
  const [devAuthOpen, setDevAuthOpen] = useState(false);

  const handleTabChange = (tabKey) => {
    setSearchParams(tabKey === 'messages' ? { tab: 'messages' } : {});
  };

  const handleSelect = (conv) => {
    setActiveConversation(conv);
    setShowPane(true);
  };

  const handleBack = () => {
    setShowPane(false);
  };

  const handleNewConversation = useCallback(
    async (targetUserId) => {
      const conv = await startConversation(targetUserId);
      setActiveConversation(conv);
      setShowPane(true);
    },
    [startConversation]
  );

  // ── Not logged in state ───────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
          <MessagesSquare className="size-8 text-indigo-500" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          Sign in to access Community &amp; Chat
        </h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Join campus discussions, submit facility suggestions, and message classmates and faculty.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Campus Community &amp; Chat
            </h1>
            <Badge tone="accent">Hub</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Share ideas, track campus facility feedback, and collaborate directly with classmates.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => handleTabChange('community')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${focusRing} ${
              currentTab === 'community'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <Users className="size-4" />
            <span>Campus Community</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('messages')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${focusRing} ${
              currentTab === 'messages'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <MessagesSquare className="size-4" />
            <span>Direct Messages</span>
            {conversations?.length > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  currentTab === 'messages'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {conversations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Community Tab View ───────────────────────────────────────────── */}
      {currentTab === 'community' && (
        <CommunityFeed currentUser={currentUser} />
      )}

      {/* ── Direct Messages Tab View ─────────────────────────────────────── */}
      {currentTab === 'messages' && (
        <div className="flex flex-col">
          {/* Dev authentication banner for real DB chat */}
          {import.meta.env.DEV && !token && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-400 shrink-0" />
                <span>
                  <strong>Dev Notice:</strong> In demo mode. Real private chat requires a database account.
                </span>
              </span>
              <button
                type="button"
                onClick={() => setDevAuthOpen(true)}
                className="shrink-0 rounded bg-amber-600 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-amber-700"
              >
                Sign In with DB
              </button>
            </div>
          )}

          {import.meta.env.DEV && token && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                <span>
                  Authenticated as <strong>{currentUser?.name}</strong> ({currentUser?.email})
                </span>
              </span>
              <button
                type="button"
                onClick={() => setDevAuthOpen(true)}
                className="text-[11px] font-medium text-emerald-700 underline hover:text-emerald-900 dark:text-emerald-400"
              >
                Switch User
              </button>
            </div>
          )}

          {/* Chat Container Card */}
          <Card className="h-[calc(100vh-280px)] min-h-[520px] overflow-hidden">
            <div className="flex h-full min-h-0 overflow-hidden">
              {/* Sidebar */}
              <div
                className={[
                  'w-full shrink-0 border-r border-slate-200 md:w-80 lg:w-96 dark:border-slate-800 flex flex-col relative',
                  showPane ? 'hidden md:flex' : 'flex',
                ].join(' ')}
              >
                <ConversationList
                  conversations={conversations}
                  loading={loading}
                  error={error}
                  activeId={activeConversation?.id}
                  onSelect={handleSelect}
                  onRetry={reload}
                />

                <button
                  id="new-chat-btn"
                  onClick={() => setDialogOpen(true)}
                  aria-label="New conversation"
                  className="absolute bottom-5 right-5 flex size-11 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-95 z-10"
                >
                  <Plus className="size-5" />
                </button>
              </div>

              {/* Message Pane */}
              <div
                className={[
                  'flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-900/50',
                  !showPane ? 'hidden md:flex' : 'flex',
                ].join(' ')}
              >
                {showPane && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-indigo-600 md:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-indigo-400"
                    aria-label="Back to conversations"
                  >
                    ← Back to conversations
                  </button>
                )}

                <MessagePane
                  conversation={activeConversation}
                  onMessageActivity={updateLastMessage}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}
      <NewConversationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelectUser={handleNewConversation}
      />

      <DevAuthModal
        open={devAuthOpen}
        onClose={() => setDevAuthOpen(false)}
      />
    </div>
  );
}
