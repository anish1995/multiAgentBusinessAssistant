"use client";

import { getUser } from "@/lib/auth";

export function UserGreeting() {
  const user = getUser();
  const name = user?.fullName?.split(" ")[0] ?? "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <span>
      {greeting}, {name}
    </span>
  );
}
