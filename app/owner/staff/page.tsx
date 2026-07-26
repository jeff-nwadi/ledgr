import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function unlockStaffAction(formData: FormData) {
  "use server";
  const staffId = formData.get("staffId") as string;
  
  if (staffId) {
    await db.update(user)
      .set({ locked: false, failedAttempts: 0 })
      .where(eq(user.id, staffId));
    revalidatePath("/owner/staff");
  }
}

export default async function StaffManagementPage() {
  // In a real app we'd get the current user's businessId from the session.
  // For the sake of this MVP auth flow, we fetch all locked staff members.
  // Assuming a generic approach where this view shows all staff for now.
  const lockedStaff = await db.query.user.findMany({
    where: and(
      eq(user.role, "staff"),
      eq(user.locked, true)
    ),
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold font-heading">Staff Management</h1>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Locked Accounts</h2>
        {lockedStaff.length === 0 ? (
          <p className="text-text-muted">No locked staff accounts.</p>
        ) : (
          <div className="space-y-4">
            {lockedStaff.map((staff) => (
              <div key={staff.id} className="p-4 border border-border rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">{staff.name}</p>
                  <p className="text-sm text-danger">Locked due to too many failed attempts.</p>
                </div>
                <form action={unlockStaffAction}>
                  <input type="hidden" name="staffId" value={staff.id} />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-brand text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Unlock Account
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
