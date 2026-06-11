import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { firebaseAuth, googleProvider, isFirebaseConfigured } from "./firebase";
import { clearOnboarding } from "./onboarding";

export type SocialProviderId = "google";

const DEMO_EMAIL = "saathvikk202@gmail.com";
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
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<User>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readDemo(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoUser;
    return parsed?.isDemo ? parsed : null;
  } catch {
    return null;
  }
}

function clearDemo() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DEMO_KEY);
  }
}

function writeDemo(user: DemoUser) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(user));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readDemo());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setUser(readDemo());
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(firebaseAuth, (fbUser) => {
      setUser(readDemo() ?? fbUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const signInWithSocial = async (id: SocialProviderId): Promise<User> => {
    if (id !== "google") {
      throw new Error("Only Google sign-in is enabled for now.");
    }
    if (!firebaseAuth || !isFirebaseConfigured) {
      throw new Error("Firebase Google sign-in is not configured for this environment.");
    }

    clearDemo();
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    setUser(result.user);
    return result.user;
  };

  const signInWithEmail = async (email: string, password: string): Promise<User> => {
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      clearOnboarding();
      const demoUser: DemoUser = {
        uid: "demo-user",
        email: DEMO_EMAIL,
        displayName: "Demo User",
        isDemo: true,
      };
      writeDemo(demoUser);
      setUser(demoUser);
      return demoUser as unknown as User;
    }

    if (!firebaseAuth || !isFirebaseConfigured) {
      throw new Error("Firebase email sign-in is not configured for this environment.");
    }

    clearDemo();
    const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
    setUser(result.user);
    return result.user;
  };

  const signUpWithEmail = async (
    name: string,
    email: string,
    password: string,
  ): Promise<User> => {
    if (!firebaseAuth || !isFirebaseConfigured) {
      throw new Error("Firebase sign-up is not configured for this environment.");
    }

    clearDemo();
    const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    if (name.trim()) {
      await updateProfile(result.user, { displayName: name.trim() });
    }
    setUser(result.user);
    return result.user;
  };

  const sendPasswordResetEmail = async (email: string) => {
    if (!firebaseAuth || !isFirebaseConfigured) {
      throw new Error("Firebase password reset is not configured for this environment.");
    }
    await fbSendPasswordResetEmail(firebaseAuth, email);
  };

  const signOut = async () => {
    clearDemo();
    if (firebaseAuth && isFirebaseConfigured) {
      await fbSignOut(firebaseAuth);
    }
    setUser(null);
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

export const DEMO_CREDENTIALS = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
