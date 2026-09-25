"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpgradeModal } from "../stores/use-upgrade-modal";
import { PricingPlans } from "./pricing-plans";

export function UpgradeModal() {
  const { isOpen, reason, closeUpgradeModal } = useUpgradeModal();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeUpgradeModal()}>
      <DialogContent
        className="sm:max-w-5xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background text-foreground border-border rounded-[1.75rem] shadow-2xl"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Choose a subscription plan</DialogTitle>
        <div className="overflow-y-auto flex-1 custom-scrollbar p-6 md:p-8">
          <PricingPlans
            variant="embedded"
            alertMessage={reason}
            onCheckoutSuccess={closeUpgradeModal}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
