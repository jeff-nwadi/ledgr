import { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { AuthNavigationGuard } from "@/components/auth/AuthNavigationGuard";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export const revalidate = 0; 

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      cookieStore.delete("better-auth.session_token");
      cookieStore.delete("__Secure-better-auth.session_token");
    } catch {}
    redirect("/signin");
  }

  let userRole = (session.user as any).role;
  if (!userRole) {
    const { db } = await import("@/lib/db");
    const { user } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: { role: true }
    });
    userRole = dbUser?.role;
  }
  userRole = userRole || "owner";

  if (userRole === "staff") {
    redirect("/staff");
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden text-text-primary">
      <AuthNavigationGuard userRole="owner" />
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <TopBar user={session.user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
        <MobileBottomNav userRole={userRole} />
      </div>
    </div>
  );
}
