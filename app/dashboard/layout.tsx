import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-white sm:px-8 sm:py-10">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.13),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.1),transparent_35%)]"
      />
      <div className="relative mx-auto w-full max-w-6xl">
        <DashboardHeader />
        {children}
      </div>
    </main>
  );
}
