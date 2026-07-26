import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DollarSign } from "lucide-react";
import { db } from "@/lib/db";
import { product } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SalesPOS } from "@/components/sales/SalesPOS";

export default async function SalesPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) redirect("/signin");

  const businessId = (session.session as any).businessId;
  if (!businessId) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center text-text-muted">
        No business associated with this account.
      </div>
    );
  }

  const productsList = await db.query.product.findMany({
    where: eq(product.businessId, businessId),
    orderBy: (product, { desc }) => [desc(product.id)],
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">Payments & Sales</h1>
          <p className="text-[13px] text-text-muted mt-1">Log new sales, record waste, and process transactions.</p>
        </div>
      </div>

      <SalesPOS products={productsList} />
    </div>
  );
}
