import { redirect } from "next/navigation";
import { requireViewer } from "@/lib/crm-auth";
import { ROLE_HOME } from "@/lib/crm-roles";

// /dashboard sends each signed-in user straight to their own workspace.
export default async function DashboardIndex() {
  const viewer = await requireViewer();
  redirect(ROLE_HOME[viewer.role]);
}
