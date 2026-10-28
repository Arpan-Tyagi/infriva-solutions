/**
 * @file scripts/verify-sales-db.mjs
 * @description Database-level verification for the Sales & RevOps module.
 *
 * Applies every migration in supabase/migrations plus the persona seed to an
 * in-memory Postgres (PGlite + Supabase shim) and exercises RLS, round-robin
 * assignment, call roll-ups, the quotation approval workflow and WON
 * provisioning as the real personas would through PostgREST.
 *
 * Run: node scripts/verify-sales-db.mjs
 */

import { createSupabaseShim, applyMigrations, applySeed, asUser, personaClaims } from './db/pglite-supabase.mjs';

const ORG_HQ = '00000000-0000-0000-0000-000000000001';
const ORG_CLIENT = '00000000-0000-0000-0000-000000000002';
const MD = '11111111-1111-1111-1111-111111111111';
const REP = '22222222-2222-2222-2222-222222222222';
const REP2 = '88888888-8888-8888-8888-888888888888';
const DEV = '33333333-3333-3333-3333-333333333333';
const CLIENT = '77777777-7777-7777-7777-777777777777';

const asMd = personaClaims(MD, 'MD_CEO', ORG_HQ);
const asRep = personaClaims(REP, 'SALES_REP', ORG_HQ);
const asRep2 = personaClaims(REP2, 'SALES_REP', ORG_HQ);
const asDev = personaClaims(DEV, 'WEB_DEVELOPER', ORG_HQ);
const asClient = personaClaims(CLIENT, 'CLIENT_VIEW', ORG_CLIENT);
const asService = { role: 'service_role' };
const asAnon = { role: 'anon' };

let passed = 0;
let failed = 0;

function check(condition, message, detail) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.error(`  ❌ ${message}${detail !== undefined ? ` — got ${JSON.stringify(detail)}` : ''}`);
  }
}

async function rejects(promise, pattern, message) {
  try {
    await promise;
    check(false, message, 'no error');
  } catch (err) {
    check(pattern.test(err.message), message, err.message);
  }
}

const one = async (db, sql, params = []) => (await db.query(sql, params)).rows[0];

async function main() {
  console.log('\n🧪 Sales & RevOps database verification (PGlite + Supabase shim)\n');

  const db = await createSupabaseShim();
  await applyMigrations(db);
  await applySeed(db);
  check(true, 'All migrations and the persona seed apply cleanly');

  // A second rep so round-robin has someone to rotate to.
  await db.exec(`
    INSERT INTO auth.users (id, email, raw_app_meta_data) VALUES ('${REP2}', 'sales2@infrivasolutions.com', '{}');
    INSERT INTO user_profiles (id, org_id, role, full_name, email, phone_e164)
    VALUES ('${REP2}', '${ORG_HQ}', 'SALES_REP', 'Neha Gupta (Sales)', 'sales2@infrivasolutions.com', '919811122233');
  `);

  console.log('\n[1] Auth claims & profile guard');
  const synced = await one(db, `SELECT raw_app_meta_data FROM auth.users WHERE id = $1`, [REP2]);
  check(synced.raw_app_meta_data.user_role === 'SALES_REP', 'Profile insert syncs user_role into auth app_metadata', synced.raw_app_meta_data);

  const roleSeen = await asUser(db, asRep, (tx) => one(tx, `SELECT get_user_role() AS r, get_user_org_id() AS o`));
  check(roleSeen.r === 'SALES_REP' && roleSeen.o === ORG_HQ, 'RLS helpers read role/org from app_metadata', roleSeen);

  await rejects(
    asUser(db, asRep, (tx) => tx.query(`UPDATE user_profiles SET role = 'MD_CEO' WHERE id = $1`, [REP])),
    /Only the MD\/CEO/,
    'A rep cannot promote themselves to MD_CEO'
  );
  await asUser(db, asRep, (tx) => tx.query(`UPDATE user_profiles SET full_name = 'Rohan S.' WHERE id = $1`, [REP]));
  check((await one(db, `SELECT full_name FROM user_profiles WHERE id = $1`, [REP])).full_name === 'Rohan S.', 'A rep can still edit their own name');

  console.log('\n[2] Lead intake, round-robin & SLA');
  await rejects(
    asUser(db, asAnon, (tx) => tx.query(`INSERT INTO leads (full_name, email) VALUES ('Spam', 'spam@x.com')`)),
    /row-level security/,
    'Anonymous clients can no longer insert leads directly'
  );

  const inserted = [];
  for (let i = 0; i < 4; i++) {
    const row = await asUser(db, asService, (tx) =>
      one(tx, `INSERT INTO leads (source_channel, full_name, email, phone_e164)
               VALUES ('WEBSITE_FORM', $1, $2, $3)
               RETURNING id, assigned_rep_id, sla_first_response_due_at, created_at`,
        [`Lead ${i}`, `lead${i}@example.com`, `91987654${String(3200 + i)}`])
    );
    inserted.push(row);
  }
  const reps = inserted.map((r) => r.assigned_rep_id);
  check(new Set(reps).size === 2 && reps[0] !== reps[1] && reps[0] === reps[2], 'New leads rotate across active reps', reps);

  const slaMinutes = (new Date(inserted[0].sla_first_response_due_at) - new Date(inserted[0].created_at)) / 60000;
  check(Math.round(slaMinutes) === 5, 'First-response SLA defaults to 5 minutes', slaMinutes);

  await rejects(
    asUser(db, asService, (tx) => tx.query(`INSERT INTO leads (full_name, phone_e164) VALUES ('Bad', '911234567890')`)),
    /leads_phone_e164_format/,
    'Non-mobile numbers are rejected by the E.164 check'
  );
  await rejects(
    asUser(db, asService, (tx) => tx.query(`INSERT INTO leads (full_name) VALUES ('Nobody')`)),
    /leads_contact_present/,
    'A lead needs an email or a phone'
  );

  const inquiryLog = await one(db, `SELECT count(*)::int AS n FROM lead_activities WHERE lead_id = $1 AND activity_type IN ('INQUIRY','ASSIGNMENT')`, [inserted[0].id]);
  check(inquiryLog.n === 2, 'Intake + assignment are logged on the lead timeline', inquiryLog);

  const visible = await asUser(db, asClient, (tx) => one(tx, `SELECT count(*)::int AS n FROM leads`));
  check(visible.n === 0, 'Clients see zero leads', visible);
  const repVisible = await asUser(db, asRep, (tx) => one(tx, `SELECT count(*)::int AS n FROM leads`));
  check(repVisible.n === 4, 'Reps see the lead pool', repVisible);

  console.log('\n[3] Notes, calls & roll-ups');
  const leadId = inserted[0].id;
  await asUser(db, asRep, (tx) =>
    tx.query(`INSERT INTO lead_activities (lead_id, actor_id, activity_type, body) VALUES ($1, $2, 'NOTE', 'Wants a booking engine')`, [leadId, REP])
  );
  await rejects(
    asUser(db, asRep, (tx) =>
      tx.query(`INSERT INTO lead_activities (lead_id, actor_id, activity_type, body) VALUES ($1, $2, 'NOTE', 'spoof')`, [leadId, REP2])
    ),
    /row-level security/,
    'Reps cannot write notes as someone else'
  );

  const call = await asUser(db, asRep, (tx) =>
    one(tx, `INSERT INTO sales_call_logs (lead_id, rep_id, call_sid, call_status) VALUES ($1, $2, 'exo_sid_1', 'in-progress') RETURNING id`, [leadId, REP])
  );
  let lead = await one(db, `SELECT total_calls_made, first_responded_at, stage FROM leads WHERE id = $1`, [leadId]);
  check(lead.total_calls_made === 1 && lead.first_responded_at !== null && lead.stage === 'NEW', 'Dialling counts a call and stops the SLA clock', lead);

  await asUser(db, asService, (tx) =>
    tx.query(`UPDATE sales_call_logs SET call_status = 'completed', duration_seconds = 94, recording_url = 'https://rec' WHERE id = $1`, [call.id])
  );
  lead = await one(db, `SELECT stage FROM leads WHERE id = $1`, [leadId]);
  check(lead.stage === 'CONTACTED', 'A connected call moves NEW → CONTACTED', lead);

  await asUser(db, asService, (tx) => tx.query(`UPDATE leads SET stage = 'QUALIFIED' WHERE id = $1`, [leadId]));
  const call2 = await asUser(db, asRep, (tx) =>
    one(tx, `INSERT INTO sales_call_logs (lead_id, rep_id, call_sid, call_status) VALUES ($1, $2, 'exo_sid_2', 'in-progress') RETURNING id`, [leadId, REP])
  );
  await asUser(db, asService, (tx) => tx.query(`UPDATE sales_call_logs SET call_status = 'completed', duration_seconds = 30 WHERE id = $1`, [call2.id]));
  lead = await one(db, `SELECT stage, total_calls_made FROM leads WHERE id = $1`, [leadId]);
  check(lead.stage === 'QUALIFIED' && lead.total_calls_made === 2, 'Later calls never move a lead backwards', lead);

  console.log('\n[4] Follow-ups');
  const due = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
  await asUser(db, asRep, (tx) =>
    tx.query(`INSERT INTO follow_up_reminders (lead_id, rep_id, scheduled_at, message_note) VALUES ($1, $2, $3, 'Send case study')`, [leadId, REP, due])
  );
  lead = await one(db, `SELECT next_follow_up_at FROM leads WHERE id = $1`, [leadId]);
  check(new Date(lead.next_follow_up_at).toISOString() === due, 'Scheduling a follow-up sets next_follow_up_at', lead);

  console.log('\n[5] Quotation approval workflow');
  const items = JSON.stringify([
    { description: 'Next.js 16 marketing site', qty: 1, unit_price_inr: 80000 },
    { description: 'Supabase CRM module', qty: 2, unit_price_inr: 45000 },
  ]);
  const quote = await asUser(db, asRep, (tx) =>
    one(tx, `INSERT INTO quotations (lead_id, created_by, service_items, discount_inr, subtotal_inr, total_inr)
             VALUES ($1, $2, $3::jsonb, 10000, 1, 1)
             RETURNING id, quote_number, status, subtotal_inr, tax_inr, total_inr`, [leadId, REP, items])
  );
  check(
    Number(quote.subtotal_inr) === 170000 && Number(quote.tax_inr) === 28800 && Number(quote.total_inr) === 188800,
    'Totals are computed server-side (client totals ignored): 1.7L − 10k + 18% GST',
    quote
  );
  check(/^INF-Q-\d{4}-\d{4}$/.test(quote.quote_number) && quote.status === 'DRAFT', 'Quote number is generated and the quote starts as DRAFT', quote);

  await rejects(
    asUser(db, asRep, (tx) => tx.query(`UPDATE quotations SET status = 'APPROVED' WHERE id = $1`, [quote.id])),
    /cannot move from DRAFT to APPROVED/,
    'A rep cannot jump a draft straight to APPROVED'
  );
  await asUser(db, asRep, (tx) => tx.query(`UPDATE quotations SET status = 'PENDING_APPROVAL' WHERE id = $1`, [quote.id]));
  await rejects(
    asUser(db, asRep, (tx) => tx.query(`UPDATE quotations SET status = 'APPROVED' WHERE id = $1`, [quote.id])),
    /Only the MD\/CEO/,
    'A rep cannot approve their own quote'
  );
  await asUser(db, asMd, (tx) => tx.query(`UPDATE quotations SET status = 'APPROVED', review_note = 'OK at this price' WHERE id = $1`, [quote.id]));
  const approved = await one(db, `SELECT q.status, q.reviewed_by, l.stage FROM quotations q JOIN leads l ON l.id = q.lead_id WHERE q.id = $1`, [quote.id]);
  check(approved.status === 'APPROVED' && approved.reviewed_by === MD && approved.stage === 'QUOTED', 'MD approval stamps the reviewer and moves the lead to QUOTED', approved);

  await asUser(db, asRep, (tx) =>
    tx.query(`UPDATE quotations SET discount_inr = 20000 WHERE id = $1`, [quote.id])
  );
  const reset = await one(db, `SELECT status, reviewed_by FROM quotations WHERE id = $1`, [quote.id]);
  check(reset.status === 'DRAFT' && reset.reviewed_by === null, 'Changing the price after approval sends the quote back to DRAFT', reset);

  await asUser(db, asRep, (tx) => tx.query(`UPDATE quotations SET status = 'PENDING_APPROVAL' WHERE id = $1`, [quote.id]));
  await asUser(db, asMd, (tx) => tx.query(`UPDATE quotations SET status = 'APPROVED' WHERE id = $1`, [quote.id]));
  await asUser(db, asRep, (tx) => tx.query(`UPDATE quotations SET status = 'ACCEPTED' WHERE id = $1`, [quote.id]));

  const won = await one(db, `
    SELECT l.stage, l.converted_org_id, q.client_org_id,
           (SELECT count(*)::int FROM projects p WHERE p.source_lead_id = l.id) AS projects,
           (SELECT count(*)::int FROM engineering_tasks t JOIN projects p ON p.id = t.project_id WHERE p.source_lead_id = l.id) AS tasks
    FROM quotations q JOIN leads l ON l.id = q.lead_id WHERE q.id = $1`, [quote.id]);
  check(
    won.stage === 'WON' && won.projects === 1 && won.tasks === 6 && won.converted_org_id && won.client_org_id === won.converted_org_id,
    'A rep marking the quote ACCEPTED wins the lead and provisions org + project + 6 tasks under RLS',
    won
  );

  await rejects(
    asUser(db, asRep, (tx) => tx.query(`UPDATE quotations SET notes = 'tweak' WHERE id = $1`, [quote.id])),
    /closed/,
    'Accepted quotations are read-only'
  );

  await asUser(db, asMd, (tx) => tx.query(`UPDATE leads SET stage = 'LOST' WHERE id = $1`, [leadId]));
  await asUser(db, asMd, (tx) => tx.query(`UPDATE leads SET stage = 'WON' WHERE id = $1`, [leadId]));
  const projectsAfter = await one(db, `SELECT count(*)::int AS n FROM projects WHERE source_lead_id = $1`, [leadId]);
  check(projectsAfter.n === 1, 'WON → LOST → WON does not create a second project', projectsAfter);

  const timeline = await one(db, `SELECT count(*)::int AS n FROM lead_activities WHERE lead_id = $1 AND activity_type = 'QUOTE'`, [leadId]);
  check(timeline.n >= 6, 'Every quote transition lands on the lead timeline', timeline);

  console.log('\n[6] Assignment controls');
  await asUser(db, asService, (tx) => tx.query(`UPDATE user_profiles SET is_active = FALSE WHERE role = 'SALES_REP'`));
  const orphan = await asUser(db, asService, (tx) =>
    one(tx, `INSERT INTO leads (full_name, email) VALUES ('Orphan', 'orphan@example.com') RETURNING id, assigned_rep_id`)
  );
  check(orphan.assigned_rep_id === null, 'With no active reps a lead stays unassigned (not dropped)', orphan);
  await asUser(db, asService, (tx) => tx.query(`UPDATE user_profiles SET is_active = TRUE WHERE role = 'SALES_REP'`));

  await rejects(
    asUser(db, asRep, (tx) => tx.query(`SELECT distribute_unassigned_leads()`)),
    /Only the MD\/CEO/,
    'Only the MD can bulk-assign unassigned leads'
  );
  const distributed = await asUser(db, asMd, (tx) => one(tx, `SELECT distribute_unassigned_leads() AS n`));
  check(distributed.n === 1, 'MD bulk-assign picks up the orphan lead', distributed);
  await rejects(
    asUser(db, asRep, (tx) => tx.query(`SELECT pick_next_sales_rep()`)),
    /permission denied/,
    'pick_next_sales_rep() is not callable through the API'
  );

  console.log('\n[7] Cross-module RLS hardening');
  const proj = await one(db, `
    INSERT INTO projects (client_org_id, name, service_tier) VALUES ('${ORG_CLIENT}', 'FlyingLyte SMM', 'SOCIAL_MEDIA_MGMT') RETURNING id`);
  const cal = await one(db, `
    INSERT INTO content_calendars (project_id, target_month, status) VALUES ($1, date_trunc('month', now())::date, 'PENDING_CLIENT_APPROVAL') RETURNING id`, [proj.id]);
  const post = await one(db, `
    INSERT INTO social_posts (calendar_id, project_id, caption) VALUES ($1, $2, 'Original caption') RETURNING id`, [cal.id, proj.id]);
  await asUser(db, asClient, (tx) =>
    tx.query(`UPDATE social_posts SET caption = 'hacked', approval_status = 'APPROVED', client_feedback = 'Looks great' WHERE id = $1`, [post.id])
  );
  const postAfter = await one(db, `SELECT caption, approval_status, client_feedback FROM social_posts WHERE id = $1`, [post.id]);
  check(postAfter.caption === 'Original caption' && postAfter.approval_status === 'APPROVED', 'Clients can approve posts but not rewrite captions', postAfter);
  await rejects(
    asUser(db, asClient, (tx) => tx.query(`DELETE FROM social_posts WHERE id = $1 RETURNING id`, [post.id]).then((r) => { if (r.rows.length) throw new Error('deleted'); throw new Error('row-level security: nothing deleted'); })),
    /row-level security/,
    'Clients cannot delete social posts'
  );
  const devTasks = await asUser(db, asDev, (tx) => one(tx, `SELECT count(*)::int AS n FROM engineering_tasks`));
  check(devTasks.n >= 6, 'Developers see provisioned engineering tasks', devTasks);

  console.log('\n[8] Upgrade path from the legacy website `leads` table');
  const legacyDb = await createSupabaseShim();
  await legacyDb.exec(`
    CREATE TABLE public.leads (
      id BIGSERIAL PRIMARY KEY, name TEXT, company TEXT, email TEXT, phone TEXT, service TEXT,
      budget TEXT, details TEXT, platform TEXT, sender_id TEXT, message TEXT, created_at TIMESTAMPTZ DEFAULT now()
    );
    INSERT INTO public.leads (name, email, phone, service, created_at) VALUES
      ('Asha Rao', 'asha@raoexports.com', '+91 98100 11111', 'Custom CRM', now() - interval '20 days'),
      ('Asha R', 'ASHA@raoexports.com', '9810011111', 'SEO', now() - interval '2 days'),
      ('Typo Phone', 'typo@example.com', '12345', 'Paid ads', now() - interval '5 days');
    INSERT INTO public.leads (platform, sender_id, message) VALUES ('instagram', 'ig_123', 'price?');
  `);
  await applyMigrations(legacyDb);
  await applySeed(legacyDb);
  const legacyCount = await one(legacyDb, `SELECT count(*)::int AS n FROM leads_legacy`);
  check(legacyCount.n === 4, 'Legacy table is preserved intact as leads_legacy', legacyCount);
  const imported = (await legacyDb.query(`SELECT full_name, email, phone_e164, interested_service, first_responded_at IS NOT NULL AS responded FROM leads ORDER BY full_name`)).rows;
  check(imported.length === 2, 'Valid legacy rows are imported once (duplicate email merged, DM-only row skipped)', imported);
  check(imported.find((r) => r.email === 'asha@raoexports.com')?.interested_service === 'FULL_STACK_SEO_GEO', 'The most recent enquiry wins on merge', imported);
  check(imported.every((r) => r.responded), 'Imported history does not trigger SLA alarms', imported);
  await legacyDb.query(`INSERT INTO leads_legacy (platform, sender_id, message) VALUES ('messenger', 'm_1', 'hi')`);
  check(true, 'The chatbot can keep logging DM leads into leads_legacy');
  const distributedLegacy = await asUser(legacyDb, asMd, (tx) => one(tx, `SELECT distribute_unassigned_leads() AS n`));
  check(distributedLegacy.n === 2, 'MD can hand imported (pre-rep) leads out round-robin', distributedLegacy);

  console.log(`\n${failed === 0 ? '🎯' : '💥'} ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('\n💥 Verification aborted:', err);
  process.exit(1);
});
