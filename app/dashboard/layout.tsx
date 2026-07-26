import { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/signin");
  }

  const userInitial = session.user.name ? session.user.name[0] : "U";

  return (
    <div className="flex h-screen bg-background overflow-hidden text-text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userInitial={userInitial} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
