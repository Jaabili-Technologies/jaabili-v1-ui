import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { hasCompletedOnboarding, saveOnboarding } from "./onboarding";

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
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
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

interface WorkspaceSummary {
  tenantId: string;
  name: string;
  role: string;
}

// Onboarding completion is a pure browser-localStorage flag (see
// onboarding.ts), never persisted server-side -- so any account whose
// workspace was provisioned directly (an admin-seeded test tenant, a
// teammate added to an existing workspace) shows the onboarding wizard on
// every first login on a new browser, even though the workspace already
// has real data. This checks whether the signed-in user's workspace
// already has FAQs on file and, if so, marks onboarding complete
// automatically instead of forcing them through a wizard for data that
// already exists.
async function autoSkipOnboardingIfWorkspaceHasData(uid: string, sessionToken: string | null): Promise<void> {
  if (!sessionToken || hasCompletedOnboarding(uid)) return;

  try {
    const workspacesRes = await fetch(`${apiBase}/api/auth/me/workspaces`, {
      headers: { authorization: `Bearer ${sessionToken}` },
    });
    if (!workspacesRes.ok) return;
    const workspaces = (await workspacesRes.json()) as WorkspaceSummary[];
    if (workspaces.length === 0) return;

    // /auth/register and /auth/login auto-provision a blank workspace for
    // any user with zero memberships at that moment -- an account linked
    // to a real, already-populated tenant AFTER registration ends up with
    // both that blank one and the real one. Pick the first workspace that
    // actually has FAQ data on file, not just the first in the list.
    for (const workspace of workspaces) {
      const faqsRes = await fetch(
        `${apiBase}/api/agents/website-sales/faqs?tenantId=${encodeURIComponent(workspace.tenantId)}`,
      );
      if (!faqsRes.ok) continue;
      const faqs = (await faqsRes.json()) as unknown[];
      if (faqs.length === 0) continue;

      saveOnboarding(uid, {
        role: "owner",
        useCase: "sales",
        teamSize: "unspecified",
        source: "existing-workspace",
        channels: ["website"],
        selectedAgents: ["website-sales"],
        companyName: workspace.name,
        tenantId: workspace.tenantId,
      });
      return;
    }
  } catch {
    // Best-effort -- if this fails, the user still sees onboarding, which
    // is the safe (if annoying) fallback, not a broken app.
  }
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
    await autoSkipOnboardingIfWorkspaceHasData(authUser.uid, data.sessionToken ?? null);
    setUser(authUser);
    return authUser;
  };

  const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
    const data = await postAuth("login", { email, password });
    const authUser = toAuthUser(data);
    writeUser(authUser);
    writeSessionToken(data.sessionToken ?? null);
    await autoSkipOnboardingIfWorkspaceHasData(authUser.uid, data.sessionToken ?? null);
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

  const authedRequest = async (path: string, body: Record<string, unknown>): Promise<void> => {
    const sessionToken = getStoredSessionToken();
    const res = await fetch(`${apiBase}/api/auth/me/${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(sessionToken ? { authorization: `Bearer ${sessionToken}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error ?? "Request failed.");
    }
  };

  const changePassword = (currentPassword: string, newPassword: string) =>
    authedRequest("change-password", { currentPassword, newPassword });

  const deleteAccount = async (password: string) => {
    await authedRequest("delete-account", { password });
    await signOut();
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
        changePassword,
        deleteAccount,
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
