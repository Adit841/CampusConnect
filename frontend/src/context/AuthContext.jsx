import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_STORAGE_KEY } from '../services/api.js';
import { getErrorMessage, getMyProfile } from '../services/profileService.js';
import { demoUsers } from '../data/mockDashboardData.js';

export const ROLES = ['STUDENT', 'TEACHER', 'ADMIN'];

const DEMO_AVAILABLE = import.meta.env.DEV;
const DEMO_ROLE_KEY = 'cc-demo-role';
const DEMO_ACTIVE_KEY = 'cc-demo-active';

const AuthContext = createContext(null);

function toUser(profile) {
  if (!profile) return null;
  const academic = profile.studentProfile || profile.teacherProfile || {};

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    username: profile.email || profile.username,
    displayName: profile.name || profile.displayName || profile.email,
    role: profile.role,
    profileImage: profile.profileImage || null,
    department: academic.department || profile.department || null,
    studentProfile: profile.studentProfile || null,
    teacherProfile: profile.teacherProfile || null,
  };
}

function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readDemoRole() {
  try {
    const saved = sessionStorage.getItem(DEMO_ROLE_KEY);
    return ROLES.includes(saved) ? saved : 'STUDENT';
  } catch {
    return 'STUDENT';
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readStoredToken);
  const [sessionUser, setSessionUser] = useState(null);
  const [profileStatus, setProfileStatus] = useState(() => (readStoredToken() ? 'loading' : 'idle'));
  const [profileError, setProfileError] = useState(null);
  const [isDemoActive, setIsDemoActive] = useState(() => {
    try {
      // In dev mode, activate demo only if explicitly enabled and no real token exists
      return !readStoredToken() && sessionStorage.getItem(DEMO_ACTIVE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [demoRole, setDemoRoleState] = useState(readDemoRole);

  const refreshProfile = useCallback(async () => {
    setProfileStatus('loading');
    setProfileError(null);

    try {
      const profile = await getMyProfile();
      setSessionUser(toUser(profile));
      setProfileStatus('ready');
    } catch (error) {
      if (error?.response?.status === 401) {
        try {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch {
          // Ignore
        }
        delete api.defaults.headers.common.Authorization;
        setToken(null);
        setSessionUser(null);
      }
      setProfileError(getErrorMessage(error));
      setProfileStatus('error');
    }
  }, []);

  // Listen for 401 events dispatched by api.js
  useEffect(() => {
    const handleUnauthorized = () => {
      try {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(DEMO_ACTIVE_KEY);
      } catch {
        // Ignore
      }
      delete api.defaults.headers.common.Authorization;
      setToken(null);
      setSessionUser(null);
      setProfileStatus('idle');
      setIsDemoActive(false);
    };

    window.addEventListener('campusconnect:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('campusconnect:unauthorized', handleUnauthorized);
  }, []);

  // Hydrate session on mount or token change
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      refreshProfile();
    } else {
      delete api.defaults.headers.common.Authorization;
      setSessionUser(null);
      setProfileStatus('idle');
    }
  }, [token, refreshProfile]);

  const signIn = useCallback(
    (authResponse) => {
      const newToken = authResponse.token;
      try {
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        sessionStorage.removeItem(DEMO_ACTIVE_KEY);
      } catch {
        // Ignore
      }
      setIsDemoActive(false);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      setToken(newToken);
      if (authResponse.user) {
        setSessionUser(toUser(authResponse.user));
      }
      refreshProfile();
    },
    [refreshProfile],
  );

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(DEMO_ACTIVE_KEY);
    } catch {
      // Ignore
    }
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setSessionUser(null);
    setIsDemoActive(false);
    setProfileStatus('idle');
    setProfileError(null);
  }, []);

  const loginWithCredentials = useCallback(
    async (email, password) => {
      const res = await api.post('/auth/login', { email, password });
      signIn(res.data);
      return res.data;
    },
    [signIn],
  );

  const registerWithCredentials = useCallback(
    async (payload) => {
      const res = await api.post('/auth/register', payload);
      signIn(res.data);
      return res.data;
    },
    [signIn],
  );

  const startDemo = useCallback((role = 'STUDENT') => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.setItem(DEMO_ACTIVE_KEY, 'true');
      sessionStorage.setItem(DEMO_ROLE_KEY, role);
    } catch {
      // Ignore
    }
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setSessionUser(null);
    setIsDemoActive(true);
    setDemoRoleState(role);
  }, []);

  const setDemoRole = useCallback((role) => {
    if (!ROLES.includes(role)) return;
    try {
      sessionStorage.setItem(DEMO_ROLE_KEY, role);
    } catch {
      // Ignore
    }
    setDemoRoleState(role);
  }, []);

  const value = useMemo(() => {
    let status = 'anonymous';
    let user = null;

    if (token) {
      user = sessionUser;
      status = user ? 'authenticated' : profileStatus === 'error' ? 'error' : 'loading';
    } else if (DEMO_AVAILABLE && isDemoActive) {
      user = demoUsers[demoRole];
      status = 'demo';
    }

    const currentUser = user
      ? {
          ...user,
          username: user.email || user.username,
          displayName: user.name || user.displayName || user.email,
        }
      : null;

    return {
      status,
      user,
      isDemo: status === 'demo',
      isAuthenticated: status === 'authenticated',
      profileStatus,
      profileError,
      signIn,
      signOut,
      refreshProfile,
      startDemo,
      demoRole,
      setDemoRole,
      loginWithCredentials,
      registerWithCredentials,

      // Compatibility aliases for the chat module.
      currentUser,
      login: signIn,
      logout: signOut,
      token,
    };
  }, [
    token,
    sessionUser,
    profileStatus,
    profileError,
    isDemoActive,
    demoRole,
    signIn,
    signOut,
    refreshProfile,
    startDemo,
    setDemoRole,
    loginWithCredentials,
    registerWithCredentials,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }

  return context;
}
