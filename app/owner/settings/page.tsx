import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { business, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { BusinessSettings } from "@/components/settings/BusinessSettings";

export default async function SettingsPage() {
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
  });

  if (!b) redirect("/owner");

  const owner = await db.query.user.findFirst({
    where: eq(user.id, b.ownerId),
  });

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <BusinessSettings 
        business={{
          id: b.id,
          code: b.code,
          name: b.name,
          currency: b.currency,
          createdAt: b.createdAt.toISOString(),
        }}
        owner={{
          name: owner?.name || session.user.name || "Jefferson Nwadi",
          email: owner?.email || session.user.email || "jefftech108@gmail.com",
          phone: "Not added",
          country: "Nigeria",
        }}
      />
    </div>
  );
}
