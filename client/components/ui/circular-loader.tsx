import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CircularLoaderProps {
  size?: number;
  className?: string;
}

export function CircularLoader({ size = 16, className }: CircularLoaderProps) {
  return (
    <Loader2
      aria-hidden
      className={cn("animate-spin shrink-0 text-current", className)}
      style={{ width: size, height: size }}
    />
  );
}
