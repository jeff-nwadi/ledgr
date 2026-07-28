import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { product, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OwnerDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  let userRole = (session?.user as any)?.role;
  let businessId = (session?.user as any)?.businessId;

  if (session?.user?.id && (!userRole || !businessId)) {
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: { role: true, businessId: true }
    });
    if (dbUser) {
      userRole = dbUser.role;
      businessId = dbUser.businessId;
    }
  }

  userRole = userRole || "owner";

  if (userRole === "staff") {
    const { redirect } = await import("next/navigation");
    redirect("/staff");
  }

  const userName = session?.user?.name?.split(" ")[0] || "there";

  let hasProducts = false;
  if (businessId) {
    const existingProduct = await db.query.product.findFirst({
      where: eq(product.businessId, businessId)
    });
    hasProducts = !!existingProduct;
  }

  const currentHour = new Date().getHours();
  const greeting = 
    currentHour < 12 ? "Good morning" : 
    currentHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-heading text-text-primary">
          {greeting}, {userName}
        </h1>
      </div>

      {!hasProducts && (
        <div 
          className="rounded-[1.25rem] p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm"
          style={{ backgroundImage: 'var(--brand-gradient)' }}
        >
          <div className="space-y-1.5">
            <h2 className="text-[22px] font-semibold text-white">Information needed to enable live payments</h2>
            <p className="text-white/90 text-[15px] max-w-xl font-medium">
              We just need a few details about your business before you can start accepting payments.
            </p>
          </div>
          <Link href="/owner/products" className="flex items-center gap-2 bg-white text-text-primary px-5 py-2.5 rounded-full font-medium text-sm hover:bg-white/90 transition-colors whitespace-nowrap shadow-sm">
            Complete setup <ArrowRight className="w-4 h-4 text-text-muted" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-[1rem] border border-border/50 bg-background p-6 flex flex-col shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <h3 className="text-text-muted text-[15px] font-medium">Revenue</h3>
              <p className="text-[32px] font-semibold text-text-primary">₦0.00</p>
            </div>
          </div>
          <div className="mt-2 flex items-center text-[13px] text-text-muted cursor-pointer hover:text-text-primary w-fit gap-1 font-medium">
            Last 30 days <ChevronDown className="w-4 h-4 opacity-50" />
          </div>
          
          <div className="mt-6 flex-1">
            <RevenueChart />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1rem] border border-border/50 bg-background p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-[15px] text-text-primary font-semibold">Today's Close-out</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand"></span>
                  <span className="text-[13px] font-medium text-text-muted">Cash Variance</span>
                </div>
                <span className="text-[13px] font-medium text-text-muted">Pending</span>
              </div>
              <div className="w-full h-1.5 bg-border/40 rounded-full overflow-hidden">
                <div className="h-full bg-brand w-0"></div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand/40"></span>
                  <span className="text-[13px] font-medium text-text-muted">Stock Variance</span>
                </div>
                <span className="text-[13px] font-medium text-text-muted">Pending</span>
              </div>
            </div>

            <div className="pt-3">
              <button className="w-full py-2 bg-surface hover:bg-border/50 text-text-primary text-[13px] font-medium rounded-full transition-colors border border-border/50">
                Close shift
              </button>
            </div>
          </div>

          <div className="rounded-[1rem] border border-border/50 bg-background p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col h-64">
            <h3 className="text-[15px] text-text-primary font-semibold mb-4">Recent activity</h3>
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-full space-y-3 mb-2 opacity-40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface shrink-0"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2 bg-surface rounded w-3/4"></div>
                    <div className="h-2 bg-surface rounded w-1/2"></div>
                  </div>
                  <div className="w-8 h-2 bg-surface rounded"></div>
                </div>
              </div>
              
              <p className="text-[13px] font-semibold text-text-primary">Nothing here yet</p>
              <p className="text-[13px] text-text-muted">Your sales will show up here once logged.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-[18px] font-medium text-text-primary">Overview</h2>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-border/50 rounded-lg bg-background text-[13px] text-text-primary shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] hover:bg-surface">
              Last 3 months <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-border/50 rounded-lg bg-background text-[13px] text-text-primary shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] hover:bg-surface">
              27th Apr - 26th Jul
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-[1rem] border border-border/50 bg-background p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center gap-2 text-text-muted">
              <span className="text-[13px] font-medium">Gross Volume</span>
            </div>
            <p className="text-[24px] font-semibold text-text-primary">₦0.00</p>
          </div>

          <div className="rounded-[1rem] border border-border/50 bg-background p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center gap-2 text-text-muted">
              <span className="text-[13px] font-medium">Net Volume</span>
            </div>
            <p className="text-[24px] font-semibold text-text-primary">₦0.00</p>
          </div>

          <div className="rounded-[1rem] border border-border/50 bg-background p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center gap-2 text-text-muted">
              <span className="text-[13px] font-medium">New Customers</span>
            </div>
            <p className="text-[24px] font-semibold text-text-primary">0</p>
          </div>

          <div className="rounded-[1rem] border border-border/50 bg-background p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center gap-2 text-text-muted">
              <span className="text-[13px] font-medium">Stock Variance Value</span>
            </div>
            <p className="text-[24px] font-semibold text-text-primary">₦0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
