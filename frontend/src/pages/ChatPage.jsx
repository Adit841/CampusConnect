import { useState, useCallback } from 'react';
import ConversationList from '../components/ConversationList.jsx';
import MessagePane from '../components/MessagePane.jsx';
import NewConversationDialog from '../components/NewConversationDialog.jsx';
import DevAuthModal from '../components/dev/DevAuthModal.jsx';
import { useConversations } from '../hooks/useConversations.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * /chat — main chat page.
 *
 * Layout: sidebar (conversation list) | main area (message pane).
 * On mobile: tapping a conversation slides to the message pane.
 */
export default function ChatPage() {
  const { currentUser, token, isDemo } = useAuth();
  const { conversations, loading, error, reload, startConversation, updateLastMessage } = useConversations();
  const [activeConversation, setActiveConversation] = useState(null);
  const [showPane, setShowPane] = useState(false); // mobile nav state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [devAuthOpen, setDevAuthOpen] = useState(false);

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-lg">Sign in to use Chat</p>
          <p className="text-sm text-slate-500 mt-1 max-w-xs">
            You need to be signed in to view and send messages.
          </p>
        </div>
      </div>
    );
  }

  const handleSelect = (conv) => {
    setActiveConversation(conv);
    setShowPane(true);
  };

  const handleBack = () => {
    setShowPane(false);
  };

  // Called when a user is selected in the new-conversation dialog
  const handleNewConversation = useCallback(async (targetUserId) => {
    const conv = await startConversation(targetUserId);
    setActiveConversation(conv);
    setShowPane(true);
  }, [startConversation]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* ── Dev-only Database Authentication Banner ─────────────────────── */}
      {import.meta.env.DEV && !token && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
            <span><strong>Dev Notice:</strong> Currently in demo mode (no JWT). Real chat requires a database account.</span>
          </span>
          <button
            type="button"
            onClick={() => setDevAuthOpen(true)}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded text-[11px] transition-colors shrink-0 ml-2"
          >
            Sign In / Register with DB
          </button>
        </div>
      )}
      {import.meta.env.DEV && token && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 text-xs text-emerald-800 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Authenticated as <strong>{currentUser?.name}</strong> ({currentUser?.email})</span>
          </span>
          <button
            type="button"
            onClick={() => setDevAuthOpen(true)}
            className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-medium shrink-0 ml-2"
          >
            Switch User
          </button>
        </div>
      )}

      {/* ── Chat Container ──────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div className={[
          'w-full md:w-80 lg:w-96 shrink-0 flex flex-col relative',
          // Mobile: hide sidebar when message pane is shown
          showPane ? 'hidden md:flex' : 'flex',
        ].join(' ')}>
          <ConversationList
            conversations={conversations}
            loading={loading}
            error={error}
            activeId={activeConversation?.id}
            onSelect={handleSelect}
            onRetry={reload}
          />

          {/* New Chat floating button */}
          <button
            id="new-chat-btn"
            onClick={() => setDialogOpen(true)}
            aria-label="New conversation"
            className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center z-10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        {/* ── Message pane ────────────────────────────────────────────────── */}
        <div className={[
          'flex-1 flex flex-col min-w-0',
          // Mobile: only show pane when a conversation is selected
          !showPane ? 'hidden md:flex' : 'flex',
        ].join(' ')}>
          {/* Mobile back button */}
          {showPane && (
            <button
              onClick={handleBack}
              className="md:hidden flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 font-medium border-b border-slate-200 bg-white hover:bg-slate-50"
              aria-label="Back to conversations"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}

          <MessagePane
            conversation={activeConversation}
            onMessageActivity={updateLastMessage}
          />
        </div>
      </div>

      {/* ── New Conversation Dialog ─────────────────────────────────────── */}
      <NewConversationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelectUser={handleNewConversation}
      />

      {/* ── Dev Database Auth Modal ─────────────────────────────────────── */}
      <DevAuthModal
        open={devAuthOpen}
        onClose={() => setDevAuthOpen(false)}
      />
    </div>
  );
}

