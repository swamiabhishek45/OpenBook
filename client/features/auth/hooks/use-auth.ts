"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signUp, signOut, useSession } from "../lib/auth-client";
import { authRoutes } from "../lib/auth-routes";
import { useRouter } from "next/navigation";
import { useState } from "react";

function getClientOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function getCallbackPath(): string {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const cb = params.get("callbackUrl");
    if (cb) return cb;
  }
  return authRoutes.dashboard;
}

function toAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const origin = getClientOrigin();
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${path}`;
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();
  const [authError, setAuthError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      callbackUrl,
    }: {
      email: string;
      password: string;
      callbackUrl?: string;
    }) => {
      setAuthError(null);
      const res = await signIn.email({
        email,
        password,
      });
      if (res.error) {
        throw new Error(res.error.message || "Failed to log in");
      }
      return { data: res.data, targetUrl: callbackUrl || getCallbackPath() };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries();
      router.push(result.targetUrl);
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
      callbackUrl,
    }: {
      name: string;
      email: string;
      password: string;
      callbackUrl?: string;
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
      return { data: res.data, targetUrl: callbackUrl || getCallbackPath() };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries();
      router.push(result.targetUrl);
      router.refresh();
    },
    onError: (error: Error) => {
      setAuthError(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await signOut({
        fetchOptions: {
          onSuccess: () => {
            queryClient.clear();
            router.push(authRoutes.login);
            router.refresh();
          },
        },
      });
      if (res?.error) {
        throw new Error(res.error.message || "Failed to sign out");
      }
      return res?.data;
    },
    onSuccess: () => {
      queryClient.clear();
      router.push(authRoutes.login);
      router.refresh();
    },
  });

  const signInWithGoogle = async (customCallbackUrl?: string) => {
    setAuthError(null);
    try {
      const targetPath = customCallbackUrl || getCallbackPath();
      // Ensure callbackURL is an absolute client frontend URL (e.g. http://localhost:3000/dashboard)
      const absoluteCallbackUrl = toAbsoluteUrl(targetPath);

      const { data, error } = await signIn.social({
        provider: "google",
        callbackURL: absoluteCallbackUrl,
      });

      if (error) {
        setAuthError(error.message ?? "Something went wrong with Google sign in.");
        return;
      }

      if (data?.url && data.redirect) {
        window.location.href = data.url;
      }
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
