import { getActiveShiftAction, getStaffProductsAction, getMyShiftActivityAction } from "@/app/actions/shift";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user, business } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StaffDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  let staffName = session?.user?.name || "Staff Member";
  let shopCode = "";

  if (session?.user?.id) {
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: { name: true, businessId: true }
    });
    if (dbUser) {
      if (dbUser.name) staffName = dbUser.name;
      if (dbUser.businessId) {
        const b = await db.query.business.findFirst({
          where: eq(business.id, dbUser.businessId),
          columns: { code: true }
        });
        if (b) shopCode = b.code;
      }
    }
  }

  const shiftRes = await getActiveShiftAction();
  const productsRes = await getStaffProductsAction();
  const activityRes = await getMyShiftActivityAction();

  return (
    <StaffDashboard 
      initialShift={shiftRes.activeShift || null}
      products={shiftRes.products || productsRes.products || []}
      initialActivities={activityRes.activities || []}
      currencySymbol="₦"
      staffName={staffName}
      shopCode={shopCode}
    />
  );
}
