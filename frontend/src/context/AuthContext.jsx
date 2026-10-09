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

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const [profileStatus, setProfileStatus] = useState('idle');
  const [profileError, setProfileError] = useState(null);
  const [demoRole, setDemoRoleState] = useState(readDemoRole);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
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
      setProfileError(getErrorMessage(error));
      setProfileStatus('error');
    }
  }, []);

  const signIn = useCallback(
    (authResponse) => {
      api.defaults.headers.common.Authorization =
        `Bearer ${authResponse.token}`;

      setToken(authResponse.token);

      if (authResponse.user) {
        setSessionUser(toUser(authResponse.user));
      }

      refreshProfile();
    },
    [refreshProfile],
  );

  const signOut = useCallback(() => {
    setToken(null);
    setSessionUser(null);
    setProfileStatus('idle');
    setProfileError(null);
  }, []);

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