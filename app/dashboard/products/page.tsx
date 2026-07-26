import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { product } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { Package } from "lucide-react";

export default async function ProductsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/signin");
  }

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
    orderBy: (product, { desc }) => [desc(product.id)], // Normally order by createdAt, but schema lacks it. Let's use ID or Name
  });

  const formatMoney = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <ProductsHeader />

      <div className="rounded-[1rem] border border-border/50 bg-background shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
        {productsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
            <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center text-text-muted/60 mb-2">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-[14px] font-semibold text-text-primary">No products added yet</p>
            <p className="text-[13px] text-text-muted max-w-sm">
              Click the "Add product" button above to add your first product to the catalog.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface/50 border-b border-border/40 text-text-muted">
                <tr>
                  <th className="px-6 py-4 font-medium">Product Name</th>
                  <th className="px-6 py-4 font-medium">Unit</th>
                  <th className="px-6 py-4 font-medium text-right">Cost Price</th>
                  <th className="px-6 py-4 font-medium text-right">Selling Price</th>
                  <th className="px-6 py-4 font-medium text-right">Current Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {productsList.map((p) => (
                  <tr key={p.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {p.name}
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {p.unit}
                    </td>
                    <td className="px-6 py-4 text-text-primary font-medium text-right">
                      {formatMoney(p.costPrice)}
                    </td>
                    <td className="px-6 py-4 text-text-primary font-medium text-right">
                      {formatMoney(p.sellingPrice)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                        p.currentStock > 0 
                          ? 'bg-success/10 text-success' 
                          : 'bg-danger/10 text-danger'
                      }`}>
                        {p.currentStock.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
