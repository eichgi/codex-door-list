import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard-header";

export function OrganizerShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <DashboardHeader />
      {children}
    </div>
  );
}
