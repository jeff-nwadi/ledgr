import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Construction } from "lucide-react";
import { db } from "@/lib/db";
import { customer } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";

export default async function CustomersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) redirect("/signin");
  
  const businessId = (session.user as any).businessId;
  if (!businessId) redirect("/owner");

  const customersList = await db.query.customer.findMany({
    where: eq(customer.businessId, businessId),
    orderBy: (c, { desc }) => [desc(c.balanceOwed)]
  });

  const totalOutstandingCredit = customersList.reduce((sum, c) => sum + (c.balanceOwed || 0), 0);

  return (
    <>
      {/* DESKTOP VIEW (Condition a: hidden md:block — 100% untouched) */}
      <div className="hidden md:block max-w-5xl mx-auto space-y-8 pb-12 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-text-primary">Customers & Debt</h1>
            <p className="text-[13px] text-text-muted mt-1">Manage customer credit and log received payments.</p>
          </div>
        </div>

        <div className="flex-1 rounded-[1rem] border border-border/50 bg-background shadow-sm flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center text-brand mb-6 shadow-sm border border-border/50">
            <Construction className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-2">Coming Soon</h2>
          <p className="text-[14px] text-text-muted max-w-md mx-auto">
            We're currently building the customer debt and credit management module. Soon you'll be able to assign credit to specific customers, track balances, and record their payments directly.
          </p>
        </div>
      </div>

      {/* MOBILE VIEW (Condition a: block md:hidden — Matches Reference Image 3 EXACTLY with REAL DB DATA) */}
      <div className="block md:hidden space-y-4 pb-28 px-1">
        {/* Header Title + Search Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold font-heading text-text-primary tracking-tight">Customers</h1>
          <GlobalSearch iconOnly={true} userRole="owner" />
        </div>

        {/* Total Outstanding Credit Alert Banner */}
        <div className="rounded-2xl bg-[#FDF0EE] dark:bg-[#E0665D]/15 border border-[#E0665D]/20 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E0665D]/10 text-[#E0665D] flex items-center justify-center text-sm shrink-0">
            ⚠️
          </div>
          <div>
            <span className="text-xs text-[#5B6764] dark:text-[#9AAAA5] block font-normal">Total outstanding credit</span>
            <div className="text-lg font-normal text-[#E0665D] tabular-nums mt-0.5">
              ₦{totalOutstandingCredit.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Customer Cards List (Dynamic DB customers) */}
        <div className="space-y-3 pt-1">
          {customersList.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted font-normal bg-surface border border-border/60 rounded-2xl">
              No registered customers found.
            </div>
          ) : (
            customersList.map((c) => {
              const isOwing = (c.balanceOwed || 0) > 0;
              const initials = c.name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);

              return (
                <div key={c.id} className="rounded-2xl border border-border/60 bg-surface p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-semibold text-sm overflow-hidden shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-normal text-text-primary">{c.name}</p>
                        <p className="text-xs text-text-muted font-normal mt-0.5">{c.phone || "No phone attached"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-text-muted block font-normal">Balance</span>
                      <span className={`text-sm font-normal block mt-0.5 ${isOwing ? "text-[#E0665D] tabular-nums" : "text-[#2E9C82]"}`}>
                        {isOwing ? `₦${(c.balanceOwed ?? 0).toLocaleString()}` : "Cleared"}
                      </span>
                    </div>
                  </div>
                  {isOwing && (
                    <button className="w-full border border-border/60 bg-background text-text-primary text-xs font-normal py-2.5 rounded-2xl hover:bg-border/40 transition-colors min-h-[44px]">
                      Mark payment received
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
