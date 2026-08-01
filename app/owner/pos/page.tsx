import { redirect } from "next/navigation";

export default function OwnerPOSRedirect() {
  redirect("/owner/products");
}
