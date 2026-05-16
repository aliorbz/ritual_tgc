"use client";

import { SessionProvider } from "next-auth/react";

export function DiscordProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
