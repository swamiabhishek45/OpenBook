import { getSession } from "@/features/auth/lib/auth-server";
import {
  SiteNav,
  Hero,
  IntegrationsStrip,
  GroundingIntro,
  FeatureRows,
  Faq,
  SiteFooter,
} from "@/components/home";

export const metadata = {
  title: "OpenBook - The research notebook that talks back",
  description:
    "Bring your PDFs, articles, and videos. OpenBook answers with citations, builds your flashcards, quizzes, and mind maps, and turns your library into a podcast you can interrupt.",
};

export default async function HomePage() {
  const session = await getSession();
  const isAuthenticated = !!session;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNav isAuthenticated={isAuthenticated} />

      <main className="flex-1">
        <Hero isAuthenticated={isAuthenticated} />
        <IntegrationsStrip />
        <GroundingIntro />
        <FeatureRows />
        <Faq />
      </main>

      <SiteFooter />
    </div>
  );
}
