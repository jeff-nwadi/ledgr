import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user, business, cashSession } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { StaffList } from "@/components/staff/StaffList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OwnerStaffManagementPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) redirect("/signin");
  const userRole = (session.user as any).role || "staff";
  if (userRole === "staff") redirect("/staff");
  
  const businessId = (session.user as any).businessId;
  if (!businessId) redirect("/owner");

  const b = await db.query.business.findFirst({
    where: eq(business.id, businessId),
    columns: { code: true }
  });

  const staffList = await db.query.user.findMany({
    where: and(eq(user.businessId, businessId), eq(user.role, "staff")),
    columns: {
      id: true,
      name: true,
      locked: true,
      failedAttempts: true,
      status: true,
      createdAt: true,
    },
    orderBy: (user, { desc }) => [desc(user.createdAt)]
  });

  // Query all cash sessions for this business to determine each staff member's shift status
  const sessions = await db.query.cashSession.findMany({
    where: eq(cashSession.businessId, businessId),
    orderBy: [desc(cashSession.date)]
  });

  const staffWithShiftInfo = staffList.map(s => {
    const sSession = sessions.find(cs => cs.staffId === s.id);
    let shiftStatus: "active" | "ended" | "none" = "none";
    let shiftStartedAt: string | undefined = undefined;
    let shiftEndedAt: string | undefined = undefined;

    if (sSession) {
      shiftStartedAt = sSession.date.toISOString();
      if (!sSession.closedAt) {
        shiftStatus = "active";
      } else {
        shiftStatus = "ended";
        shiftEndedAt = sSession.closedAt.toISOString();
      }
    }

    return {
      ...s,
      createdAt: s.createdAt.toISOString(),
      shiftStatus,
      shiftStartedAt,
      shiftEndedAt
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">Staff Management</h1>
          <p className="text-[13px] text-text-muted mt-1">
            Monitor real-time staff shift status, add team members, regenerate login PINs, and manage account access.
          </p>
        </div>
      </div>

      <StaffList 
        staffList={staffWithShiftInfo} 
        businessCode={b?.code || ""}
      />
    </div>
  );
}
