import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sale, user, customer } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { SalesLog } from "@/components/sales/SalesLog";

export default async function SalesPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) redirect("/signin");

  const businessId = (session.user as any).businessId;
  if (!businessId) redirect("/dashboard");

  // Fetch historical sales
  const salesRaw = await db.select({
    id: sale.id,
    createdAt: sale.createdAt,
    total: sale.total,
    paymentType: sale.paymentType,
    staffName: user.name,
    customerName: customer.name,
  })
  .from(sale)
  .leftJoin(user, eq(sale.staffId, user.id))
  .leftJoin(customer, eq(sale.customerId, customer.id))
  .where(eq(sale.businessId, businessId))
  .orderBy(desc(sale.createdAt));

  // Map to the format SalesLog expects (resolving nulls from left join)
  const salesData = salesRaw.map(s => ({
    id: s.id,
    createdAt: s.createdAt,
    total: s.total,
    paymentType: s.paymentType,
    staffName: s.staffName || "Unknown Staff",
    customerName: s.customerName
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">Sales Log</h1>
          <p className="text-[13px] text-text-muted mt-1">Review historical sales and filter by payment type or staff.</p>
        </div>
      </div>

      <SalesLog sales={salesData} />
    </div>
  );
}
