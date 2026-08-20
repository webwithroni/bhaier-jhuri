"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { User } from "firebase/auth";

import {
  initializeAuthPersistence,
  loginWithEmail,
  loginWithGoogle,
  logout,
  registerWithEmail,
  subscribeToAuth,
} from "@/lib/firebase/auth";

import {
  createOrSyncUserProfile,
  getUserProfile,
  type UserProfile,
} from "@/lib/firebase/userProfile";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        await initializeAuthPersistence();
      } catch (error) {
        console.error("Auth persistence initialization failed:", error);
      }

      const unsubscribe = subscribeToAuth(async (nextUser) => {
        if (!mounted) return;

        setUser(nextUser);

        if (!nextUser) {
          setProfile(null);
          setLoading(false);
          return;
        }

        try {
          const syncedProfile = await createOrSyncUserProfile({
            uid: nextUser.uid,
            displayName:
              nextUser.displayName ||
              nextUser.email?.split("@")[0] ||
              "Customer",
            email: nextUser.email || "",
          });

          setProfile(syncedProfile);
        } catch (error) {
          console.error("User profile sync failed:", error);

          try {
            const existingProfile = await getUserProfile(nextUser.uid);
            setProfile(existingProfile);
          } catch (profileError) {
            console.error("Profile fallback failed:", profileError);
            setProfile(null);
          }
        }

        setLoading(false);
      });

      return unsubscribe;
    }

    let unsubscribe: (() => void) | undefined;

    initialize().then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  async function signInWithEmail(email: string, password: string) {
    return loginWithEmail(email, password);
  }

  async function signInWithGoogle() {
    return loginWithGoogle();
  }

  async function signUpWithEmail(
    name: string,
    email: string,
    password: string,
  ) {
    return registerWithEmail(name, email, password);
  }

  async function signOutUser() {
    await logout();
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signInWithEmail,
      signInWithGoogle,
      signUpWithEmail,
      signOut: signOutUser,
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
