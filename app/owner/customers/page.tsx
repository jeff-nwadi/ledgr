import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Construction } from "lucide-react";

export default async function CustomersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) redirect("/signin");
  
  const businessId = (session.user as any).businessId;
  if (!businessId) redirect("/owner");

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 h-full flex flex-col">
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
          We're currently building the customer debt and credit management module. Soon you'll be able to assign credit to specific customers, track balances, and log their payments seamlessly.
        </p>
      </div>
    </div>
  );
}
