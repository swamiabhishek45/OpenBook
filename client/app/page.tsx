"use client";

import { useAuth, OpenBookLogo } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { session, isPending } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <OpenBookLogo size={28} textSize="text-xl" textColor="text-white" />
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-400">
            {session.user.name} ({session.user.email})
          </span>
          <Link
            href="/login"
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
          >
            Switch Account
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-3">
          Welcome to OpenBook
        </h1>
        <p className="text-zinc-400 text-sm max-w-md mb-8">
          Logged in as <span className="text-white font-medium">{session.user.email}</span>.
          Ready to unlock insights from your documents and research.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/workspace"
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-sm font-medium rounded-lg transition-colors"
          >
            Go to Workspaces →
          </Link>
        </div>
      </main>
    </div>
  );
}
