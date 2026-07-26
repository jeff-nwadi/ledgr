import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";

export default async function CustomersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) redirect("/signin");

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">Customers</h1>
          <p className="text-[13px] text-text-muted mt-1">Track customer debts and credit payments.</p>
        </div>
      </div>

      <div className="rounded-[1rem] border border-border/50 bg-background shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-3 p-6">
          <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center text-text-muted/60 mb-2 mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-[15px] font-semibold text-text-primary">Customers Coming Soon</h3>
          <p className="text-[13px] text-text-muted max-w-sm mx-auto">
            This is where you will see customer balances, log credit sales, and record debt payments.
          </p>
        </div>
      </div>
    </div>
  );
}
