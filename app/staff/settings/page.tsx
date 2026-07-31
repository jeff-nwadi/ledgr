import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user, business } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StaffSettings } from "@/components/settings/StaffSettings";
import { getActiveShiftAction } from "@/app/actions/shift";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StaffSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) redirect("/signin");

  let staffName = session.user.name || "Staff Member";
  let userRole = (session.user as any).role || "staff";
  let bizCode = "";
  let bizName = "Ledgr Shop";
  let currencyCode = "NGN";

  if (session.user.id) {
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id)
    });

    if (dbUser) {
      if (dbUser.name) staffName = dbUser.name;
      if (dbUser.role) userRole = dbUser.role;

      if (dbUser.businessId) {
        const b = await db.query.business.findFirst({
          where: eq(business.id, dbUser.businessId)
        });
        if (b) {
          bizCode = b.code;
          bizName = b.name;
          currencyCode = b.currency || "NGN";
        }
      }
    }
  }

  const shiftRes = await getActiveShiftAction();
  const activeShift = shiftRes.activeShift ? {
    id: shiftRes.activeShift.id,
    date: shiftRes.activeShift.date,
    openingFloat: shiftRes.activeShift.openingFloat
  } : null;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <StaffSettings
        staff={{
          id: session.user.id,
          name: staffName,
          role: userRole,
        }}
        business={{
          code: bizCode,
          name: bizName,
          currency: currencyCode,
        }}
        activeShift={activeShift}
      />
    </div>
  );
}
