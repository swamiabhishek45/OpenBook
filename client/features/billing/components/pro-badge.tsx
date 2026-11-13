"use client";

import React from "react";
import { CreditBadge } from "./credit-badge";

export function ProBadge({ className = "" }: { className?: string }) {
  return <CreditBadge className={className} />;
}
