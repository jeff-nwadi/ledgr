import { ReactNode } from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/signin?type=pin");
  }

  // Get user role from DB
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { role: true, businessId: true, name: true }
  });

  const userRole = dbUser?.role || (session.user as any).role || "staff";

  // If user is owner, redirect to owner dashboard
  if (userRole === "owner") {
    redirect("/owner");
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {children}
    </div>
  );
}
