import { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext — placeholder for the chat module (ayushman-feature).
 *
 * TODO (Aman – auth module): Replace this placeholder with the real
 * AuthContext from the auth/profile module.  The chat module depends on:
 *   - `currentUser.username`  — must match the Spring Security principal name
 *   - `currentUser.id`        — used to distinguish own vs other messages in the UI
 *   - `currentUser.displayName` — shown in the message composer
 *   - `token`                 — Bearer token for the Authorization header
 *
 * For development, username is read from localStorage ('cc_username').
 * Set it via the browser console: localStorage.setItem('cc_username', 'yourname')
 * then refresh the page.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || localStorage.getItem('cc_token');
    const storedUserJson = localStorage.getItem('user');

    if (storedUserJson) {
      try {
        const u = JSON.parse(storedUserJson);
        setCurrentUser({
          id: u.id,
          email: u.email,
          username: u.email,
          name: u.name || u.displayName,
          displayName: u.name || u.displayName,
          role: u.role,
        });
        setToken(storedToken || null);
        return;
      } catch {
        // Fall back to legacy individual keys
      }
    }

    const storedUsername = localStorage.getItem('cc_username') || localStorage.getItem('cc_email');
    if (storedUsername) {
      setCurrentUser({
        id: localStorage.getItem('cc_userId') ? Number(localStorage.getItem('cc_userId')) : null,
        email: storedUsername,
        username: storedUsername,
        name: localStorage.getItem('cc_displayName') || storedUsername,
        displayName: localStorage.getItem('cc_displayName') || storedUsername,
      });
      setToken(storedToken || null);
    }
  }, []);

  const login = (authData) => {
    if (authData.token) {
      localStorage.setItem('token', authData.token);
      localStorage.setItem('cc_token', authData.token);
      setToken(authData.token);
    }
    const u = authData.user || authData;
    const userObj = {
      id: u.id != null ? Number(u.id) : null,
      email: u.email || u.username,
      username: u.email || u.username,
      name: u.name || u.displayName || u.username,
      displayName: u.name || u.displayName || u.username,
      role: u.role,
    };
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('cc_username', userObj.username);
    localStorage.setItem('cc_displayName', userObj.displayName);
    if (userObj.id != null) localStorage.setItem('cc_userId', String(userObj.id));
    setCurrentUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cc_username');
    localStorage.removeItem('cc_displayName');
    localStorage.removeItem('cc_userId');
    localStorage.removeItem('cc_token');
    setCurrentUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
