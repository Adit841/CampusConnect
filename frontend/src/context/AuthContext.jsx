import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '../services/api.js';
import { getErrorMessage, getMyProfile } from '../services/profileService.js';
import { demoUsers } from '../data/mockDashboardData.js';

export const ROLES = ['STUDENT', 'TEACHER', 'ADMIN'];

const DEMO_AVAILABLE = import.meta.env.DEV;
const DEMO_ROLE_KEY = 'cc-demo-role';

const AuthContext = createContext(null);

function toUser(profile) {
  const academic = profile.studentProfile || profile.teacherProfile || {};

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    username: profile.email || profile.username,
    displayName: profile.name || profile.displayName || profile.email,
    role: profile.role,
    profileImage: profile.profileImage || null,
    department: academic.department || null,
    studentProfile: profile.studentProfile || null,
    teacherProfile: profile.teacherProfile || null,
  };
}

function readDemoRole() {
  const saved = sessionStorage.getItem(DEMO_ROLE_KEY);
  return ROLES.includes(saved) ? saved : 'STUDENT';
}

const TOKEN_KEY = 'token';
const CC_TOKEN_KEY = 'cc_token';

function readStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(CC_TOKEN_KEY) || null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readStoredToken);
  const [sessionUser, setSessionUser] = useState(null);
  const [profileStatus, setProfileStatus] = useState('idle');
  const [profileError, setProfileError] = useState(null);
  const [demoRole, setDemoRoleState] = useState(readDemoRole);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(CC_TOKEN_KEY, token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(CC_TOKEN_KEY);
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  const refreshProfile = useCallback(async () => {
    setProfileStatus('loading');
    setProfileError(null);

    try {
      setSessionUser(toUser(await getMyProfile()));
      setProfileStatus('ready');
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(CC_TOKEN_KEY);
        delete api.defaults.headers.common.Authorization;
        setToken(null);
        setSessionUser(null);
      }
      setProfileError(getErrorMessage(error));
      setProfileStatus('error');
    }
  }, []);

  // Hydrate profile on initial mount if token was restored from storage
  useEffect(() => {
    if (token && !sessionUser && profileStatus === 'idle') {
      refreshProfile();
    }
  }, [token, sessionUser, profileStatus, refreshProfile]);

  const signIn = useCallback(
    (authResponse) => {
      const jwtToken = authResponse.token;
      localStorage.setItem(TOKEN_KEY, jwtToken);
      localStorage.setItem(CC_TOKEN_KEY, jwtToken);
      api.defaults.headers.common.Authorization = `Bearer ${jwtToken}`;

      setToken(jwtToken);

      if (authResponse.user) {
        setSessionUser(toUser(authResponse.user));
      }

      refreshProfile();
    },
    [refreshProfile],
  );

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CC_TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setSessionUser(null);
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

  const setDemoRole = useCallback((role) => {
    if (!ROLES.includes(role)) return;

    sessionStorage.setItem(DEMO_ROLE_KEY, role);
    setDemoRoleState(role);
  }, []);

  const value = useMemo(() => {
    let status = 'anonymous';
    let user = null;

    if (token) {
      user = sessionUser;
      status = user
        ? 'authenticated'
        : profileStatus === 'error'
          ? 'error'
          : 'loading';
    } else if (DEMO_AVAILABLE) {
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
      profileStatus,
      profileError,
      signIn,
      signOut,
      refreshProfile,
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
    demoRole,
    signIn,
    signOut,
    refreshProfile,
    setDemoRole,
    loginWithCredentials,
    registerWithCredentials,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }

  return context;
}