"use client";

import { AlertCircle, Coins, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpgradeModal } from "../stores/use-upgrade-modal";

interface InsufficientCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits: number;
  currentCredits: number;
  actionName?: string;
}

export function InsufficientCreditsDialog({
  isOpen,
  onClose,
  requiredCredits,
  currentCredits,
  actionName = "this action",
}: InsufficientCreditsDialogProps) {
  const { openUpgradeModal } = useUpgradeModal();
  const deficit = Math.max(0, requiredCredits - currentCredits);

  const handleTopUp = () => {
    onClose();
    openUpgradeModal({
      reason: `You need ${requiredCredits} credits to perform ${actionName}.`,
      requiredCredits,
      currentCredits,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background text-foreground border-border rounded-2xl shadow-xl">
        <DialogHeader className="flex flex-col items-center text-center pt-2">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 border border-rose-500/20">
            <Coins className="w-6 h-6 animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Insufficient Credits
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1 text-center">
            You don't have enough credits to complete {actionName}.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 rounded-xl bg-muted/40 border border-border/60 my-2 space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Required Credits:</span>
            <span className="font-semibold text-foreground">{requiredCredits} credits</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Balance:</span>
            <span className="font-semibold text-foreground">{currentCredits} credits</span>
          </div>
          <div className="h-px bg-border/60 my-1" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-rose-600 dark:text-rose-400 font-medium">Credits Needed:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">+{deficit} credits</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleTopUp}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Top Up Credits (Min ₹50)</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

