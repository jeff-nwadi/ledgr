import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReportsView } from "@/components/reports/ReportsView";

export default async function ReportsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) redirect("/signin");

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold font-heading text-text-primary">Reports & Exports</h1>
        <p className="text-xs text-text-muted mt-1">Export sales revenue, cost of goods, and profit ledgers for any custom date range.</p>
      </div>

      <ReportsView />
    </div>
  );
}

