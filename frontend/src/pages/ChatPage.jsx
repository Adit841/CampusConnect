import { useState } from 'react';
import ConversationList from '../components/ConversationList.jsx';
import MessagePane from '../components/MessagePane.jsx';
import { useConversations } from '../hooks/useConversations.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * /chat — main chat page.
 *
 * Layout: sidebar (conversation list) | main area (message pane).
 * On mobile: tapping a conversation slides to the message pane.
 */
export default function ChatPage() {
  const { currentUser } = useAuth();
  const { conversations, loading, error, reload } = useConversations();
  const [activeConversation, setActiveConversation] = useState(null);
  const [showPane, setShowPane] = useState(false); // mobile nav state

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

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className={[
        'w-full md:w-80 lg:w-96 shrink-0 flex flex-col',
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

        <MessagePane conversation={activeConversation} />
      </div>
    </div>
  );
}
