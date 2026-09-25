import { getSession } from "@/features/auth/lib/auth-server";
import { SiteNav, SiteFooter } from "@/components/home";
import { PricingPlans } from "@/features/billing/components/pricing-plans";

export const metadata = {
  title: "Pricing — OpenBook",
  description:
    "Simple, flexible plans for researchers. Free tier plus Pro and Pro+ with higher limits.",
};

export default async function PricingPage() {
  const session = await getSession();
  const isAuthenticated = !!session;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNav isAuthenticated={isAuthenticated} />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6">
        <section
          className="mx-auto max-w-6xl rounded-[2rem] border border-border bg-muted/40 dark:bg-muted/15 px-6 py-10 sm:px-10 sm:py-14 md:px-14 md:py-16"
        >
          <PricingPlans variant="page" />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
