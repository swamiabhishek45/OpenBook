import { Metadata } from "next";
import { MemorySettingsView } from "@/features/memory";

export const metadata: Metadata = {
  title: "Personal Memory Settings - OpenBook",
  description: "Manage your Mem0 personalized long-term AI memory profile and study preferences.",
};

export default function MemorySettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <MemorySettingsView />
    </div>
  );
}
