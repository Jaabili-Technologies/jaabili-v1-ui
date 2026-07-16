import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "jaabili_user";
// Only ever set for Google sign-in — email/password users have no Google
// access token and are simply never treated as admins, which is correct:
// admin status is gated server-side by ADMIN_EMAILS against a verified
// Google identity (see packages/agents/src/admin-auth.ts).
const ADMIN_TOKEN_STORAGE_KEY = "jaabili_admin_token";
// Set on every sign-in path (Google, email/password) -- proves "which
// person is this" for tenant-scoped dashboard routes (leads, reports,
// tickets), gated server-side by requireWorkspaceAccess against the
// workspace_members table. Previously the backend issued this token but
// the frontend never captured or sent it, leaving those routes reachable
// by anyone who knew a tenantId.
const SESSION_TOKEN_STORAGE_KEY = "jaabili_session_token";

const apiBase = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:3001" : "")
).replace(/\/$/, "");

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogleAccessToken: (accessToken: string) => Promise<AuthUser>;
  signInWithEmail: (email: string, password: string) => Promise<AuthUser>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

interface AuthResponse {
  valid: boolean;
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  sessionToken?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function writeUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function getStoredAdminAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

function writeAdminAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  }
}

export function getStoredSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
}

function writeSessionToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
  }
}

function toAuthUser(data: AuthResponse): AuthUser {
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.name,
    photoURL: data.picture,
  };
}

async function postAuth(path: string, body: Record<string, unknown>): Promise<AuthResponse> {
  const res = await fetch(`${apiBase}/api/auth/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as
    | (AuthResponse & { error?: string })
    | null;

  if (!res.ok || !data?.valid) {
    throw new Error(data?.error ?? "Sign-in failed.");
  }
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser(readUser());
  }, []);

  const signInWithGoogleAccessToken = async (accessToken: string): Promise<AuthUser> => {
    const data = await postAuth("verify", { accessToken });
    const authUser = toAuthUser(data);
    writeUser(authUser);
    writeAdminAccessToken(accessToken);
    writeSessionToken(data.sessionToken ?? null);
    setUser(authUser);
    return authUser;
  };

  const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
    const data = await postAuth("login", { email, password });
    const authUser = toAuthUser(data);
    writeUser(authUser);
    writeSessionToken(data.sessionToken ?? null);
    setUser(authUser);
    return authUser;
  };

  const signUpWithEmail = async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthUser> => {
    const data = await postAuth("register", { name, email, password });
    const authUser = toAuthUser(data);
    writeUser(authUser);
    writeSessionToken(data.sessionToken ?? null);
    setUser(authUser);
    return authUser;
  };

  const signOut = async () => {
    writeUser(null);
    writeAdminAccessToken(null);
    writeSessionToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogleAccessToken,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
