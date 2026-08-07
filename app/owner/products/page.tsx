import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { product } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { ProductList } from "@/components/products/ProductList";
import { MobileProductsList } from "@/components/products/MobileProductsList";

export default async function ProductsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/signin");
  }

  const businessId = (session.user as any).businessId;
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

  const categories = Array.from(new Set(
    productsList.filter(p => p.category).map(p => p.category as string)
  )).sort();

  return (
    <>
      {/* DESKTOP VIEW (Condition a: hidden md:block — 100% untouched) */}
      <div className="hidden md:block max-w-5xl mx-auto space-y-8 pb-12">
        <ProductsHeader existingCategories={categories} />
        <ProductList products={productsList} categories={categories} />
      </div>

      {/* MOBILE VIEW (Condition a: block md:hidden — Interactive Mobile Products List) */}
      <MobileProductsList products={productsList} categories={categories} />
    </>
  );
}
