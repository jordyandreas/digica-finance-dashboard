/**
 * One-time cleanup: rewrite participants.phone / friend_phone to E.164.
 *
 * Usage:
 *   pnpm normalize-participant-phones
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (loaded from .env.local via --env-file).
 *
 * Dry run (no writes):
 *   pnpm normalize-participant-phones -- --dry-run
 */

import { createAdminClient } from "../src/lib/supabase-admin";
import { toE164Phone } from "../src/utils/phone";

type ParticipantPhoneRow = {
  id: string;
  phone: string | null;
  friend_phone: string | null;
};

const dryRun = process.argv.includes("--dry-run");

function normalizeField(
  raw: string | null,
): { next: string | null; skipped: boolean; reason?: string } {
  if (raw == null || !raw.trim()) {
    return { next: raw, skipped: true, reason: "empty" };
  }

  const e164 = toE164Phone(raw);
  if (!e164) {
    return { next: raw, skipped: true, reason: "invalid" };
  }

  if (e164 === raw.trim()) {
    return { next: raw, skipped: true, reason: "already-e164" };
  }

  return { next: e164, skipped: false };
}

async function fetchAllParticipantPhones(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<ParticipantPhoneRow[]> {
  const pageSize = 1000;
  const rows: ParticipantPhoneRow[] = [];
  let from = 0;

  for (;;) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("participants")
      .select("id, phone, friend_phone")
      .order("id", { ascending: true })
      .range(from, to);

    if (error) {
      throw error;
    }

    const page = (data ?? []) as ParticipantPhoneRow[];
    rows.push(...page);

    if (page.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return rows;
}

async function main() {
  const supabase = createAdminClient();
  const rows = await fetchAllParticipantPhones(supabase);
  let updated = 0;
  let skipped = 0;
  let invalid = 0;

  for (const row of rows) {
    const phoneResult = normalizeField(row.phone);
    const friendResult = normalizeField(row.friend_phone);

    if (phoneResult.reason === "invalid") {
      invalid += 1;
      console.warn(`[invalid phone] id=${row.id} value=${JSON.stringify(row.phone)}`);
    }
    if (friendResult.reason === "invalid") {
      invalid += 1;
      console.warn(
        `[invalid friend_phone] id=${row.id} value=${JSON.stringify(row.friend_phone)}`,
      );
    }

    const phoneChanged = !phoneResult.skipped;
    const friendChanged = !friendResult.skipped;

    if (!phoneChanged && !friendChanged) {
      skipped += 1;
      continue;
    }

    const patch: { phone?: string; friend_phone?: string | null } = {};
    if (phoneChanged && phoneResult.next) {
      patch.phone = phoneResult.next;
    }
    if (friendChanged) {
      patch.friend_phone = friendResult.next;
    }

    console.log(
      `[${dryRun ? "dry-run" : "update"}] id=${row.id}`,
      phoneChanged
        ? `phone: ${JSON.stringify(row.phone)} -> ${JSON.stringify(patch.phone)}`
        : null,
      friendChanged
        ? `friend_phone: ${JSON.stringify(row.friend_phone)} -> ${JSON.stringify(patch.friend_phone)}`
        : null,
    );

    if (!dryRun) {
      const { error: updateError } = await supabase
        .from("participants")
        .update(patch)
        .eq("id", row.id);

      if (updateError) {
        console.error(`[failed] id=${row.id}`, updateError.message);
        continue;
      }
    }

    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        total: rows.length,
        updated,
        skipped,
        invalid,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
