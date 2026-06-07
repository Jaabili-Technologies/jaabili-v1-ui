import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  updateProfile,
  type User,
  type AuthProvider,
} from "firebase/auth";
import {
  firebaseAuth,
  googleProvider,
  githubProvider,
  microsoftProvider,
  appleProvider,
} from "./firebase";

export type SocialProviderId = "google" | "github" | "microsoft" | "apple";

const DEMO_EMAIL = "demo@jaabili.studio";
const DEMO_PASSWORD = "demo1234";
const DEMO_KEY = "jaabili_demo_user";

export interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  isDemo: true;
}

export type AuthUser = User | DemoUser;

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signInWithSocial: (id: SocialProviderId) => Promise<User>;
  signInWithEmail: (email: string, password: string) => Promise<AuthUser>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<User>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const providerMap: Record<SocialProviderId, AuthProvider> = {
  google: googleProvider,
  github: githubProvider,
  microsoft: microsoftProvider,
  apple: appleProvider,
};

function readDemo(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoUser;
    if (parsed?.isDemo) return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeDemo(u: DemoUser) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(u));
  }
}

function clearDemo() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DEMO_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readDemo());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (fbUser) => {
      const demo = readDemo();
      if (demo) {
        setUser(demo);
      } else {
        setUser(fbUser);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithSocial = async (id: SocialProviderId): Promise<User> => {
    clearDemo();
    const provider = providerMap[id];
    const result = await signInWithPopup(firebaseAuth, provider);
    return result.user;
  };

  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<AuthUser> => {
    if (
      email.trim().toLowerCase() === DEMO_EMAIL &&
      password === DEMO_PASSWORD
    ) {
      const demoUser: DemoUser = {
        uid: "demo-user",
        email: DEMO_EMAIL,
        displayName: "Demo User",
        isDemo: true,
      };
      writeDemo(demoUser);
      setUser(demoUser);
      return demoUser;
    }
    const result = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password,
    );
    return result.user;
  };

  const signUpWithEmail = async (
    name: string,
    email: string,
    password: string,
  ): Promise<User> => {
    clearDemo();
    const result = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password,
    );
    if (name) {
      await updateProfile(result.user, { displayName: name });
    }
    return result.user;
  };

  const sendPasswordResetEmail = async (email: string) => {
    if (email.trim().toLowerCase() === DEMO_EMAIL) {
      // Demo account — just succeed silently
      return;
    }
    await fbSendPasswordResetEmail(firebaseAuth, email);
  };

  const signOut = async () => {
    if (user && (user as DemoUser).isDemo) {
      clearDemo();
      setUser(null);
      return;
    }
    clearDemo();
    await fbSignOut(firebaseAuth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithSocial,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordResetEmail,
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

export const DEMO_CREDENTIALS = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
};
