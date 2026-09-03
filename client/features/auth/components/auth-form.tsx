"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OpenBookLogo } from "./openbook-logo";
import { useAuth } from "../hooks/use-auth";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { GithubIcon } from "@/components/ui/github-icon";

interface AuthFormProps {
  initialMode?: "login" | "signup";
}

export function AuthForm({ initialMode = "login" }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    loginMutation,
    signupMutation,
    signInWithGoogle,
    signInWithGithub,
    authError,
    setAuthError,
  } = useAuth();

  const isLoading = loginMutation.isPending || signupMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !password) {
      setAuthError("Please fill in all required fields.");
      return;
    }

    if (mode === "signup" && !name) {
      setAuthError("Please enter your name.");
      return;
    }

    if (mode === "login") {
      loginMutation.mutate({ email, password });
    } else {
      signupMutation.mutate({ name, email, password });
    }
  };

  const toggleMode = () => {
    setAuthError(null);
    const nextMode = mode === "login" ? "signup" : "login";
    setMode(nextMode);
    router.replace(nextMode === "login" ? "/login" : "/signup");
  };

  return (
    <div className="w-full max-w-110 px-6 sm:px-10 py-10 flex flex-col items-center justify-between min-h-160 text-zinc-900 dark:text-zinc-100">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center w-full">
        <OpenBookLogo size={32} textSize="text-2xl" className="mb-8" />

        <h1 className="text-2xl sm:text-[26px] font-normal tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
          {mode === "login" ? "Access your OpenBook" : "Create your OpenBook"}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-normal">
          {mode === "login"
            ? "Get started with OpenBook"
            : "Sign up to start organizing insights"}
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="w-full mt-7 space-y-4">
        {/* Error Alert */}
        {authError && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg text-center font-medium animate-fadeIn">
            {authError}
          </div>
        )}

        {/* Name input (only for signup) */}
        {mode === "signup" && (
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="name"
              className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              disabled={isLoading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background dark:bg-zinc-900/80 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
            />
          </div>
        )}

        {/* Email input */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="email"
            className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., mail@example.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background dark:bg-zinc-900/80 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
          />
        </div>

        {/* Password input */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="password"
            className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background dark:bg-zinc-900/80 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-900 active:scale-[0.99] text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <ThemeLoader size={18} />
            ) : (
              <>
                <span>{mode === "login" ? "Log in" : "Sign up"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Mode Switch */}
        <div className="text-center pt-2">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline inline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline inline"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
          <span className="bg-transparent px-3 text-[11px] font-medium tracking-wider text-zinc-400 uppercase absolute">
            — OR —
          </span>
        </div>

        {/* Social Logins */}
        <div className="pt-1 space-y-2.5">
          {/* Google */}
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={() => void signInWithGithub()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors shadow-xs"
          >
            <GithubIcon size={16} />
            <span>Continue with GitHub</span>
          </button>
        </div>
      </form>

      {/* Footer Legal */}
      <div className="mt-8 text-center">
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          By creating account, you agree to our{" "}
          <Link
            href="/terms"
            className="text-zinc-600 dark:text-zinc-400 font-medium hover:underline"
          >
            terms &amp; conditions
          </Link>
        </p>
      </div>
    </div>
  );
}
