import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { StaffList } from "@/components/staff/StaffList";

export default async function StaffPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) redirect("/signin");
  
  const businessId = (session.user as any).businessId;
  if (!businessId) redirect("/dashboard");

  const staffList = await db.query.user.findMany({
    where: and(eq(user.businessId, businessId), eq(user.role, "staff")),
    columns: {
      id: true,
      name: true,
      locked: true,
      failedAttempts: true,
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">Staff Management</h1>
          <p className="text-[13px] text-text-muted mt-1">Manage staff accounts, unlock profiles, and reset PINs.</p>
        </div>
      </div>

      <StaffList staffList={staffList} />
    </div>
  );
}
