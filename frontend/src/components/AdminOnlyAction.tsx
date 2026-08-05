"use client";

import { ReactNode } from "react";

import { isAdmin } from "@/lib/auth";

export function AdminOnlyAction({ children }: { children: ReactNode }) {
  if (!isAdmin()) {
    return null;
  }

  return <>{children}</>;
}
