import { Metadata } from "next";
import { BillingSettingsView } from "@/features/billing";

export const metadata: Metadata = {
  title: "Billing & Plan - OpenBook",
  description:
    "View your OpenBook subscription, usage limits, and upgrade to Pro or Pro+.",
};

export default function BillingSettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <BillingSettingsView />
    </div>
  );
}
