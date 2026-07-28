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
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">Business Settings</h1>
          <p className="text-[13px] text-text-muted mt-1">
            View your Business ID code and manage shop configuration.
          </p>
        </div>
      </div>

      <BusinessSettings 
        business={{
          id: b.id,
          code: b.code,
          name: b.name,
          currency: b.currency,
          createdAt: b.createdAt.toISOString(),
        }}
        ownerName={owner?.name || session.user.name}
        ownerEmail={owner?.email || session.user.email}
      />
    </div>
  );
}
