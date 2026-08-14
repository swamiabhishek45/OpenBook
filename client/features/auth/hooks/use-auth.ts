"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signUp, signOut, useSession, authClient } from "../lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();
  const [authError, setAuthError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      setAuthError(null);
      const res = await signIn.email({
        email,
        password,
      });
      if (res.error) {
        throw new Error(res.error.message || "Failed to log in");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => {
      setAuthError(error.message);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => {
      setAuthError(null);
      const res = await signUp.email({
        name,
        email,
        password,
      });
      if (res.error) {
        throw new Error(res.error.message || "Failed to create account");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => {
      setAuthError(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await signOut();
      if (res.error) {
        throw new Error(res.error.message || "Failed to sign out");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
  });

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard`,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAuthError(err.message);
      } else {
        setAuthError("Failed to sign in with Google");
      }
    }
  };

  return {
    session: session.data,
    isPending: session.isPending,
    error: session.error,
    authError,
    setAuthError,
    loginMutation,
    signupMutation,
    logoutMutation,
    signInWithGoogle,
  };
}
