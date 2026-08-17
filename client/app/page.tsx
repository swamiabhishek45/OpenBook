import { getSession } from "@/features/auth/lib/auth-server";
import {
  LandingNavbar,
  HeroSection,
  SourcesShowcase,
  StudioShowcase,
  MemoryShowcase,
  HowItWorks,
  CtaSection,
  LandingFooter,
} from "@/components/home";

export const metadata = {
  title: "OpenBook - Grounded AI Workspace & Research Notebook",
  description:
    "Turn your PDFs, web articles, and YouTube videos into grounded intelligence. Chat with citations, study with flashcards and mindmaps, and personalize learning with memory.",
};

export default async function HomePage() {
  const session = await getSession();
  const isAuthenticated = !!session;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background">
      {/* Navigation Header */}
      <LandingNavbar isAuthenticated={isAuthenticated} />

      {/* Main Content Sections */}
      <main className="flex-1 flex flex-col">
        {/* 1. Hero Section */}
        <HeroSection isAuthenticated={isAuthenticated} />

        {/* 2. Sources & Ingestion Showcase */}
        <SourcesShowcase />

        {/* 3. Studio Learning Tools Showcase */}
        <StudioShowcase />

        {/* 4. Personalized Long-Term Memory */}
        <MemoryShowcase />

        {/* 5. How It Works (3 Steps) */}
        <HowItWorks />

        {/* 6. Call To Action Banner */}
        <CtaSection isAuthenticated={isAuthenticated} />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
