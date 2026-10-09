import { useState, useCallback, useRef, useEffect } from 'react';
import { searchUsers } from '../services/chatApi.js';

/**
 * Modal dialog for starting a new 1-to-1 conversation.
 *
 * Features:
 * - Debounced user search (by name or email)
 * - User results with avatar, name, email, and role badge
 * - Loading, empty, and error states
 * - Closes on backdrop click or Escape
 *
 * @param {{ open: boolean, onClose: function, onSelectUser: function }} props
 */
export default function NewConversationDialog({ open, onClose, onSelectUser }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selecting, setSelecting] = useState(null); // userId being selected
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setError(null);
      setSelecting(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Debounced search
  const handleSearch = useCallback((value) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchUsers(value.trim());
        setResults(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleSelect = useCallback(async (user) => {
    setSelecting(user.id);
    try {
      await onSelectUser(user.id);
      onClose();
    } catch {
      setError('Failed to start conversation');
    } finally {
      setSelecting(null);
    }
  }, [onSelectUser, onClose]);

  if (!open) return null;

  const roleColors = {
    STUDENT: 'bg-blue-100 text-blue-700',
    TEACHER: 'bg-emerald-100 text-emerald-700',
    ADMIN: 'bg-amber-100 text-amber-700',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="New Conversation"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[fadeInUp_200ms_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">New Conversation</h2>
            <p className="text-xs text-slate-500 mt-0.5">Search for a classmate or teacher</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              id="user-search-input"
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Type a name or email…"
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              autoComplete="off"
            />
            {loading && (
              <svg className="w-4 h-4 text-indigo-500 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto" role="listbox" aria-label="Search results">
          {/* Error */}
          {error && (
            <div className="text-center py-6 px-5 text-sm text-red-500">{error}</div>
          )}

          {/* Empty state: no query */}
          {!loading && !error && query.trim().length < 2 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2 px-8 text-center">
              <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-xs text-slate-400">Type at least 2 characters to search</p>
            </div>
          )}

          {/* Empty state: no results */}
          {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
            <div className="text-center py-10 px-5">
              <p className="text-sm font-medium text-slate-600">No users found</p>
              <p className="text-xs text-slate-400 mt-1">Try a different name or email</p>
            </div>
          )}

          {/* User results */}
          {results.map((user) => (
            <button
              key={user.id}
              role="option"
              disabled={selecting === user.id}
              onClick={() => handleSelect(user)}
              className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 transition-colors border-b border-slate-50 last:border-b-0 disabled:opacity-60"
            >
              {/* Avatar */}
              <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-sm select-none overflow-hidden">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.name?.[0]?.toUpperCase() || '?'
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800 truncate">{user.name}</span>
                  {user.role && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleColors[user.role] || 'bg-slate-100 text-slate-600'}`}>
                      {user.role}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>

              {/* Arrow / spinner */}
              <div className="shrink-0">
                {selecting === user.id ? (
                  <svg className="w-4 h-4 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
