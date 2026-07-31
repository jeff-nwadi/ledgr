import { redirect } from "next/navigation";

export default function ProfileRedirectPage() {
  redirect("/owner/settings?tab=personal");
}
