import { requireViewer } from "@/lib/crm-auth";
import { createClient } from "@/lib/supabase-server";
import { isExotelConfigured } from "@/lib/exotel";
import { TEST_PERSONAS_ENABLED } from "@/lib/crm-roles";
import { SalesWorkspace } from "@/components/crm/sales/SalesWorkspace";
import { QUEUE_LEAD_COLUMNS, type PendingApproval, type QueueLead, type RepOption } from "./types";

export const metadata = { title: "Sales & RevOps · Infriva CRM" };

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 86400_000).toISOString();
}

export default async function SalesPage() {
  const viewer = await requireViewer(["SALES_REP", "MD_CEO"]);
  const supabase = await createClient();
  const closedSince = daysAgoIso(30);

  // All reads go through the viewer's RLS-scoped client.
  const [openLeads, closedLeads, reps, approvals] = await Promise.all([
    supabase
      .from("leads")
      .select(QUEUE_LEAD_COLUMNS)
      .not("stage", "in", "(WON,LOST)")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("leads")
      .select(QUEUE_LEAD_COLUMNS)
      .in("stage", ["WON", "LOST"])
      .gte("updated_at", closedSince)
      .order("updated_at", { ascending: false })
      .limit(200),
    supabase.from("user_profiles").select("id, full_name, is_active").eq("role", "SALES_REP").order("full_name"),
    supabase
      .from("quotations")
      .select("id, lead_id, quote_number, total_inr, submitted_at, lead:leads(full_name), rep:user_profiles!quotations_created_by_fkey(full_name)")
      .eq("status", "PENDING_APPROVAL")
      .order("submitted_at", { ascending: true }),
  ]);

  const loadError = openLeads.error || closedLeads.error || reps.error || approvals.error;

  const pendingApprovals: PendingApproval[] = (approvals.data || []).map((q) => {
    const row = q as unknown as {
      id: string;
      lead_id: string;
      quote_number: string;
      total_inr: number;
      submitted_at: string | null;
      lead: { full_name: string } | null;
      rep: { full_name: string } | null;
    };
    return {
      id: row.id,
      lead_id: row.lead_id,
      quote_number: row.quote_number,
      total_inr: Number(row.total_inr),
      submitted_at: row.submitted_at,
      lead_name: row.lead?.full_name || "Lead",
      rep_name: row.rep?.full_name || null,
    };
  });

  return (
    <SalesWorkspace
      viewer={viewer}
      leads={[...((openLeads.data || []) as unknown as QueueLead[]), ...((closedLeads.data || []) as unknown as QueueLead[])]}
      reps={(reps.data || []) as RepOption[]}
      pendingApprovals={pendingApprovals}
      exotelReady={isExotelConfigured()}
      sampleDataEnabled={TEST_PERSONAS_ENABLED}
      loadError={loadError ? loadError.message : null}
    />
  );
}
